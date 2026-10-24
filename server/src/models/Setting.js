import mongoose from 'mongoose';

// Single-document site settings (contact details). The WhatsApp number lives in env.
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    contactEmail: { type: String, default: '', trim: true },
    contactPhone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Setting', settingSchema);
