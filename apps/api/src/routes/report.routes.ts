import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireBusinessAccess } from "../middleware/businessAccess";
import { validate } from "../middleware/validate";
import { createReportSchema } from "../validators/report.validators";
import * as ctrl from "../controllers/report.controller";

const router = Router();
router.use(requireAuth);

router.get("/:businessId", requireBusinessAccess, ctrl.list);
router.post("/:businessId", requireBusinessAccess, validate(createReportSchema), ctrl.create);
router.get("/:businessId/:id", requireBusinessAccess, ctrl.getOne);

export default router;