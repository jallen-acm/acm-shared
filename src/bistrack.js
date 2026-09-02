// BisTrack WebStore API constants shared by the clients and the CRM.

// TransactionSummaryParameters.TransactionType
export const SummaryType = {
  Order: 1,
  Quote: 2,
  CreditNote: 3,
  Invoice: 4,
  CustomerStatement: 5,
  Template: 6,
  CallOffOrder: 7,
};

// /api/transactiondetails transactionType (differs from SummaryType!)
export const DetailType = { Order: 1, Quote: 2, Invoice: 7, CreditNote: 8 };

// FinancialDetails.AccountAgingTable entries. VERIFIED 2026-09-02 against the
// Training tenant: the amount field is `ValueOfTransactions`, not `Balance`
// as the swagger claims. Buckets (7): Current, 1-30, 31-60, 61-90, 91-120, …
export function agingAmount(entry) {
  return Number(entry?.ValueOfTransactions ?? entry?.Balance ?? 0);
}
