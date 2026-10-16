const Offer = require('../models/Offer');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

const round1 = (n) => Math.round(n * 10) / 10;

function effectivePercent(offer, regularPrice) {
  if (offer.type === 'percent') return offer.value;
  if (!regularPrice) return 0;
  return Math.min(100, (offer.value / regularPrice) * 100);
}

function appliesToProduct(offer, product) {
  if (offer.scope === 'shop') return true;
  if (offer.scope === 'brand') {
    return !!offer.brand && offer.brand.toLowerCase() === product.brand.toLowerCase();
  }
  return !!offer.product && offer.product.equals(product._id);
}

// Overlap rule: the highest effective discount wins.
async function recomputeShop(shopId, now = new Date()) {
  const [offers, products] = await Promise.all([
    Offer.find({ shop: shopId, status: 'active', startsAt: { $lte: now }, endsAt: { $gte: now } }),
    Product.find({ shop: shopId }),
  ]);

  let shopBest = 0;
  const ops = [];

  for (const p of products) {
    let best = 0;
    for (const o of offers) {
      if (appliesToProduct(o, p)) best = Math.max(best, effectivePercent(o, p.regularPrice));
    }
    best = round1(best);
    shopBest = Math.max(shopBest, best);
    ops.push({ updateOne: { filter: { _id: p._id }, update: { $set: { bestDiscountToday: best } } } });
  }

  // a shop-wide percent offer counts even if the shop has no products yet
  for (const o of offers) {
    if (o.scope === 'shop' && o.type === 'percent') shopBest = Math.max(shopBest, o.value);
  }

  if (ops.length) await Product.bulkWrite(ops);
  await Shop.updateOne({ _id: shopId }, { $set: { bestDiscountToday: round1(shopBest) } });
  return round1(shopBest);
}

module.exports = { recomputeShop, effectivePercent };
