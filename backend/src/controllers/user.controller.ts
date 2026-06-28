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

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO users (name, email, password, age, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, age, role",
        [name, email, hashedPassword, age || null, "user"],
      );

      res.status(201).json({ ok: true, data: result.rows[0] });
    } catch {
      res.status(500).json({ ok: false, message: "Internal server error" });
    }
  },
};
