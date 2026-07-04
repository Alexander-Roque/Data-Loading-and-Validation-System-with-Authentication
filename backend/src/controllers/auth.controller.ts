import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authService } from "../service/auth.service";

interface JwtPayload {
  id: number;
  role: string;
}

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const user = await authService.validateCredentials(email, password);

      if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      const token = authService.createToken({ id: user.id, role: user.role });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2 * 60 * 60 * 1000,
      });

      res.status(200).json({
        ok: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch {
      res.status(500).json({ ok: false, message: "Internal server error" });
    }
  },

  async me(req: Request, res: Response): Promise<void> {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({ ok: false, message: "No token provided" });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      const user = await authService.getUserProfile(decoded.id);

      if (!user) {
        res.status(404).json({ ok: false, message: "User not found" });
        return;
      }

      res.status(200).json({
        ok: true,
        data: { user },
      });
    } catch {
      res.status(401).json({ ok: false, message: "Invalid token" });
    }
  },
};
