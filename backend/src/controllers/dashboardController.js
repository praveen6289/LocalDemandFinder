const { getDashboardData } = require("../services/insightService");

async function getDashboard(req, res, next) {
  try {
    const data = await getDashboardData(req.query.location);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard
};
