import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/education.controller";

const router = Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.get("/categories", ctrl.categories);
router.get("/:slug", ctrl.getOne);

export default router;