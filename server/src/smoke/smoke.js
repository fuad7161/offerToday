// Run with the server up: npm run smoke
const BASE = process.env.API_URL || 'http://localhost:5000/api';
let failed = 0;

const get = async (path) => {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
};
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + extra}`);
  if (!ok) failed++;
};
const summary = (shops) => shops.map((s) => `${s.name}:${s.bestDiscountToday}`).join(', ');

(async () => {
  const health = await get('/health');
  check('health reports db connected', health.db === 'connected');

  const places = await get('/places');
  const bash = places.find((p) => p.name === 'Bashundhara City');
  const jamuna = places.find((p) => p.name === 'Jamuna Future Park');
  check('two top-level places', places.length === 2);

  const b = await get(`/places/${bash._id}/shops`);
  check('Bashundhara ranked by discount desc', b.every((s, i) => i === 0 || b[i - 1].bestDiscountToday >= s.bestDiscountToday), summary(b));
  check('Bashundhara order: Yellow, Apex, Bata, Samsung, Aarong',
    b.map((s) => s.name).join('|') === 'Yellow|Apex|Bata|Samsung Smart Plaza|Aarong', summary(b));
  check('expired and future offers do not count (Aarong = 0)', b.find((s) => s.name === 'Aarong')?.bestDiscountToday === 0);
  check('pending shop is hidden', !b.some((s) => s.name === 'Pending Store'));
  check('fixed offer converted to percent (Samsung = 11.1)', b.find((s) => s.name === 'Samsung Smart Plaza')?.bestDiscountToday === 11.1);

  const j = await get(`/places/${jamuna._id}/shops`);
  check('Jamuna order: Sportsworld, Star Tech', j.map((s) => s.name).join('|') === 'Sportsworld|Star Tech', summary(j));

  const min = await get(`/places/${bash._id}/shops?minDiscount=30`);
  check('minDiscount=30 returns Yellow and Apex only', min.map((s) => s.name).join('|') === 'Yellow|Apex', summary(min));

  const nike = await get('/products?brand=nike');
  check('Nike view ranks Sportsworld (30%) first', nike[0]?.shop?.name === 'Sportsworld' && nike[0].bestDiscountToday === 30);

  const detail = await get(`/shops/${b[0]._id}`);
  check('shop detail returns products and active offers', detail.products.length === 2 && detail.offers.length === 1);

  console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('Smoke test error:', e.message);
  process.exit(1);
});
