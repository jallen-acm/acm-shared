// WebTrack permission gating, shared by every ACM client.
//
// The WebStore API returns the user's *group-resolved* effective permissions
// as session.WebTrackUser.Rights = [{ Name, ... }]. A capability is GRANTED
// when its Right name is present in that array.
//
// IMPORTANT: the flat Allow*/IsAllow* booleans on the login record are NOT
// reliable for contact-linked ("new-style") users -- e.g. account-payment
// permissions come back `false` there even when the customer's WebTrack group
// grants them. So we key off Rights, which is what BisTrack actually resolves
// and enforces. Client gating is UX only; BisTrack enforces server-side.

export const RIGHTS = {
  viewOrders: ['ViewOrders'],
  viewQuotes: ['ViewQuotes'],
  viewInvoices: ['ViewInvoices'],
  viewCreditNotes: ['ViewCreditNotes'],
  viewStatements: ['ViewStatements'],
  requestStatements: ['RequestStatements'],
  placeOrders: ['PlaceOrders'],
  viewCatalog: ['BrowseProductCatalog'],
  // Either payment right (card or e-check) means the customer can reach Pay
  // Balance; the individual methods are gated separately below.
  makePayments: ['MakingCheckAccountPayments', 'MakingCreditCardAccountPayments'],
  payByCard: ['MakingCreditCardAccountPayments'],
  payByCheck: ['MakingCheckAccountPayments'],
};

/**
 * True when the session may use `capability`.
 * @param {object} session   login result (has WebTrackUser.Rights)
 * @param {string} capability key of RIGHTS
 * @param {{ enableOrdering?: boolean }} [opts]  each client passes its own
 *        ENABLE_ORDERING master switch; false forces placeOrders off.
 */
export function can(session, capability, { enableOrdering = true } = {}) {
  if (capability === 'placeOrders' && !enableOrdering) return false;

  const names = RIGHTS[capability];
  if (!names) return true; // unknown capability -> don't restrict
  const rights = session?.WebTrackUser?.Rights;
  // If the response doesn't carry Rights (unexpected shape), don't hide the
  // feature -- BisTrack still enforces every action server-side.
  if (!Array.isArray(rights)) return true;
  return names.some((n) => rights.some((r) => r && r.Name === n));
}

/** Employee logins come back with no positive CustomerId (-1 live, 0 demo). */
export function isEmployeeSession(session) {
  return !(session?.CustomerId > 0);
}
