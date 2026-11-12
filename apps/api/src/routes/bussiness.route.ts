import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { businessOnboardingSchema, updateBusinessSchema } from "../validators/auth.validators";
import * as ctrl from "../controllers/business.controller";

const router = Router();
router.use(requireAuth);

router.get("/", ctrl.listMine);
router.post("/", validate(businessOnboardingSchema), ctrl.onboard);
router.get("/:businessId", ctrl.getOne);
router.patch("/:businessId", validate(updateBusinessSchema), ctrl.update);

export default router;