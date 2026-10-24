import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  { publicId: String, url: String, width: Number, height: Number },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '', maxlength: 500 },
    image: { type: imageSchema, default: undefined },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model('Category', categorySchema);
