import { Request, Response } from "express";
import { userService } from "../service/user.service";

export const userController = {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password, age } = req.body;

    try {
      const result = await userService.registerUser(name, email, password, age);

      if ("error" in result) {
        res.status(400).json({ ok: false, message: result.error });
        return;
      }

      res.status(201).json({ ok: true, data: result.user });
    } catch {
      res.status(500).json({ ok: false, message: "Internal server error" });
    }
  },

  async updateRole(req: Request, res: Response): Promise<void> {
    const idParams = req.params.id;
    const id = Array.isArray(idParams) ? idParams[0] : idParams;
    const { role } = req.body;

    if (!id){
      res.status(400).json({ok: false, message: "Invalid user id"});
      return
    }

    try {
      const result = await userService.updateUserRole(id, role);

      if ("error" in result) {
        const statusCode = result.error === "User dont found" ? 404 : 400;
        res.status(statusCode).json({ ok: false, message: result.error });
        return;
      }

      res.status(200).json({ ok: true, data: result.user });
    } catch {
      res.status(500).json({ ok: false, message: "Error server internal" });
    }
  },

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getUsers();
      res.status(200).json({ ok: true, data: users });
    } catch {
      res.status(500).json({ ok: false, message: "Error interno del servidor" });
    }
  },
};
