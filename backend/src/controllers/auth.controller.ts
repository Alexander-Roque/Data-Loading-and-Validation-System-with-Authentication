import {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";

interface JwtPayload {
    id: number;
    role: string;
}

export const authController = {
    async login(req: Request, res: Response): Promise<void> {
        const {email, password} = req.body;

        try {
            const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

            const user = result.rows[0];

            if (!user) {
                res.status(401).json({message: "Invalid email or password"});
                return;
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                res.status(401).json({ok: false, message: "Invalid email or password"});
                return;
            }

            const token = jwt.sign(
                {id: user.id, role: user.role},
                process.env.JWT_SECRET as string,
                {expiresIn: "2h"}
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 2 * 60 * 60 * 1000, // 2 hours
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
        } catch (error) {
            res.status(500).json({ok: false, message: "Internal server error"});
        }
    },

    async me(req: Request, res: Response): Promise<void> {
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ok: false, message: "No token provided"});
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            const result = await pool.query(
                "SELECT id, name, email, role FROM users WHERE id = $1",
                [decoded.id],
            );

            if (result.rows.length === 0) {
                res.status(404).json({ok: false, message: "User not found"});
                return;
            }

            res.status(200).json({
                ok: true,
                data: { user: result.rows[0] },
            });
        } catch (error) {
            res.status(401).json({ok: false, message: "Invalid token"});
        }
    },
};
