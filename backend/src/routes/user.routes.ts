import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/users", userController.getUser)
router.post("/register", userController.register);
router.patch("/users/:id/role", authMiddleware, userController.updateRole);

export default router;
