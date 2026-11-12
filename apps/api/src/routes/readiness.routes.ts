import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireBusinessAccess } from "../middleware/businessAccess";
import * as ctrl from "../controllers/readiness.controller";

const router = Router();
router.use(requireAuth);

router.get("/:businessId", requireBusinessAccess, ctrl.get);

export default router;