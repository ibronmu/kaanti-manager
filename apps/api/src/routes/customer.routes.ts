import { Router } from "express";
import { validate } from "../middleware/validate";
import { createCustomerSchema, updateCustomerSchema } from "../validators/customer.validators";
import * as ctrl from "../controllers/customer.controller";

const router = Router({ mergeParams: true });
router.get("/", ctrl.list);
router.post("/", validate(createCustomerSchema), ctrl.create);
router.patch("/:id", validate(updateCustomerSchema), ctrl.update);
router.delete("/:id", ctrl.remove);
export default router;