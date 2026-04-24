import { Router } from "express";
import { addObservation } from "../controllers/observationController.js";

const router = Router();

router.post("/", addObservation);

export default router;

