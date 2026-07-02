import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../config/db";

export const userController = {
  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password, age } = req.body;

    try {
      const userExists = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );

      if (userExists.rows.length > 0) {
        res
          .status(400)
          .json({ ok: false, message: "El email ya está registrado" });
        return;
      }

      const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "TempPassword123!";
      const hashedPassword = await bcrypt.hash(password || defaultPassword, 10);

      const result = await pool.query(
        "INSERT INTO users (name, email, password, age, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, age, role",
        [name, email, hashedPassword, age || null, "user"],
      );

      res.status(201).json({ ok: true, data: result.rows[0] });
    } catch {
      res.status(500).json({ ok: false, message: "Internal server error" });
    }
  },
  async updateRole(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      res
        .status(400)
        .json({ ok: false, message: "Invalid rol, rol must user or admin " });
      return;
    }

    try {
      const result = await pool.query(
        "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role",
        [role, id],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ ok: false, message: "User dont found" });
        return;
      }

      res.status(200).json({ok: true, data: result.rows[0]});
    } catch(error) {
      res.status(500).json({ok: false, message: "Error server internal "})
    }
  },
  async getUser (req: Request, res: Response): Promise <void> {
    try {
      const result = await pool.query (
        "SELECT id, name, email, age, role FROM users"
      );
      res.status(200).json({ok: true, data: result.rows})
    } catch (error) {
      res.status(500).json({ ok: false, message: 'Error interno del servidor' });
    }
  }
};
