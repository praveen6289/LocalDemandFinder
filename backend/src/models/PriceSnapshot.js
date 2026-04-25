const mongoose = require("mongoose");

const priceSnapshotSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    keyword: {
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
    marketplaceName: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    snapshotDate: {
      type: String,
      required: true
    },
    capturedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

priceSnapshotSchema.index({
  keyword: 1,
  category: 1,
  snapshotDate: 1,
  marketplaceName: 1
});

const PriceSnapshot = mongoose.model("PriceSnapshot", priceSnapshotSchema);

module.exports = {
  PriceSnapshot
};
