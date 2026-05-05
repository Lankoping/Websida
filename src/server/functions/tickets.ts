
import { organizations } from '../../data/organizations';

export function calculateTicketPrice(orgId: string, ticketCount: number): number {
  const org = organizations.find(o => o.id === orgId);
  if (!org) throw new Error("Organization not found");

  let total: number;
  if (ticketCount <= 10) {
    total = ticketCount * org.tier1Rate;
  } else {
    total = (10 * org.tier1Rate) + ((ticketCount - 10) * org.tier2Rate);
  }

  // Apply individual discount
  const discountAmount = total * (org.discount / 100);
  return total - discountAmount;
}
