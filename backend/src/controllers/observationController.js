const { createObservation, getInsightById } = require("../services/insightService");
const { createInsightKey } = require("../utils/formatters");

async function addObservation(req, res, next) {
  try {
    const requiredFields = [
      "productName",
      "category",
      "location",
      "price",
      "numberOfSellers",
      "reviewsCount",
      "searchInterest"
    ];

    console.log("req>>>>>>>>>>>>>>>>>>>>>>",req.body);
    const missingField = requiredFields.find((field) => req.body[field] === undefined || req.body[field] === "");

    if (missingField) {
      return res.status(400).json({
        message: `Missing required field: ${missingField}`
      });
    }

    const numericFields = ["price", "numberOfSellers", "reviewsCount", "searchInterest"];
    const invalidField = numericFields.find((field) => !Number.isFinite(Number(req.body[field])));

    if (invalidField) {
      return res.status(400).json({
        message: `${invalidField} must be a valid number`
      });
    }

    if (Number(req.body.searchInterest) < 0 || Number(req.body.searchInterest) > 100) {
      return res.status(400).json({
        message: "searchInterest must be between 0 and 100"
      });
    }

    const observation = await createObservation(req.body);
    const insightId = createInsightKey(observation);
    const insight = await getInsightById(insightId);

    res.status(201).json({
      observation,
      insight
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addObservation
};
