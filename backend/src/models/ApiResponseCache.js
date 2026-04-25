const mongoose = require("mongoose");

const apiResponseCacheSchema = new mongoose.Schema(
  {
    sourceKey: {
      type: String,
      required: true,
      trim: true
    },
    cacheKey: {
      type: String,
      required: true,
      unique: true
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

apiResponseCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ApiResponseCache = mongoose.model("ApiResponseCache", apiResponseCacheSchema);

module.exports = {
  ApiResponseCache
};
