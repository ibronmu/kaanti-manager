import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/investments.controller";

const router = Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.get("/categories", ctrl.categories);
router.get("/:id", ctrl.getOne);

export default router;