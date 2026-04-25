var insightService = require("../services/insightService");
var createInsightKey = require("../utils/formatters").createInsightKey;

function findMissingField(body, fields) {
  var index;

  for (index = 0; index < fields.length; index += 1) {
    if (body[fields[index]] === undefined || body[fields[index]] === "") {
      return fields[index];
    }
  }

  return "";
}

function findInvalidNumericField(body, fields) {
  var index;

  for (index = 0; index < fields.length; index += 1) {
    if (!isFinite(Number(body[fields[index]]))) {
      return fields[index];
    }
  }

  return "";
}

function addObservation(req, res, next) {
  var requiredFields = [
    "productName",
    "category",
    "location",
    "price",
    "numberOfSellers",
    "reviewsCount",
    "searchInterest"
  ];
  var numericFields = ["price", "numberOfSellers", "reviewsCount", "searchInterest"];
  var missingField = findMissingField(req.body, requiredFields);
  var invalidField = findInvalidNumericField(req.body, numericFields);

  if (missingField) {
    return res.status(400).json({
      message: "Missing required field: " + missingField
    });
  }

  if (invalidField) {
    return res.status(400).json({
      message: invalidField + " must be a valid number"
    });
  }

  if (Number(req.body.searchInterest) < 0 || Number(req.body.searchInterest) > 100) {
    return res.status(400).json({
      message: "searchInterest must be between 0 and 100"
    });
  }

  return insightService.createObservation(req.body)
    .then(function (observation) {
      var insightId = createInsightKey(observation);

      return insightService.getInsightById(insightId).then(function (insight) {
        res.status(201).json({
          observation: observation,
          insight: insight
        });
      });
    })
    .catch(function (error) {
      next(error);
    });
}

module.exports = {
  addObservation: addObservation
};
