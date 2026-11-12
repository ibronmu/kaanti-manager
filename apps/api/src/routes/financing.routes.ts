import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/financing.controller";

const router = Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.get("/structures", ctrl.structures);
router.get("/interests/mine", ctrl.myInterests);
router.get("/:id", ctrl.getOne);
router.post("/:id/interest", ctrl.expressInterest);

export default router;