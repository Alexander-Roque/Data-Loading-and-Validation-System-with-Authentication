import {Request, Response} from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";

export const authController = {async login(req:Request, res:Response): Promise<void> {
    const {email, password} = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        const user = result.rows[0];

        if (!user) {
            res.status(401).json({message: "Invalid email or password"});
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

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

        res.status(200).json({ok: true, message: "Login successful"});

    } catch (error) {
        res.status(500).json({ok: false, message: "Internal server error"});
    }
}
}
