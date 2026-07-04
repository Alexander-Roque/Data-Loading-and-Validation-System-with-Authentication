import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "../repository/auth.repository";

interface UserForToken {
  id: number;
  role: string;
}

export const authService = {
  async getUserByEmail(email: string) {
    return authRepository.findByEmail(email);
  },

  async validateCredentials(email: string, password: string) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return null;
    }

    return user;
  },

  createToken(user: UserForToken): string {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "2h" },
    );
  },

  async getUserProfile(id: number) {
    return authRepository.findById(id);
  },
};
