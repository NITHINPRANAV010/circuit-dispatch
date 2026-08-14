declare module "@/lib/circuit/data.js" {
  export const DEMO_DATA: any;
}

declare module "@/lib/circuit/matching-engine.js" {
  export const MatchingEngine: {
    calculateMatchScore(capacity: any, demand: any, businessReliability?: number): any;
    findMatches(demand: any, allCapacities: any[], businessReliability?: number): any[];
    getDistance(src: string, dst: string): number;
    normalizeCity(city: string): string;
  };
}

declare module "@/lib/circuit/opportunity-predictor.js" {
  export const OpportunityPredictor: {
    predict(capacity: any): any;
    predictAll(capacities: any[]): any[];
    estimateOpportunityRevenue(capacity: any): number;
  };
}

declare module "@/lib/circuit/state.js" {
  export const State: {
    init(): void;
    resetDemoData(): void;
    subscribe(event: string, fn: (data: any) => void): void;
    emit(event: string, data?: any): void;
    login(email?: string, password?: string, name?: string, type?: string): any;
    logout(): void;
    getUser(): any;
    getRole(): string;
    setRole(role: string): void;
    addCapacity(data: any): any;
    getCapacities(): any[];
    getCapacityById(id: string): any;
    updateCapacityStatus(id: string, status: string): void;
    addDemand(data: any): any;
    getDemands(): any[];
    getDemandById(id: string): any;
    findMatches(demandId: string): any[];
    getMatches(): any[];
    getMatchById(id: string): any;
    acceptMatch(matchId: string): any;
    rejectMatch(matchId: string): any;
    getTransactions(): any[];
    getDashboardMetrics(): any;
    getOpportunities(): any[];
  };
}
