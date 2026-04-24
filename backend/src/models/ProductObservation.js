import mongoose from "mongoose";

const productObservationSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    numberOfSellers: {
      type: Number,
      required: true,
      min: 0
    },
    reviewsCount: {
      type: Number,
      required: true,
      min: 0
    },
    searchInterest: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    priceTrend: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  {
    timestamps: true
  }
);

productObservationSchema.index({
  productName: 1,
  category: 1,
  location: 1
});

export const ProductObservation = mongoose.model("ProductObservation", productObservationSchema);

