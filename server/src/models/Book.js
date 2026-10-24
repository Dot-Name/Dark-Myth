import mongoose from 'mongoose';

export const PRODUCT_TYPES = ['pdf', 'colouring_book', 'digital_collection', 'other'];

const imageSchema = new mongoose.Schema(
  { publicId: String, url: String, width: Number, height: Number },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, default: '', maxlength: 300 },
    description: { type: String, default: '', maxlength: 10000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: { type: [String], default: [] },
    productType: { type: String, enum: PRODUCT_TYPES, default: 'pdf' },
    price: { type: Number, default: 0, min: 0 },
    isFree: { type: Boolean, default: false },
    language: { type: String, default: 'English', trim: true, maxlength: 40 },
    pageCount: { type: Number, min: 1 },
    fileFormat: { type: String, default: 'PDF', trim: true, maxlength: 40 },
    cover: { type: imageSchema, default: undefined },
    gallery: { type: [imageSchema], default: [] },
    // Private asset; never serialised publicly and excluded from queries by default.
    pdf: {
      type: new mongoose.Schema({ publicId: String, bytes: Number, originalName: String }, { _id: false }),
      select: false,
      default: undefined,
    },
    hasPdf: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: Date,
    seoTitle: { type: String, default: '', maxlength: 70 },
    seoDescription: { type: String, default: '', maxlength: 170 },
  },
  { timestamps: true }
);

bookSchema.index({ status: 1, publishedAt: -1 });
bookSchema.index({ status: 1, category: 1 });
bookSchema.index({ status: 1, isFeatured: 1 });
bookSchema.index({ title: 1 });

export default mongoose.model('Book', bookSchema);
