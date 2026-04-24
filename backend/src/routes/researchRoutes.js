import { Router } from "express";
import { analyze } from "../controllers/researchController.js";

const router = Router();

router.post("/analyze", analyze);

export default router;

