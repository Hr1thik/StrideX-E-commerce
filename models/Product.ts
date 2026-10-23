import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  brand: string;
  category: string;
  gender: "men" | "women" | "unisex";
  price: number;
  discountPrice?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 50,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    brand: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["men", "women", "unisex"],
      required: true,
    },
    sizes: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "At least one size is required",
      },
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Atleast one product image is required",
      },
    },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (this: IProduct, value: number | undefined) {
          if (value == null) return true;
          if (this.price == null || this.price <= 0) return true; // update-context / zero-price guard
          return value < this.price;
        },
        message: "Discount price must be less than regular price",
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    colors: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Atleast one color is required",
      },
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;