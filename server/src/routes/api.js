const router = require('express').Router();
const mongoose = require('mongoose');
const Place = require('../models/Place');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Offer = require('../models/Offer');

const validId = (id) => mongoose.isValidObjectId(id);

// Top-level places (malls, markets, areas)
router.get('/places', async (req, res) => {
  const places = await Place.find({ parent: null }).sort({ name: 1 });
  res.json(places);
});

// Core feature: shops in a place (including its floors), ranked by today's discount
router.get('/places/:id/shops', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid place id' });

  const children = await Place.find({ parent: req.params.id }).select('_id');
  const placeIds = [req.params.id, ...children.map((c) => c._id)];

  const filter = { place: { $in: placeIds }, status: 'approved' };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.minDiscount) filter.bestDiscountToday = { $gte: Number(req.query.minDiscount) };
  if (req.query.activeOnly === 'true') {
    filter.bestDiscountToday = { ...(filter.bestDiscountToday || {}), $gt: 0 };
  }

  const shops = await Shop.find(filter)
    .sort({ bestDiscountToday: -1, name: 1 })
    .populate('place', 'name type');
  res.json(shops);
});

// Shop detail with products and currently active offers
router.get('/shops/:id', async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid shop id' });

  const shop = await Shop.findById(req.params.id).populate('place', 'name type');
  if (!shop) return res.status(404).json({ error: 'Shop not found' });

  const now = new Date();
  const [products, offers] = await Promise.all([
    Product.find({ shop: shop._id }).sort({ bestDiscountToday: -1 }),
    Offer.find({ shop: shop._id, status: 'active', startsAt: { $lte: now }, endsAt: { $gte: now } }),
  ]);
  res.json({ shop, products, offers });
});

// Brand/product view: which shops discount this brand, ranked
router.get('/products', async (req, res) => {
  const filter = {};
  if (req.query.brand) {
    const escaped = req.query.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.brand = new RegExp(`^${escaped}$`, 'i');
  }
  if (req.query.q) filter.$text = { $search: req.query.q };

  const products = await Product.find(filter)
    .sort({ bestDiscountToday: -1, name: 1 })
    .populate('shop', 'name floorUnit place bestDiscountToday');
  res.json(products);
});

module.exports = router;
