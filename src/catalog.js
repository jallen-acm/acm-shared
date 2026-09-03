// Arrange a flat, already-filtered product list into
//   [{ group, sections: [{ section, products }] }]
// using the BisTrack group tree (ProductGroupID / ParentID / TreeLevel).
// Products join on BisTrackProductGroupId (WebTrackProductGroups is the demo
// fallback). Products whose node IS a top-level group land in an "Other"
// section; products with no resolvable group land in "More Products".
// Shared by the customer app, the CRM API, and the CRM app.
export function buildGroupedCatalog(products, groups) {
  const byId = new Map(groups.map((g) => [g.ProductGroupID, g]));

  const findAncestorAtLevel = (node, level) => {
    let current = node;
    while (current && current.TreeLevel > level) current = byId.get(current.ParentID);
    return current && current.TreeLevel === level ? current : null;
  };

  const grouped = new Map();
  for (const product of products) {
    const membershipId = product.BisTrackProductGroupId ?? product.WebTrackProductGroups?.[0]?.WebTrackProductGroupID;
    const node = byId.get(membershipId);
    const groupNode = node ? findAncestorAtLevel(node, 1) : null;
    const sectionNode = node && node.TreeLevel >= 2 ? findAncestorAtLevel(node, 2) : null;

    const groupKey = groupNode ? groupNode.ProductGroupID : -1;
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        group: groupNode || { ProductGroupID: -1, Name: 'More Products', TreeSequence: Number.MAX_SAFE_INTEGER },
        sections: new Map(),
      });
    }
    const bucket = grouped.get(groupKey);
    const sectionKey = sectionNode ? sectionNode.ProductGroupID : -1;
    if (!bucket.sections.has(sectionKey)) {
      bucket.sections.set(sectionKey, {
        section: sectionNode || { ProductGroupID: -1, Name: 'Other', TreeSequence: Number.MAX_SAFE_INTEGER },
        products: [],
      });
    }
    bucket.sections.get(sectionKey).products.push(product);
  }

  const bySequence = (a, b) => (a.TreeSequence ?? 0) - (b.TreeSequence ?? 0) || String(a.Name).localeCompare(String(b.Name));
  return [...grouped.values()]
    .sort((a, b) => bySequence(a.group, b.group))
    .map(({ group, sections }) => ({ group, sections: [...sections.values()].sort((a, b) => bySequence(a.section, b.section)) }));
}
