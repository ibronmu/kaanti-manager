import { Router } from "express";
import { validate } from "../middleware/validate";
import { createInventorySchema, updateInventorySchema } from "../validators/inventory.validators";
import * as ctrl from "../controllers/inventory.controller";

const router = Router({ mergeParams: true });
router.get("/", ctrl.list);
router.post("/", validate(createInventorySchema), ctrl.create);
router.patch("/:id", validate(updateInventorySchema), ctrl.update);
router.delete("/:id", ctrl.remove);
export default router;