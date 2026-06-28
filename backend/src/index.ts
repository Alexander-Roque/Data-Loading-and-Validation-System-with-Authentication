import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import userRouter from "./routes/user.routes"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/api", authRouter);
app.use("/", uploadRoutes);
app.use("/api", uploadRoutes);
app.use("/api", userRouter);

app.listen(PORT, ()=> {
    console.log("Server is running on port", PORT);
});

export default app;
