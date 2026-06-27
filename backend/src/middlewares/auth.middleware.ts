import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: number;
    role: string;
}

export const authMiddleware =  (req: Request, res: Response, next: NextFunction):void => { 
    const token = req.cookies.token;

    if(!token) {
        res.status(401).json({ok: false, message: "No token provided"});
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        if(decoded.role !== "admin") {
            res.status(403).json({ok: false, message: "Access denied, required admin role"});
            return;
        }

        next();

    } catch (error) {
        res.status(401).json({ok: false, message: "Invalid token"});
    }
}
