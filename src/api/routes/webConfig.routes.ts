import { Router } from "express";
import { getWebConfig, updateWebConfig } from "../controllers/webConfig.controller";

const router = Router();

router.put("/update", updateWebConfig)
router.get("/", getWebConfig)

export default router;