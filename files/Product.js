const { Schema, model } = require('mongoose');

const productSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    regularPrice: { type: Number, required: true, min: 0 },
    bestDiscountToday: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ shop: 1 });
productSchema.index({ brand: 1, bestDiscountToday: -1 });
productSchema.index({ name: 'text', brand: 'text' });

module.exports = model('Product', productSchema);
