import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsQuery,
} from "../validators/transaction.validators";
import * as ctrl from "../controllers/transaction.controller";

const router = Router({ mergeParams: true });

router.get("/", validate(listTransactionsQuery, "query"), ctrl.list);
router.post("/", validate(createTransactionSchema), ctrl.create);
router.get("/categories", ctrl.categories);
router.get("/:id", ctrl.getOne);
router.patch("/:id", validate(updateTransactionSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;