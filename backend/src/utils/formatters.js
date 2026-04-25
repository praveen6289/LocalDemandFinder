function toTitleCase(value) {
  value = value || "";
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function createInsightKey(input) {
  return [input.productName, input.category, input.location]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce(function (total, value) {
    return total + value;
  }, 0) / values.length;
}

module.exports = {
  toTitleCase: toTitleCase,
  createInsightKey: createInsightKey,
  average: average
};
