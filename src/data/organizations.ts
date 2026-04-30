
export interface Organization {
  id: string;
  name: string;
  tier1Rate: number;
  tier2Rate: number;
  discount: number;
}

// Mock database for demonstration
export const organizations: Organization[] = [
  { id: "1", name: "Acme Corp", tier1Rate: 60, tier2Rate: 30, discount: 5 },
  { id: "2", name: "Globex", tier1Rate: 55, tier2Rate: 25, discount: 10 },
  { id: "3", name: "Soylent Corp", tier1Rate: 60, tier2Rate: 30, discount: 0 },
];
