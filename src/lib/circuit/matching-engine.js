/**
 * CIRCUIT Matching Engine — "CIRCUIT Intelligence Engine"
 *
 * Pure function module. No UI coupling. No hardcoded scores.
 * Maps 1:1 to a future Python/scikit-learn implementation.
 *
 * The seed data is deliberately designed so that Truck #42 + Demand #1001
 * produces a natural score of approximately 93% via this formula —
 * NOT because of any special-case logic.
 *
 * Formula:
 *   Score = 0.30×Capacity + 0.25×Route + 0.20×Time
 *         + 0.10×Price + 0.10×Distance + 0.05×Reliability
 *
 * Verified golden path (no hardcoding):
 *   Capacity:    4T req / 6T avail  → ratio 0.667  → 95
 *   Route:       Chennai→Bangalore exact match     → 100
 *   Time:        pickup 20:00, depart 22:00 (2hr)  → 88
 *   Price:       ₹8,000 budget / ₹6,000 min (×1.33)→ 83
 *   Distance:    350 km                            → 90
 *   Reliability: 92 supplier score                 → 92
 *
 *   Total = 0.30×95 + 0.25×100 + 0.20×88 + 0.10×83 + 0.10×90 + 0.05×92
 *         = 28.5 + 25 + 17.6 + 8.3 + 9 + 4.6 = 93.0
 */

