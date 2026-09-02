// BisTrack order StatusID values (TransactionSummary.StatusID) and how ACM's
// clients interpret them. See swagger: 0 Saved, 1 Parked, 2 CreditControl,
// 3 AwaitingStock, 4 AwaitingPicking, 5 AwaitingPickingConfirmation,
// 6 AwaitingDelivery, 7 AwaitingInvoicing, 8 Invoiced, 14 Quote Open,
// 15 Quote Accepted, 16 Quote Rejected.

export const OrderStatus = {
  Saved: 0,
  Parked: 1,
  CreditControl: 2,
  AwaitingStock: 3,
  AwaitingPicking: 4,
  AwaitingPickingConfirmation: 5,
  AwaitingDelivery: 6,
  AwaitingInvoicing: 7,
  Invoiced: 8,
};

export const QuoteStatus = {
  Open: 14,
  Accepted: 15,
  Rejected: 16,
};

// "Open" per ACM's definition: Credit Control, Waiting for Stock,
// Picking (both picking statuses), and Delivery.
const OPEN_STATUS_IDS = new Set([
  OrderStatus.CreditControl,
  OrderStatus.AwaitingStock,
  OrderStatus.AwaitingPicking,
  OrderStatus.AwaitingPickingConfirmation,
  OrderStatus.AwaitingDelivery,
]);

export function isOpenOrder(order) {
  return OPEN_STATUS_IDS.has(order?.StatusID);
}

// "Active" = still relevant on the Orders screen: everything in flight PLUS
// AwaitingInvoicing (delivered but not yet billed). Once an order is Invoiced
// (8) it lives in the Invoices screen instead, so we stop showing it here --
// no duplication between Orders and Invoices, and nothing falls in the gap.
const ACTIVE_STATUS_IDS = new Set([...OPEN_STATUS_IDS, OrderStatus.AwaitingInvoicing]);

export function isActiveOrder(order) {
  return ACTIVE_STATUS_IDS.has(order?.StatusID);
}

// Grand total for a transactionsummary row. Invoices post TotalAmount, but
// orders leave it 0 until invoiced -- their value lives in GoodsTotal +
// TotalTax (which also equals TotalAmount on invoices, so this is correct
// for both). Falls back to TotalAmount so nothing regresses.
export function transactionTotal(t) {
  if (t?.TotalAmount) return t.TotalAmount;
  const goods = Number(t?.GoodsTotal) || 0;
  const tax = Number(t?.TotalTax) || 0;
  if (goods || tax) return goods + tax;
  return t?.TotalAmount ?? null;
}

// Customer-friendly wording for raw BisTrack status names. Pass
// pickup: true for collect orders so status 6/7 read as pickup stages.
export function friendlyStatus(statusId, fallbackName, { pickup = false } = {}) {
  switch (statusId) {
    case OrderStatus.CreditControl: return 'On Hold';
    case OrderStatus.AwaitingStock: return 'Waiting for Stock';
    case OrderStatus.AwaitingPicking:
    case OrderStatus.AwaitingPickingConfirmation: return 'Picking';
    case OrderStatus.AwaitingDelivery: return pickup ? 'Ready for Pickup' : 'Delivery';
    case OrderStatus.AwaitingInvoicing: return pickup ? 'Picked Up' : 'Delivered';
    case OrderStatus.Invoiced: return 'Invoiced';
    case QuoteStatus.Open: return 'Open';
    case QuoteStatus.Accepted: return 'Accepted';
    case QuoteStatus.Rejected: return 'Rejected';
    default: return fallbackName || '';
  }
}

// SaleTypeID (TransactionSummary.SaleTypeID): 1 CollectNow,
// 2 CollectLater, 3 Delivered, 4 Direct, 10 Mixed, 11 UPS.
export function saleTypeLabel(saleTypeId) {
  switch (saleTypeId) {
    case 1:
    case 2: return 'Pickup';
    case 3: return 'Delivery';
    case 4: return 'Direct Ship';
    case 10: return 'Mixed';
    case 11: return 'UPS';
    default: return null;
  }
}

export function isDeliveryOrder(order) {
  return order?.SaleTypeID === 3 || order?.SaleTypeID === 10;
}

export function isPickupOrder(order) {
  return order?.SaleTypeID === 1 || order?.SaleTypeID === 2;
}

/**
 * Builds the tracker steps (the "pizza tracker").
 * Delivery: Picking -> Delivery -> Delivered.
 * Pickup:   Picking -> Ready for Pickup -> Picked Up.
 * Both get a leading "Waiting for Stock" step, but only while the order
 * is actually in that stage -- the API doesn't tell us afterwards
 * whether an order ever waited for stock.
 *
 * For pickup orders, BisTrack's status 6 (Awaiting Delivery) is the
 * "picked and staged" state, so it reads as Ready for Pickup.
 *
 * Returns { steps: [{ key, label }], activeIndex, complete, onHold }
 * or null when the status isn't part of the fulfillment journey.
 */
export function buildTrackerSteps(statusId, { pickup = false } = {}) {
  if (
    statusId === undefined ||
    statusId === null ||
    statusId < OrderStatus.CreditControl ||
    statusId > OrderStatus.Invoiced
  ) {
    return null;
  }

  const onHold = statusId === OrderStatus.CreditControl;
  const includeStockStep = statusId === OrderStatus.AwaitingStock;

  const steps = [];
  if (includeStockStep) steps.push({ key: 'stock', label: 'Waiting for Stock' });
  steps.push({ key: 'picking', label: 'Picking' });
  steps.push({ key: 'delivery', label: pickup ? 'Ready for Pickup' : 'Delivery' });
  steps.push({ key: 'delivered', label: pickup ? 'Picked Up' : 'Delivered' });

  let activeIndex;
  let complete = false;
  switch (statusId) {
    case OrderStatus.CreditControl:
      activeIndex = -1; // journey not started while on hold
      break;
    case OrderStatus.AwaitingStock:
      activeIndex = 0;
      break;
    case OrderStatus.AwaitingPicking:
    case OrderStatus.AwaitingPickingConfirmation:
      activeIndex = steps.findIndex((s) => s.key === 'picking');
      break;
    case OrderStatus.AwaitingDelivery:
      activeIndex = steps.findIndex((s) => s.key === 'delivery');
      break;
    case OrderStatus.AwaitingInvoicing:
    case OrderStatus.Invoiced:
      activeIndex = steps.length - 1;
      complete = true;
      break;
    default:
      activeIndex = -1;
  }

  return { steps, activeIndex, complete, onHold };
}
