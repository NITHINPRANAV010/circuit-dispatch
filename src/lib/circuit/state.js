import { DEMO_DATA } from "./data.js";
import { MatchingEngine } from "./matching-engine.js";
import { OpportunityPredictor } from "./opportunity-predictor.js";

/**
 * CIRCUIT Global State — Mock Backend Layer
 *
 * Every public method maps 1:1 to a future REST API endpoint.
 * Replace method bodies with fetch() calls to migrate to a real backend.
 *
 * STATE PERSISTENCE
 * All mutations are saved to localStorage immediately.
 * On init(), stored state is loaded before falling back to seed data.
 * Call resetDemoData() to wipe and reload the original seed state.
 */

const State = (() => {

  const STORAGE_KEY = 'circuit_v2_state';

  // ── Internal store ──────────────────────────────────────
  let _store = {
    currentUser: null,
    currentRole: 'supplier',
    capacities:  [],
    demands:     [],
    matches:     [],
    transactions: []
  };

  // ── localStorage helpers ────────────────────────────────

  function _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentUser:  _store.currentUser,
        currentRole:  _store.currentRole,
        capacities:   _store.capacities,
        demands:      _store.demands,
        matches:      _store.matches,
        transactions: _store.transactions
      }));
    } catch (e) {
      console.warn('[CIRCUIT] localStorage write failed:', e);
    }
  }

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      _store.currentUser  = data.currentUser  || null;
      _store.currentRole  = data.currentRole  || 'supplier';
      _store.capacities   = data.capacities   || [];
      _store.demands      = data.demands      || [];
      _store.matches      = data.matches      || [];
      _store.transactions = data.transactions || [];
      return true;
    } catch (e) {
      console.warn('[CIRCUIT] localStorage read failed:', e);
      return false;
    }
  }

  // ── Pub/Sub ─────────────────────────────────────────────
  const _listeners = {};

  function subscribe(event, fn) {
    (_listeners[event] = _listeners[event] || []).push(fn);
  }

  function emit(event, data) {
    (_listeners[event] || []).forEach(fn => fn(data));
  }

  // ── Initialisation ──────────────────────────────────────

  /**
   * init()
   * Load from localStorage first; fall back to seed data.
   * Running matches are re-computed from the engine (scores never stale).
   */
  function init() {
    const loaded = _load();
    if (!loaded || _store.capacities.length === 0) {
      _resetToSeed();
    } else {
      // Refresh departure datetimes in seed capacities so they're always "upcoming"
      // (only for the original seed vehicles that haven't been modified)
      _refreshSeedDatetimes();
    }
  }

  function _resetToSeed() {
    const seed = DEMO_DATA;
    _store.currentUser  = JSON.parse(JSON.stringify(seed.business));
    _store.currentRole  = 'supplier';
    _store.capacities   = JSON.parse(JSON.stringify(seed.capacities));
    _store.demands      = JSON.parse(JSON.stringify(seed.demands));
    _store.matches      = [];
    _store.transactions = JSON.parse(JSON.stringify(seed.transactions));
    _save();
  }

  /**
   * For the original 5 seed capacities, refresh their datetimes to
   * "relative to now" so the app always looks live.
   */
  function _refreshSeedDatetimes() {
    const seedIds = ['CAP-042', 'CAP-018', 'CAP-027', 'CAP-009', 'CAP-051'];
    const fresh   = DEMO_DATA.capacities;
    seedIds.forEach((id, i) => {
      const existing = _store.capacities.find(c => c.id === id);
      const freshCap = fresh[i];
      if (existing && freshCap && existing.status !== 'matched') {
        // Update datetimes but preserve user-modified fields (status, etc.)
        existing.departureDatetime = freshCap.departureDatetime;
        existing.expectedArrival   = freshCap.expectedArrival;
        existing.departureDate     = freshCap.departureDate;
        existing.departureTime     = freshCap.departureTime;
        existing.arrivalDate       = freshCap.arrivalDate;
        existing.arrivalTime       = freshCap.arrivalTime;
      }
    });
    // Same for demands
    const seedDemIds = ['DEM-1001', 'DEM-1002', 'DEM-1003'];
    const freshDems  = DEMO_DATA.demands;
    seedDemIds.forEach((id, i) => {
      const existing = _store.demands.find(d => d.id === id);
      const freshDem = freshDems[i];
      if (existing && freshDem && existing.status === 'searching') {
        existing.pickupDatetime  = freshDem.pickupDatetime;
        existing.deliveryDeadline= freshDem.deliveryDeadline;
        existing.pickupDate      = freshDem.pickupDate;
        existing.pickupTime      = freshDem.pickupTime;
        existing.deliveryDate    = freshDem.deliveryDate;
        existing.deliveryTime    = freshDem.deliveryTime;
      }
    });
    _save();
  }

  /**
   * resetDemoData()
   * Wipes all state and reloads seed data.
   * Use this to reset the app to a clean demo state.
   */
  function resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    _resetToSeed();
    emit('state:reset', null);
  }

  // ── Auth ─────────────────────────────────────────────────

  /** POST /auth/login | /auth/register */
  function login(email, password, name, type) {
    _store.currentUser = {
      id:               'BIZ-001',
      name:             name  || DEMO_DATA.business.name,
      email:            email || DEMO_DATA.business.email,
      type:             type  || DEMO_DATA.business.type,
      reliabilityScore: DEMO_DATA.business.reliabilityScore
    };
    _save();
    emit('auth:login', _store.currentUser);
    return _store.currentUser;
  }

  function logout() {
    _store.currentUser = null;
    _save();
    emit('auth:logout');
  }

  function getUser()         { return _store.currentUser; }
  function getRole()         { return _store.currentRole; }
  function setRole(role) {
    _store.currentRole = role;
    _save();
    emit('role:change', role);
  }

  // ── Capacity — POST /capacity | GET /capacity ────────────

  function addCapacity(data) {
    const dep  = `${data.departureDate}T${data.departureTime}:00`;
    const arr  = `${data.arrivalDate || data.departureDate}T${data.arrivalTime || '23:59'}:00`;
    const total = parseFloat(data.totalCapacity);
    const load  = parseFloat(data.currentLoad);
    const id    = `CAP-${String(Date.now()).slice(-6)}`;

    const capacity = {
      id,
      vehicleId:        data.vehicleId,
      vehicleType:      data.vehicleType,
      regNo:            data.regNo       || '',
      source:           data.source,
      destination:      data.destination,
      totalCapacity:    total,
      currentLoad:      load,
      unusedCapacity:   total - load,
      departureDatetime: dep,
      expectedArrival:  arr,
      departureDate:    data.departureDate,
      departureTime:    data.departureTime,
      arrivalDate:      data.arrivalDate  || data.departureDate,
      arrivalTime:      data.arrivalTime  || '23:59',
      minPrice:         parseFloat(data.minPrice),
      minimumPrice:     parseFloat(data.minPrice),
      status:           'opportunity',
      historicalUtil:   [48, 52, 44, 51, 39, 47, 46], // default pattern
      co2PerTonneKm:    0.062,
      driverName:       data.driverName  || '',
      notes:            data.notes       || '',
      createdAt:        new Date().toISOString()
    };

    _store.capacities.unshift(capacity);
    _save();
    emit('capacity:added', capacity);
    return capacity;
  }

  function getCapacities()        { return _store.capacities; }
  function getCapacityById(id)    { return _store.capacities.find(c => c.id === id); }

  function updateCapacityStatus(id, status) {
    const c = _store.capacities.find(c => c.id === id);
    if (c) { c.status = status; _save(); emit('capacity:updated', c); }
  }

  // ── Demand — POST /demand | GET /demand ──────────────────

  function addDemand(data) {
    const id = `DEM-${Math.floor(Math.random() * 9000) + 1000}`;
    const demand = {
      id,
      customerName:       _store.currentUser?.name || 'New Customer',
      cargoType:          data.cargoType,
      requiredCapacity:   parseFloat(data.requiredCapacity),
      source:             data.source,
      destination:        data.destination,
      pickupDatetime:     `${data.pickupDate}T${data.pickupTime}:00`,
      deliveryDeadline:   `${data.deliveryDate}T${data.deliveryTime}:00`,
      pickupDate:         data.pickupDate,
      pickupTime:         data.pickupTime,
      deliveryDate:       data.deliveryDate,
      deliveryTime:       data.deliveryTime,
      budget:             parseFloat(data.budget),
      specialRequirements: data.specialRequirements || '',
      status:             'searching',
      contactPerson:      data.contactPerson || _store.currentUser?.name || '',
      contactPhone:       data.contactPhone  || '',
      createdAt:          new Date().toISOString()
    };
    _store.demands.unshift(demand);
    _save();
    emit('demand:added', demand);
    return demand;
  }

  function getDemands()         { return _store.demands; }
  function getDemandById(id)    { return _store.demands.find(d => d.id === id); }

  // ── Matches — POST /matches/find | GET /matches ──────────

  /**
   * findMatches(demandId)
   * POST /matches/find
   * Calls MatchingEngine — scores are ALWAYS computed fresh.
   * Results are merged into the store (no duplicates).
   */
  function findMatches(demandId) {
    const demand      = _store.demands.find(d => d.id === demandId);
    if (!demand) return [];

    const reliability  = _store.currentUser?.reliabilityScore || 75;
    const freshResults = MatchingEngine.findMatches(demand, _store.capacities, reliability);

    // Merge: add new matches, skip if same capacityId+demandId already exists
    freshResults.forEach(r => {
      const exists = _store.matches.find(
        m => m.capacityId === r.capacityId && m.demandId === demandId && m.status === 'pending'
      );
      if (!exists) _store.matches.unshift(r);
    });

    _save();
    emit('matches:updated', _store.matches);
    return freshResults;
  }

  function getMatches()         { return _store.matches; }
  function getMatchById(id)     { return _store.matches.find(m => m.id === id); }

  // ── POST /matches/{id}/accept ────────────────────────────

  function acceptMatch(matchId) {
    const match = _store.matches.find(m => m.id === matchId);
    if (!match || match.status !== 'pending') return null;

    match.status    = 'accepted';
    match.acceptedAt = new Date().toISOString();

    updateCapacityStatus(match.capacityId, 'matched');

    const dem = _store.demands.find(d => d.id === match.demandId);
    if (dem) dem.status = 'matched';

    const cap = getCapacityById(match.capacityId);
    const txn = {
      id:          `TXN-${Math.floor(Math.random() * 9000) + 1000}`,
      vehicleId:   cap?.vehicleId    || 'Unknown',
      route:       `${cap?.source || ''} → ${cap?.destination || ''}`,
      customer:    dem?.customerName || 'Unknown Customer',
      capacity:    dem?.requiredCapacity || 0,
      amount:      match.estimatedRevenue,
      platformFee: match.platformFee,
      status:      'confirmed',
      date:        new Date().toISOString(),
      matchScore:  match.totalScore,
      matchId
    };
    _store.transactions.unshift(txn);

    _save();
    emit('match:accepted', { match, transaction: txn });
    emit('transactions:updated', _store.transactions);
    return { match, transaction: txn };
  }

  // ── POST /matches/{id}/reject ────────────────────────────

  function rejectMatch(matchId) {
    const match = _store.matches.find(m => m.id === matchId);
    if (match) { match.status = 'rejected'; _save(); emit('match:rejected', match); }
    return match;
  }

  function getTransactions()  { return _store.transactions; }

  // ── GET /analytics ────────────────────────────────────────

  function getDashboardMetrics() {
    const baseline   = DEMO_DATA.analyticsBaseline;
    const accepted   = _store.matches.filter(m => m.status === 'accepted');
    const pending    = _store.matches.filter(m => m.status === 'pending');
    const confirmed  = _store.transactions.filter(t => t.status === 'confirmed' || t.status === 'in-transit');

    const addedRev   = accepted.reduce((s, m) => s + (m.estimatedRevenue || 0), 0);
    const totalRev   = baseline.baseRevenue + addedRev;
    const addedCO2   = accepted.reduce((s, m) => s + (m.co2Avoided || 0), 0);
    const totalCO2   = Math.round((baseline.co2Avoided + addedCO2) * 10) / 10;
    const utilAfter  = Math.min(95, baseline.utilizationAfter + accepted.length * 3);

    return {
      potentialRevenue:    totalRev,
      capacityRecovered:   utilAfter - baseline.utilizationBefore,
      activeCapacity:      _store.capacities.filter(c => c.status !== 'matched').length,
      aiMatches:           pending.length + accepted.length,
      co2Avoided:          totalCO2,
      successfulMatches:   confirmed.length + accepted.length,
      utilizationBefore:   baseline.utilizationBefore,
      utilizationAfter:    utilAfter,
      platformRevenue:     Math.round(totalRev * 0.05)
    };
  }

  // ── GET /opportunities ────────────────────────────────────

  /**
   * getOpportunities()
   * Combines Capacity Opportunity Predictor output with best pending match.
   */
  function getOpportunities() {
    const copResults = OpportunityPredictor.predictAll(_store.capacities);

    return copResults.map(({ capacity: cap, prediction }) => {
      // Find the best pending match for this capacity
      const bestMatch = _store.matches
        .filter(m => m.capacityId === cap.id && m.status === 'pending')
        .sort((a, b) => b.totalScore - a.totalScore)[0];

      const estimatedRevenue = bestMatch?.estimatedRevenue
        || prediction.estimatedRevenue;

      return {
        capacity: cap,
        prediction,
        match: bestMatch || null,
        estimatedRevenue,
        matchScore: bestMatch?.totalScore || null
      };
    });
  }

  // ── Public API ────────────────────────────────────────────
  return {
    init, resetDemoData,
    subscribe, emit,
    // Auth
    login, logout, getUser, getRole, setRole,
    // Capacity
    addCapacity, getCapacities, getCapacityById, updateCapacityStatus,
    // Demand
    addDemand, getDemands, getDemandById,
    // Matches
    findMatches, getMatches, getMatchById, acceptMatch, rejectMatch,
    // Transactions
    getTransactions,
    // Analytics
    getDashboardMetrics, getOpportunities
  };

})();

export { State };
