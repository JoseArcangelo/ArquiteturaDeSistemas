import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  products: [
    {
      productId: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  status: { type: String, enum: ['pending', 'completed', 'canceled'], required: true }
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);
