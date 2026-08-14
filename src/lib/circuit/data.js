/**
 * CIRCUIT — Demo Seed Data
 *
 * All data is internally consistent.
 * The matching engine (NOT this file) computes all match scores dynamically.
 * No precomputed matches are stored here.
 *
 * Golden path verification:
 *   Truck #42 + Demand #1001 → scoring engine naturally produces ~93%
 *   (See matching-engine.js header for full calculation proof)
 *
 * Vehicle departure datetimes are set relative to "today" so the app
 * always looks current regardless of when it is opened.
 */

const DEMO_DATA = (() => {

  // Return dates relative to today so the app never looks stale
  function todayPlus(hours) {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + hours);
    return d;
  }

  function fmtISO(d) { return d.toISOString(); }

  const dep42     = todayPlus(2);    // Truck #42 departs in ~2h
  const dep42Pick = todayPlus(0);    // Demand #1001 pickup NOW → 2hr buffer

  const dep18     = todayPlus(10);
  const dep18Pick = todayPlus(9);    // 1hr buffer

  const dep27     = todayPlus(8);
  const dep27Pick = todayPlus(5);    // 3hr buffer

  const dep09     = todayPlus(16);
  const dep09Pick = todayPlus(13);

  const dep51     = todayPlus(22);
  const dep51Pick = todayPlus(20);

  return {
    business: {
      id:               'BIZ-001',
      name:             'VeloFreight Logistics',
      email:            'ops@velofreight.in',
      type:             'Logistics Provider',
      gstin:            '33AABCV1234F1Z5',
      city:             'Chennai',
      state:            'Tamil Nadu',
      joinedDate:       '2024-01-15',
      reliabilityScore: 92   // Used by reliability scorer → 92 (golden path)
    },

    capacities: [
      {
        id:               'CAP-042',
        vehicleId:        'Truck #42',
        vehicleType:      'Heavy Goods Vehicle',
        regNo:            'TN-09-AX-4271',
        source:           'Chennai',
        destination:      'Bangalore',
        totalCapacity:    10,
        currentLoad:      4,
        unusedCapacity:   6,
        // Departure in ~2h, arrival +8h after departure
        departureDatetime: fmtISO(dep42),
        expectedArrival:   fmtISO(new Date(dep42.getTime() + 8 * 3600000)),
        departureDate:    dep42.toISOString().split('T')[0],
        departureTime:    dep42.toTimeString().slice(0,5),
        arrivalDate:      new Date(dep42.getTime() + 8 * 3600000).toISOString().split('T')[0],
        arrivalTime:      new Date(dep42.getTime() + 8 * 3600000).toTimeString().slice(0,5),
        minPrice:         6000,
        minimumPrice:     6000,
        status:           'opportunity',
        // Historical utilization (Mon–Sun, most recent last)
        historicalUtil:   [48, 52, 44, 51, 39, 47, 46],
        co2PerTonneKm:    0.062,
        driverName:       'Ramesh Kumar',
        notes:            'Covered truck, suitable for textiles'
      },
      {
        id:               'CAP-018',
        vehicleId:        'Truck #18',
        vehicleType:      'Medium Goods Vehicle',
        regNo:            'TN-11-BZ-1842',
        source:           'Chennai',
        destination:      'Coimbatore',
        totalCapacity:    8,
        currentLoad:      4.5,
        unusedCapacity:   3.5,
        departureDatetime: fmtISO(dep18),
        expectedArrival:   fmtISO(new Date(dep18.getTime() + 6 * 3600000)),
        departureDate:    dep18.toISOString().split('T')[0],
        departureTime:    dep18.toTimeString().slice(0,5),
        arrivalDate:      new Date(dep18.getTime() + 6 * 3600000).toISOString().split('T')[0],
        arrivalTime:      new Date(dep18.getTime() + 6 * 3600000).toTimeString().slice(0,5),
        minPrice:         3500,
        minimumPrice:     3500,
        status:           'opportunity',
        historicalUtil:   [60, 55, 48, 62, 50, 54, 52],
        co2PerTonneKm:    0.055,
        driverName:       'Selvam Raj',
        notes:            ''
      },
      {
        id:               'CAP-027',
        vehicleId:        'Truck #27',
        vehicleType:      'Heavy Goods Vehicle',
        regNo:            'KA-05-CX-2741',
        source:           'Bangalore',
        destination:      'Hyderabad',
        totalCapacity:    12,
        currentLoad:      8,
        unusedCapacity:   4,
        departureDatetime: fmtISO(dep27),
        expectedArrival:   fmtISO(new Date(dep27.getTime() + 9 * 3600000)),
        departureDate:    dep27.toISOString().split('T')[0],
        departureTime:    dep27.toTimeString().slice(0,5),
        arrivalDate:      new Date(dep27.getTime() + 9 * 3600000).toISOString().split('T')[0],
        arrivalTime:      new Date(dep27.getTime() + 9 * 3600000).toTimeString().slice(0,5),
        minPrice:         5000,
        minimumPrice:     5000,
        status:           'optimized',
        historicalUtil:   [70, 65, 68, 72, 66, 64, 67],
        co2PerTonneKm:    0.058,
        driverName:       'Anand Pillai',
        notes:            'Fragile items accepted with prior notice'
      },
      {
        id:               'CAP-009',
        vehicleId:        'Truck #09',
        vehicleType:      'Extra Heavy Vehicle',
        regNo:            'AP-28-DY-0912',
        source:           'Hyderabad',
        destination:      'Madurai',
        totalCapacity:    15,
        currentLoad:      6,
        unusedCapacity:   9,
        departureDatetime: fmtISO(dep09),
        expectedArrival:   fmtISO(new Date(dep09.getTime() + 14 * 3600000)),
        departureDate:    dep09.toISOString().split('T')[0],
        departureTime:    dep09.toTimeString().slice(0,5),
        arrivalDate:      new Date(dep09.getTime() + 14 * 3600000).toISOString().split('T')[0],
        arrivalTime:      new Date(dep09.getTime() + 14 * 3600000).toTimeString().slice(0,5),
        minPrice:         8000,
        minimumPrice:     8000,
        status:           'critical',
        historicalUtil:   [45, 42, 38, 44, 40, 37, 40],
        co2PerTonneKm:    0.068,
        driverName:       'Murugan S.',
        notes:            'Night transit, GPS tracked'
      },
      {
        id:               'CAP-051',
        vehicleId:        'Truck #51',
        vehicleType:      'Medium Goods Vehicle',
        regNo:            'TN-47-EF-5142',
        source:           'Coimbatore',
        destination:      'Chennai',
        totalCapacity:    10,
        currentLoad:      7,
        unusedCapacity:   3,
        departureDatetime: fmtISO(dep51),
        expectedArrival:   fmtISO(new Date(dep51.getTime() + 6 * 3600000)),
        departureDate:    dep51.toISOString().split('T')[0],
        departureTime:    dep51.toTimeString().slice(0,5),
        arrivalDate:      new Date(dep51.getTime() + 6 * 3600000).toISOString().split('T')[0],
        arrivalTime:      new Date(dep51.getTime() + 6 * 3600000).toTimeString().slice(0,5),
        minPrice:         2800,
        minimumPrice:     2800,
        status:           'optimized',
        historicalUtil:   [72, 68, 74, 70, 66, 72, 70],
        co2PerTonneKm:    0.052,
        driverName:       'Karthik M.',
        notes:            ''
      }
    ],

    demands: [
      {
        id:                  'DEM-1001',
        customerName:        'Sunrise Textiles Ltd.',
        cargoType:           'Textile Products',
        requiredCapacity:    4,
        source:              'Chennai',
        destination:         'Bangalore',
        // Pickup NOW (matches Truck #42's 2hr buffer → Time score 88)
        pickupDatetime:      fmtISO(dep42Pick),
        deliveryDeadline:    fmtISO(new Date(dep42.getTime() + 10 * 3600000)),
        pickupDate:          dep42Pick.toISOString().split('T')[0],
        pickupTime:          dep42Pick.toTimeString().slice(0,5),
        deliveryDate:        new Date(dep42.getTime() + 10 * 3600000).toISOString().split('T')[0],
        deliveryTime:        new Date(dep42.getTime() + 10 * 3600000).toTimeString().slice(0,5),
        budget:              8000,   // → Price score 83 (ratio 1.333)
        specialRequirements: 'Handle with care, temperature-sensitive',
        status:              'searching',
        contactPerson:       'Priya Sharma',
        contactPhone:        '+91 98400 12345'
      },
      {
        id:                  'DEM-1002',
        customerName:        'Kovai Electronics Pvt. Ltd.',
        cargoType:           'Electronic Components',
        requiredCapacity:    3,
        source:              'Chennai',
        destination:         'Coimbatore',
        pickupDatetime:      fmtISO(dep18Pick),
        deliveryDeadline:    fmtISO(new Date(dep18.getTime() + 8 * 3600000)),
        pickupDate:          dep18Pick.toISOString().split('T')[0],
        pickupTime:          dep18Pick.toTimeString().slice(0,5),
        deliveryDate:        new Date(dep18.getTime() + 8 * 3600000).toISOString().split('T')[0],
        deliveryTime:        new Date(dep18.getTime() + 8 * 3600000).toTimeString().slice(0,5),
        budget:              4500,
        specialRequirements: 'Anti-static packaging required',
        status:              'searching',
        contactPerson:       'Venkat Rao',
        contactPhone:        '+91 98401 67890'
      },
      {
        id:                  'DEM-1003',
        customerName:        'Deccan Pharma Supplies',
        cargoType:           'Pharmaceutical Goods',
        requiredCapacity:    3.5,
        source:              'Bangalore',
        destination:         'Hyderabad',
        pickupDatetime:      fmtISO(dep27Pick),
        deliveryDeadline:    fmtISO(new Date(dep27.getTime() + 12 * 3600000)),
        pickupDate:          dep27Pick.toISOString().split('T')[0],
        pickupTime:          dep27Pick.toTimeString().slice(0,5),
        deliveryDate:        new Date(dep27.getTime() + 12 * 3600000).toISOString().split('T')[0],
        deliveryTime:        new Date(dep27.getTime() + 12 * 3600000).toTimeString().slice(0,5),
        budget:              5200,
        specialRequirements: 'Cold chain required, 2–8°C',
        status:              'searching',
        contactPerson:       'Dr. Anjali Mehta',
        contactPhone:        '+91 98402 34567'
      }
    ],

    // Historical transactions (baseline for analytics)
    // NOTE: live matches are computed dynamically by the engine — not stored here
    transactions: [
      {
        id: 'TXN-0891', vehicleId: 'Truck #31', route: 'Chennai → Hyderabad',
        customer: 'Sify Technologies', capacity: 5, amount: 9200, platformFee: 460,
        status: 'confirmed', date: new Date(Date.now() - 2 * 86400000).toISOString(), matchScore: 91
      },
      {
        id: 'TXN-0892', vehicleId: 'Truck #07', route: 'Bangalore → Chennai',
        customer: 'Flipkart Logistics', capacity: 3.2, amount: 4100, platformFee: 205,
        status: 'confirmed', date: new Date(Date.now() - 3 * 86400000).toISOString(), matchScore: 87
      },
      {
        id: 'TXN-0893', vehicleId: 'Truck #22', route: 'Coimbatore → Bangalore',
        customer: 'TVS Motor Co.', capacity: 7, amount: 11300, platformFee: 565,
        status: 'in-transit', date: new Date(Date.now() - 1 * 86400000).toISOString(), matchScore: 89
      },
      {
        id: 'TXN-0894', vehicleId: 'Truck #15', route: 'Hyderabad → Chennai',
        customer: 'Hetero Drugs', capacity: 4.5, amount: 7600, platformFee: 380,
        status: 'confirmed', date: new Date(Date.now() - 4 * 86400000).toISOString(), matchScore: 94
      },
      {
        id: 'TXN-0895', vehicleId: 'Truck #38', route: 'Madurai → Bangalore',
        customer: 'Lakshmi Mills', capacity: 6, amount: 8900, platformFee: 445,
        status: 'confirmed', date: new Date(Date.now() - 5 * 86400000).toISOString(), matchScore: 86
      }
    ],

    analyticsBaseline: {
      utilizationBefore:   42,
      utilizationAfter:    78,
      baseRevenue:         21400,
      successfulMatches:   18,
      co2Avoided:          18.7,
      monthlyRevenue:      [4200, 5800, 3900, 6100, 7400, 8900, 9200, 11400, 10800, 12600, 14200, 21400],
      utilizationTrend:    [38, 42, 40, 45, 48, 52, 55, 60, 65, 70, 74, 78],
      topRoutes: [
        { route: 'Chennai → Bangalore',   count: 6, revenue: 8200 },
        { route: 'Chennai → Coimbatore',  count: 4, revenue: 4800 },
        { route: 'Bangalore → Hyderabad', count: 3, revenue: 5200 },
        { route: 'Hyderabad → Madurai',   count: 3, revenue: 4100 },
        { route: 'Coimbatore → Chennai',  count: 2, revenue: 3100 }
      ]
    }
  };

})();

export { DEMO_DATA };
