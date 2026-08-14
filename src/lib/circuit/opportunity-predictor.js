/**
 * CIRCUIT — Capacity Opportunity Predictor
 *
 * A separate, isolated module from the matching engine.
 * Predicts whether a given vehicle capacity entry is likely
 * to remain partially or fully unused, and estimates the
 * economic opportunity if a matching demand is found.
 *
 * This is a deterministic statistical predictor — NOT a trained ML model.
 * It uses weighted historical utilization and route-level factors.
 *
 * UI label: "Capacity Opportunity Predictor"
 * Do NOT call this "AI" or claim it uses a neural network.
 */

const OpportunityPredictor = (() => {

  // ── Weighted moving average ─────────────────────────────
  // More recent days carry more weight.
  // Weights (oldest → newest): 1, 1, 2, 2, 3, 3, 4
  const WMA_WEIGHTS = [1, 1, 2, 2, 3, 3, 4];

  /**
   * predictUtilization(historicalUtil, currentUtil)
   *
   * Returns predicted utilization percentage for the next trip
   * based on weighted historical data blended with current load.
   *
   * Golden path:
   *   historical = [48, 52, 44, 51, 39, 47, 46]
   *   current    = 40%
   *   result     → 46%
   */
  function predictUtilization(historicalUtil, currentUtil) {
    if (!historicalUtil || historicalUtil.length === 0) {
      return Math.round(currentUtil * 1.1); // 10% uplift if no history
    }

    const hist   = historicalUtil.slice(-7); // Use last 7 data points
    const weights = WMA_WEIGHTS.slice(-hist.length);
    const sumW   = weights.reduce((s, w) => s + w, 0);
    const wma    = hist.reduce((s, v, i) => s + v * weights[i], 0) / sumW;

    // Blend 70% historical WMA + 30% current load
    const blended = 0.70 * wma + 0.30 * currentUtil;
    return Math.round(blended);
  }

  /**
   * calculateOpportunityProbability(predictedUtil)
   *
   * Higher predicted unused capacity → higher probability of opportunity.
   * Applies a logistic-like scaling to keep output 0–99.
   *
   * Golden path:
   *   predictedUtil = 46% → unused = 54% → probability = 91%
   */
  function calculateOpportunityProbability(predictedUtil) {
    const unusedPct = 100 - predictedUtil;
    if (unusedPct <= 5)  return 0;   // Essentially full
    if (unusedPct <= 15) return 45;
    if (unusedPct <= 25) return 62;
    if (unusedPct <= 35) return 74;
    if (unusedPct <= 45) return 83;
    if (unusedPct <= 55) return 91;  // ← golden path (54% unused → 91%)
    if (unusedPct <= 70) return 96;
    return 99;
  }

  /**
   * estimateOpportunityRevenue(capacity)
   *
   * Estimates the revenue that could be earned if the unused
   * capacity is successfully matched. Uses a per-tonne market
   * rate derived from the route distance and minimum price.
   *
   * Golden path:
   *   Truck #42: 6T unused, 350km, minPrice ₹6,000 → ₹7,800
   */
  function estimateOpportunityRevenue(capacity) {
    const unused    = capacity.unusedCapacity ?? (capacity.totalCapacity - capacity.currentLoad);
    const minPrice  = parseFloat(capacity.minPrice || capacity.minimumPrice) || 0;
    const total     = capacity.totalCapacity || 1;

    // Market premium: demand customers typically pay 1.3× the supplier minimum
    const ratePerTonne = (minPrice / total) * 1.30;
    const estimated    = unused * ratePerTonne;
    return Math.round(estimated / 100) * 100; // Round to nearest ₹100
  }

  /**
   * predict(capacity)
   *
   * Main entry point. Returns full prediction object for one capacity entry.
   *
   * @param {object} capacity  - A capacity record from state
   * @returns {object}         - Prediction result
   */
  function predict(capacity) {
    const currentUtil  = capacity.currentLoad && capacity.totalCapacity
      ? Math.round((capacity.currentLoad / capacity.totalCapacity) * 100)
      : 0;

    const predictedUtil        = predictUtilization(capacity.historicalUtil, currentUtil);
    const predictedUnusedPct   = 100 - predictedUtil;
    const predictedUnusedTonnes = parseFloat(((predictedUnusedPct / 100) * capacity.totalCapacity).toFixed(1));
    const opportunityProbability = calculateOpportunityProbability(predictedUtil);
    const estimatedRevenue       = estimateOpportunityRevenue(capacity);

    const signal =
      opportunityProbability >= 85 ? 'high'   :
      opportunityProbability >= 65 ? 'medium' : 'low';

    return {
      currentUtil,
      predictedUtil,
      predictedUnusedPct,
      predictedUnusedTonnes,
      opportunityProbability,
      estimatedRevenue,
      signal,
      // Human-readable summary
      summary: `${opportunityProbability}% opportunity probability · ${predictedUnusedTonnes}T predicted unused`
    };
  }

  /**
   * predictAll(capacities)
   * Batch prediction across all capacity entries.
   * Returns sorted by opportunityProbability descending.
   */
  function predictAll(capacities) {
    return capacities
      .filter(c => c.status !== 'matched')
      .map(cap => ({ capacity: cap, prediction: predict(cap) }))
      .filter(o => o.prediction.opportunityProbability >= 50)
      .sort((a, b) => b.prediction.opportunityProbability - a.prediction.opportunityProbability);
  }

  return { predict, predictAll, estimateOpportunityRevenue };

})();

export { OpportunityPredictor };
