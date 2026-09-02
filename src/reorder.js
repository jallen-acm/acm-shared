// Reorder: turn a past order/invoice's line items into cart adds so a
// customer can re-buy the same materials in one tap. Skips lines that
// aren't real stock products -- comments, manual charges, anything with no
// ProductID. Pricing/stock are resolved later by the cart recalc, so we
// only need the product id, code, description, and quantity here.
//
// NOTE: transaction lines use ProductID (capital ID) and ProductDescription,
// while the cart's add() reads ProductId / Description, so we remap.

export function reorderableLines(details) {
  return (details?.TransactionLines || []).filter((l) => l.ProductID && Number(l.Quantity) > 0);
}

// Adds every reorderable line to the cart. Returns how many were added.
export function addDetailsToCart(details, add) {
  const lines = reorderableLines(details);
  for (const l of lines) {
    add(
      {
        ProductId: l.ProductID,
        ProductCode: l.ProductCode,
        Description: l.ProductDescription,
        SellPerText: '',
      },
      Number(l.Quantity) || 1
    );
  }
  return lines.length;
}
