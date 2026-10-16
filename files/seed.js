require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Place = require('../models/Place');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Offer = require('../models/Offer');
const { recomputeShop } = require('../services/bestDiscount');

const DAY = 24 * 60 * 60 * 1000;

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed in production');
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to', mongoose.connection.name);

  await Promise.all([User, Place, Shop, Product, Offer].map((m) => m.deleteMany({})));

  const now = Date.now();
  const active = { startsAt: new Date(now - DAY), endsAt: new Date(now + 5 * DAY) };

  // --- Users (password for all: Password123!) ---
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const [admin, owner] = await User.create([
    { name: 'Admin', email: 'admin@offertoday.test', passwordHash, roles: ['admin'] },
    { name: 'Shop Owner', email: 'owner@offertoday.test', passwordHash, roles: ['shopper', 'shop_owner'] },
    { name: 'Shopper', email: 'shopper@offertoday.test', passwordHash, roles: ['shopper'] },
  ]);

  // --- Places ---
  const bashundhara = await Place.create({ name: 'Bashundhara City', type: 'mall', city: 'Dhaka' });
  const jamuna = await Place.create({ name: 'Jamuna Future Park', type: 'mall', city: 'Dhaka' });
  const level3 = await Place.create({ name: 'Level 3', type: 'floor', parent: bashundhara._id });
  const level5 = await Place.create({ name: 'Level 5', type: 'floor', parent: bashundhara._id });

  // --- Shops ---
  const mk = (name, category, place, floorUnit) =>
    ({ owner: owner._id, place: place._id, name, category, floorUnit, status: 'approved', openingHours: '10:00-21:00' });

  const [bata, apex, yellow, samsung, aarong, sportsworld, startech] = await Shop.create([
    mk('Bata', 'shoes', level3, 'L3-12'),
    mk('Apex', 'shoes', level3, 'L3-20'),
    mk('Yellow', 'fashion', level3, 'L3-31'),
    mk('Samsung Smart Plaza', 'electronics', level5, 'L5-05'),
    mk('Aarong', 'fashion', level5, 'L5-18'),
    mk('Sportsworld', 'sports', jamuna, 'G-14'),
    mk('Star Tech', 'electronics', jamuna, 'G-40'),
  ]);
  // one pending shop to confirm unapproved shops are hidden
  await Shop.create({ ...mk('Pending Store', 'misc', level3, 'L3-99'), status: 'pending' });

  // --- Products ---
  const prod = (shop, name, brand, category, regularPrice) => ({ shop: shop._id, name, brand, category, regularPrice });
  const products = await Product.create([
    prod(bata, 'Bata Comfit Sandal', 'Bata', 'shoes', 2500),
    prod(bata, 'Bata Formal Oxford', 'Bata', 'shoes', 4500),
    prod(apex, 'Apex Runner', 'Apex', 'shoes', 3200),
    prod(apex, 'Nike Air Zoom', 'Nike', 'shoes', 8000),
    prod(yellow, 'Slim Fit Jeans', 'Yellow', 'clothing', 2800),
    prod(yellow, 'Cotton Polo', 'Yellow', 'clothing', 1200),
    prod(samsung, 'Galaxy A55', 'Samsung', 'phones', 45000),
    prod(samsung, 'Galaxy Buds', 'Samsung', 'audio', 9000),
    prod(aarong, 'Panjabi', 'Aarong', 'clothing', 3500),
    prod(sportsworld, 'Nike Pegasus', 'Nike', 'shoes', 12000),
    prod(sportsworld, 'Adidas Ultraboost', 'Adidas', 'shoes', 15000),
    prod(startech, 'Redmi Note 13', 'Xiaomi', 'phones', 28000),
    prod(startech, 'Mechanical Keyboard', 'Keychron', 'accessories', 7000),
  ]);
  const byName = Object.fromEntries(products.map((p) => [p.name, p]));

  // --- Offers ---
  await Offer.create([
    { shop: bata._id, scope: 'shop', type: 'percent', value: 20, title: '20% off everything', ...active },
    { shop: apex._id, scope: 'product', product: byName['Apex Runner']._id, type: 'percent', value: 35, title: 'Runner sale', ...active },
    { shop: apex._id, scope: 'brand', brand: 'Nike', type: 'fixed', value: 500, title: 'Tk 500 off Nike', ...active },
    { shop: yellow._id, scope: 'shop', type: 'percent', value: 50, title: 'Half price weekend', ...active },
    { shop: samsung._id, scope: 'product', product: byName['Galaxy A55']._id, type: 'fixed', value: 5000, title: 'Tk 5000 off Galaxy A55', ...active },
    // expired yesterday: must NOT count
    { shop: aarong._id, scope: 'shop', type: 'percent', value: 60, title: 'Expired sale', startsAt: new Date(now - 10 * DAY), endsAt: new Date(now - DAY) },
    // starts in 3 days: must NOT count yet
    { shop: aarong._id, scope: 'shop', type: 'percent', value: 40, title: 'Upcoming sale', startsAt: new Date(now + 3 * DAY), endsAt: new Date(now + 8 * DAY) },
    { shop: sportsworld._id, scope: 'brand', brand: 'Nike', type: 'percent', value: 30, title: 'Nike 30% off', ...active },
    { shop: sportsworld._id, scope: 'brand', brand: 'Adidas', type: 'percent', value: 25, title: 'Adidas 25% off', ...active },
    { shop: startech._id, scope: 'product', product: byName['Redmi Note 13']._id, type: 'percent', value: 12, title: 'Redmi deal', ...active },
  ]);

  // --- Compute best discount for every shop ---
  for (const shop of await Shop.find()) {
    const best = await recomputeShop(shop._id);
    console.log(`  ${shop.name.padEnd(22)} best discount today: ${best}%`);
  }

  console.log('\nSeed complete. Demo logins (password Password123!):');
  console.log('  admin@offertoday.test, owner@offertoday.test, shopper@offertoday.test');
  console.log('  (admin id:', String(admin._id) + ')');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.connection.close());
