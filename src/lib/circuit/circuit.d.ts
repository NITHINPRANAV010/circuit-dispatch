export interface Capacity {
  id: string;
  vehicleId: string;
  vehicleType: string;
  regNo?: string;
  source: string;
  destination: string;
  totalCapacity: number;
  currentLoad: number;
  unusedCapacity: number;
  departureDatetime: string;
  expectedArrival: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  minPrice: number;
  minimumPrice: number;
  status: string;
  historicalUtil: number[];
  co2PerTonneKm: number;
  driverName?: string;
  notes?: string;
  createdAt?: string;
}

export interface Demand {
  id: string;
  customerName: string;
  cargoType: string;
  requiredCapacity: number;
  source: string;
  destination: string;
  pickupDatetime: string;
  deliveryDeadline: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  deliveryTime: string;
  budget: number;
  specialRequirements?: string;
  status: string;
  contactPerson?: string;
  contactPhone?: string;
  createdAt?: string;
}

export interface MatchBreakdown {
  capacityScore: number;
  routeScore: number;
  timeScore: number;
  priceScore: number;
  distanceScore: number;
  reliabilityScore: number;
}

export interface ExplanationItem {
  type: "check" | "cross";
  text: string;
}

export interface Match {
  id: string;
  capacityId: string;
  demandId: string;
  capacity: Capacity;
  demand: Demand;
  totalScore: number;
  breakdown: MatchBreakdown;
  label: string;
  explanation: ExplanationItem[];
  estimatedRevenue: number;
  platformFee: number;
  co2Avoided: number;
  status: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface Transaction {
  id: string;
  vehicleId: string;
  route: string;
  customer: string;
  capacity: number;
  amount: number;
  platformFee: number;
  status: string;
  date: string;
  matchScore: number;
  matchId?: string;
}

export interface Prediction {
  currentUtil: number;
  predictedUtil: number;
  predictedUnusedPct: number;
  predictedUnusedTonnes: number;
  opportunityProbability: number;
  estimatedRevenue: number;
  signal: "high" | "medium" | "low";
  summary: string;
}

export interface Opportunity {
  capacity: Capacity;
  prediction: Prediction;
  match: Match | null;
  estimatedRevenue: number;
  matchScore: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  reliabilityScore: number;
}

export interface DashboardMetrics {
  potentialRevenue: number;
  capacityRecovered: number;
  activeCapacity: number;
  aiMatches: number;
  co2Avoided: number;
  successfulMatches: number;
  utilizationBefore: number;
  utilizationAfter: number;
  platformRevenue: number;
}
