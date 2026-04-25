const mongoose = require("mongoose");

const integrationSyncSchema = new mongoose.Schema(
  {
    sourceKey: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    sourceName: {
      type: String,
      required: true,
      trim: true
    },
    providerType: {
      type: String,
      default: "mock"
    },
    status: {
      type: String,
      enum: ["connected", "warning", "error"],
      default: "connected"
    },
    message: {
      type: String,
      default: ""
    },
    lastSyncAt: {
      type: Date,
      default: null
    },
    lastSuccessAt: {
      type: Date,
      default: null
    },
    itemsProcessed: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const IntegrationSync = mongoose.model("IntegrationSync", integrationSyncSchema);

module.exports = {
  IntegrationSync
};
