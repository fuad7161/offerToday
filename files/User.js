const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    roles: { type: [String], enum: ['shopper', 'shop_owner', 'admin'], default: ['shopper'] },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
