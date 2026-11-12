import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireBusinessAccess } from "../middleware/businessAccess";
import { validate } from "../middleware/validate";
import { businessOnboardingSchema, updateBusinessSchema } from "../validators/auth.validators";
import * as ctrl from "../controllers/business.controller";
import * as reportCtrl from "../controllers/report.controller";
import transactionRoutes from "./transaction.routes";
import inventoryRoutes from "./inventory.routes";
import customerRoutes from "./customer.routes";

const router = Router();
router.use(requireAuth);

// Non-scoped: list, create
router.get("/", ctrl.listMine);
router.post("/", validate(businessOnboardingSchema), ctrl.onboard);

// Scoped: everything under /:businessId requires membership
const scoped = Router({ mergeParams: true });
scoped.use(requireBusinessAccess);

scoped.get("/", ctrl.getOne);
scoped.patch("/", validate(updateBusinessSchema), ctrl.update);
scoped.get("/dashboard", ctrl.dashboard);

scoped.use("/transactions", transactionRoutes);
scoped.use("/inventory", inventoryRoutes);
scoped.use("/customers", customerRoutes);

scoped.get("/reports/transactions.csv", reportCtrl.downloadTransactionsCsv);

router.use("/:businessId", scoped);

export default router;