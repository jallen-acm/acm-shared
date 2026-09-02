// Products priced by the lineal foot come back from the pricing API as a
// per-EACH (whole-piece) price, because the price call sends the piece length.
// For display we convert back to the per-lineal-foot RATE -- how ACM actually
// prices these -- and keep the per-each total for context.
//
// NOTE: product.Length is stored in INCHES (a 10 ft board = 120).
export function unitPricing(product, perEachPrice) {
  const per = (product && (product.SellPerText || product.SellPer)) || '';
  const lengthFt = product && product.Length ? Number(product.Length) / 12 : 0;
  const byLinealFoot = lengthFt > 0 && /lin|foot|feet|\blf\b/i.test(per);
  if (byLinealFoot && perEachPrice != null) {
    // e.g. $173.00 each / 10 ft -> $17.30 per lineal foot
    return { display: perEachPrice / lengthFt, per, eachPrice: perEachPrice, lengthFt };
  }
  // Sold in its own unit (each, etc.) -- show the price as returned.
  return { display: perEachPrice, per, eachPrice: null, lengthFt };
}
