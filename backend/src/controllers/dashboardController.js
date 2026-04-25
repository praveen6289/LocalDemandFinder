var getDashboardData = require("../services/insightService").getDashboardData;

function getDashboard(req, res, next) {
  getDashboardData(req.query.location)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (error) {
      next(error);
    });
}

module.exports = {
  getDashboard: getDashboard
};
