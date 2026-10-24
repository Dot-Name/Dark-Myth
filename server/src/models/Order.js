import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    customerContact: { type: String, required: true, trim: true, maxlength: 60 },
    customerEmail: { type: String, trim: true, lowercase: true, maxlength: 160 },
    amount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'refunded'], default: 'pending' },
    orderStatus: { type: String, enum: ['awaiting_verification', 'completed', 'cancelled'], default: 'awaiting_verification' },
    verificationNotes: { type: String, default: '', maxlength: 1000 },
    accessStatus: { type: String, enum: ['none', 'granted', 'revoked'], default: 'none' },
    // Only a hash of the access code is stored.
    accessTokenHash: { type: String, select: false, index: true, sparse: true },
    accessExpiresAt: Date,
    downloadCount: { type: Number, default: 0 },
    maxDownloads: { type: Number, default: 5 },
  },
  { timestamps: true }
);

orderSchema.index({ paymentStatus: 1, orderStatus: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
