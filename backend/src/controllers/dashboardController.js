import { getDashboardData } from "../services/insightService.js";

export async function getDashboard(req, res, next) {
  try {
    const data = await getDashboardData(req.query.location);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

