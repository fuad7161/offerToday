const { Schema, model } = require('mongoose');

const shopSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    place: { type: Schema.Types.ObjectId, ref: 'Place', required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    floorUnit: { type: String, trim: true },
    openingHours: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' },
    trustScore: { type: Number, default: 100 },
    bestDiscountToday: { type: Number, default: 0 }, // percent, recomputed from offers
  },
  { timestamps: true }
);

// powers the ranked place view
shopSchema.index({ place: 1, bestDiscountToday: -1 });
shopSchema.index({ name: 'text', category: 'text' });

module.exports = model('Shop', shopSchema);
