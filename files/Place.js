const { Schema, model } = require('mongoose');

const placeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['mall', 'floor', 'market', 'area'], default: 'mall' },
    parent: { type: Schema.Types.ObjectId, ref: 'Place', default: null },
    city: { type: String, trim: true },
  },
  { timestamps: true }
);

placeSchema.index({ parent: 1 });
placeSchema.index({ name: 'text' });

module.exports = model('Place', placeSchema);
