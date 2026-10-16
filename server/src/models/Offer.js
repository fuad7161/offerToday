const { Schema, model } = require('mongoose');

const offerSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    scope: { type: String, enum: ['shop', 'product', 'brand'], required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product' }, // when scope = product
    brand: { type: String, trim: true }, // when scope = brand
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    title: { type: String, trim: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
  },
  { timestamps: true }
);

offerSchema.index({ shop: 1, status: 1, startsAt: 1, endsAt: 1 });

module.exports = model('Offer', offerSchema);