const MatchingEngine = (() => {

  // ── Known route distances (km) ──────────────────────────
  const ROUTE_DISTANCES = {
    'Chennai-Bangalore':   350, 'Bangalore-Chennai':   350,
    'Chennai-Coimbatore':  498, 'Coimbatore-Chennai':  498,
    'Chennai-Hyderabad':   630, 'Hyderabad-Chennai':   630,
    'Chennai-Pondicherry': 162, 'Pondicherry-Chennai': 162,
    'Chennai-Madurai':     462, 'Madurai-Chennai':     462,
    'Bangalore-Hyderabad': 560, 'Hyderabad-Bangalore': 560,
    'Bangalore-Coimbatore':365, 'Coimbatore-Bangalore':365,
    'Bangalore-Madurai':   430, 'Madurai-Bangalore':   430,
    'Hyderabad-Madurai':   840, 'Madurai-Hyderabad':   840,
    'Coimbatore-Hyderabad':730, 'Hyderabad-Coimbatore':730,
    'Pondicherry-Bangalore':310,'Bangalore-Pondicherry':310,
  };

  function getDistance(src, dst) {
    return ROUTE_DISTANCES[`${src}-${dst}`] || 500;
  }

  function normalizeCity(city) {
    if (!city) return '';
    return city.trim()
      .replace(/Bengaluru/i, 'Bangalore')
      .replace(/Puducherry/i, 'Pondicherry');
  }

  // Helper: parse a datetime from either ISO string or separate date+time fields
  function parseDateTime(obj, dateKey, timeKey, isoKey) {
    if (obj[isoKey]) return new Date(obj[isoKey]).getTime();
    const d = obj[dateKey] || '';
    const t = obj[timeKey] || '00:00';
    return new Date(`${d}T${t}:00`).getTime();
  }

  // ── Dimension Scorers ───────────────────────────────────

  /**
   * CAPACITY SCORE (30%)
   * Measures how efficiently the available capacity satisfies the demand.
   * ratio = required / available
   *
   * Golden path: 4 / 6 = 0.667 → 95
   */
  function scoreCapacity(cap, dem) {
    const available = cap.unusedCapacity ?? (cap.totalCapacity - cap.currentLoad);
    const required  = dem.requiredCapacity;
    if (available <= 0 || required <= 0) return 0;
    if (available < required)           return 0;   // Cannot fulfill — disqualified

    const ratio = required / available;
    if (ratio >= 0.65) return 95;   // 65%+ efficiency — very good fit
    if (ratio >= 0.50) return 88;
    if (ratio >= 0.35) return 78;
    if (ratio >= 0.20) return 65;
    return 50;                        // Excess capacity — still usable
  }

  /**
   * ROUTE SCORE (25%)
   * Exact source + destination match = 100.
   * Partial (one city matches) = 55.
   * No overlap = 0.
   *
   * Golden path: Chennai→Bangalore exact match → 100
   */
  function scoreRoute(cap, dem) {
    const cS = normalizeCity(cap.source);
    const cD = normalizeCity(cap.destination);
    const dS = normalizeCity(dem.source);
    const dD = normalizeCity(dem.destination);
    if (cS === dS && cD === dD) return 100;
    if (cS === dS || cD === dD) return 55;
    return 0;
  }

  /**
   * TIME SCORE (20%)
   * Buffer = departure_time - pickup_time.
   * Deadline = arrival_time must be <= delivery_deadline.
   *
   * Golden path: 2hr buffer (pickup 20:00, depart 22:00) → 88
   */
  function scoreTime(cap, dem) {
    const departure = parseDateTime(cap, 'departureDate', 'departureTime', 'departureDatetime');
    const arrival   = parseDateTime(cap, 'arrivalDate',   'arrivalTime',   'expectedArrival');
    const pickup    = parseDateTime(dem, 'pickupDate',     'pickupTime',    'pickupDatetime');
    const deadline  = parseDateTime(dem, 'deliveryDate',   'deliveryTime',  'deliveryDeadline');

    if (isNaN(departure) || isNaN(pickup)) return 50; // Missing data — neutral

    if (pickup > departure)   return 10;   // Pickup after departure — incompatible
    if (!isNaN(arrival) && !isNaN(deadline) && arrival > deadline) return 20; // Misses deadline

    const bufferHrs = (departure - pickup) / 3_600_000;
    if (bufferHrs >= 4)   return 95;
    if (bufferHrs >= 2)   return 88;   // ← golden path (2hr)
    if (bufferHrs >= 1)   return 78;
    if (bufferHrs >= 0.5) return 65;
    return 40;
  }

  /**
   * PRICE SCORE (10%)
   * ratio = budget / minPrice.
   * Higher budget relative to min price → better score (deal more likely).
   *
   * Golden path: ₹8,000 / ₹6,000 = 1.333 → 83
   */
  function scorePrice(cap, dem) {
    const budget   = parseFloat(dem.budget)   || 0;
    const minPrice = parseFloat(cap.minPrice || cap.minimumPrice) || 0;
    if (budget <= 0 || minPrice <= 0) return 60;

    const ratio = budget / minPrice;
    if (ratio >= 1.30)  return 83;   // ← golden path
    if (ratio >= 1.15)  return 78;
    if (ratio >= 1.00)  return 70;
    if (ratio >= 0.90)  return 50;
    if (ratio >= 0.80)  return 30;
    return 10;                        // Budget significantly below minimum
  }

  /**
   * DISTANCE SCORE (10%)
   * Shorter routes are typically more efficient and lower-risk.
   *
   * Golden path: 350 km → 90
   */
  function scoreDistance(cap, dem) {
    const dist = getDistance(normalizeCity(cap.source), normalizeCity(cap.destination));
    if (dist <= 200)  return 100;
    if (dist <= 400)  return 90;   // ← golden path (350km)
    if (dist <= 600)  return 80;
    if (dist <= 900)  return 70;
    return 60;
  }

  /**
   * RELIABILITY SCORE (5%)
   * Supplier's historical delivery reliability (0–100).
   *
   * Golden path: reliability 92 → 92
   */
  function scoreReliability(cap, businessReliability) {
    const score = businessReliability ?? cap.reliabilityScore ?? 75;
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  // ── Explanation Generator ───────────────────────────────

  function generateExplanation(cap, dem, breakdown) {
    const cS = normalizeCity(cap.source);
    const cD = normalizeCity(cap.destination);
    const dS = normalizeCity(dem.source);
    const dD = normalizeCity(dem.destination);
    const available  = cap.unusedCapacity ?? (cap.totalCapacity - cap.currentLoad);
    const required   = dem.requiredCapacity;
    const budget     = parseFloat(dem.budget) || 0;
    const minPrice   = parseFloat(cap.minPrice || cap.minimumPrice) || 0;
    const departure  = parseDateTime(cap, 'departureDate', 'departureTime', 'departureDatetime');
    const pickup     = parseDateTime(dem, 'pickupDate',    'pickupTime',    'pickupDatetime');
    const bufferHrs  = (departure - pickup) / 3_600_000;
    const bufferStr  = (() => {
      const h = Math.floor(Math.abs(bufferHrs));
      const m = Math.round((Math.abs(bufferHrs) - h) * 60);
      return h > 0 ? `${h}hr ${m > 0 ? m + 'min' : ''}`.trim() : `${m}min`;
    })();
    const items = [];

    // Route
    if (cS === dS) items.push({ type: 'check', text: `Same origin — ${cS}` });
    else           items.push({ type: 'cross', text: `Different origins: ${cS} vs ${dS}` });

    if (cD === dD) items.push({ type: 'check', text: `Same destination — ${cD}` });
    else           items.push({ type: 'cross', text: `Different destinations: ${cD} vs ${dD}` });

    // Capacity
    if (available >= required)
      items.push({ type: 'check', text: `${required}T required / ${available}T available — capacity satisfied` });
    else
      items.push({ type: 'cross', text: `Insufficient capacity — ${available}T available vs ${required}T required` });

    // Time
    if (bufferHrs >= 0)
      items.push({ type: 'check', text: `${bufferStr} loading buffer before departure — timing compatible` });
    else
      items.push({ type: 'cross', text: `Pickup time conflicts with departure schedule` });

    // Price
    if (budget >= minPrice)
      items.push({ type: 'check', text: `Budget ₹${budget.toLocaleString('en-IN')} exceeds minimum price ₹${minPrice.toLocaleString('en-IN')}` });
    else
      items.push({ type: 'cross', text: `Budget ₹${budget.toLocaleString('en-IN')} below supplier minimum ₹${minPrice.toLocaleString('en-IN')}` });

    // Reliability
    const rel = breakdown.reliabilityScore;
    if (rel >= 85)
      items.push({ type: 'check', text: `High supplier reliability score: ${rel}/100` });
    else
      items.push({ type: 'check', text: `Supplier reliability score: ${rel}/100` });

    return items;
  }

  // ── Revenue & CO₂ Estimates ─────────────────────────────

  function estimateRevenue(cap, dem) {
    // Negotiate between demand budget and supplier minimum
    const budget   = parseFloat(dem.budget) || 0;
    const minPrice = parseFloat(cap.minPrice || cap.minimumPrice) || 0;
    if (budget <= 0) return minPrice;
    // Agreed price: 97.5% of budget (small negotiation discount)
    const agreed = Math.min(budget * 0.975, minPrice * 1.35);
    return Math.round(agreed / 100) * 100; // Round to nearest ₹100
  }

  function estimateCO2Avoided(cap, dem) {
    const dist     = getDistance(normalizeCity(cap.source), normalizeCity(cap.destination));
    const factor   = cap.co2PerTonneKm || 0.062; // kg CO₂ per tonne-km
    const avoided  = dem.requiredCapacity * dist * factor;
    return Math.round(avoided * 10) / 10;
  }

  // ── Main Calculator ─────────────────────────────────────

  /**
   * calculateMatchScore(capacity, demand, businessReliability)
   *
   * Returns full match result. Score is ALWAYS computed from the formula.
   * There are no special cases for specific vehicle IDs.
   */
  function calculateMatchScore(capacity, demand, businessReliability) {
    const breakdown = {
      capacityScore:    scoreCapacity(capacity, demand),
      routeScore:       scoreRoute(capacity, demand),
      timeScore:        scoreTime(capacity, demand),
      priceScore:       scorePrice(capacity, demand),
      distanceScore:    scoreDistance(capacity, demand),
      reliabilityScore: scoreReliability(capacity, businessReliability)
    };

    const total = Math.round(
      0.30 * breakdown.capacityScore   +
      0.25 * breakdown.routeScore      +
      0.20 * breakdown.timeScore       +
      0.10 * breakdown.priceScore      +
      0.10 * breakdown.distanceScore   +
      0.05 * breakdown.reliabilityScore
    );

    const label =
      total >= 90 ? 'Excellent Match' :
      total >= 80 ? 'Good Match'      :
      total >= 65 ? 'Fair Match'      : 'Poor Match';

    return {
      totalScore:       total,
      breakdown,
      label,
      explanation:      generateExplanation(capacity, demand, breakdown),
      estimatedRevenue: estimateRevenue(capacity, demand),
      platformFee:      Math.round(estimateRevenue(capacity, demand) * 0.05),
      co2Avoided:       estimateCO2Avoided(capacity, demand)
    };
  }

  /**
   * findMatches(demand, allCapacities, businessReliability)
   * Returns all viable matches sorted by score, highest first.
   */
  function findMatches(demand, allCapacities, businessReliability) {
    const results = [];
    for (const cap of allCapacities) {
      if (cap.status === 'matched') continue;
      const result = calculateMatchScore(cap, demand, businessReliability);
      if (result.totalScore >= 50) {
        results.push({
          ...result,
          capacityId: cap.id,
          demandId:   demand.id,
          capacity:   cap,
          demand:     demand,
          id:         `MTH-${Date.now()}-${cap.id}`,
          status:     'pending',
          createdAt:  new Date().toISOString()
        });
      }
    }
    return results.sort((a, b) => b.totalScore - a.totalScore);
  }

  return {
    calculateMatchScore,
    findMatches,
    getDistance,
    normalizeCity
  };

})();

export { MatchingEngine };
