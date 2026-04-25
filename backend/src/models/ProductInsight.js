var mongoose = require("mongoose");

var productInsightSchema = new mongoose.Schema(
  {
    insightKey: {
      type: String,
      required: true,
      unique: true
    },
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
    demandScore: {
      type: Number,
      required: true
    },
    competitionScore: {
      type: Number,
      required: true
    },
    competitionLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    averageSellingPrice: {
      type: Number,
      required: true
    },
    suggestedEntryPrice: {
      type: Number,
      required: true
    },
    recommendation: {
      type: String,
      enum: ["ENTER", "WAIT", "AVOID"],
      required: true
    },
    priceTrend: {
      type: Number,
      required: true
    },
    reviewsScore: {
      type: Number,
      required: true
    },
    searchInterest: {
      type: Number,
      required: true
    },
    totalObservations: {
      type: Number,
      required: true
    },
    alert: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

var ProductInsight = mongoose.model("ProductInsight", productInsightSchema);

module.exports = {
  ProductInsight: ProductInsight
};
