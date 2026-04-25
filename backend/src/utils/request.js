function parseBooleanQuery(value) {
  return value === "true" || value === "1" || value === true;
}

module.exports = {
  parseBooleanQuery
};
