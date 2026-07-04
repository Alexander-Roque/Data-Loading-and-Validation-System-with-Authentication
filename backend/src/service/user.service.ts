import bcrypt from "bcrypt";
import { userRepository } from "../repository/user.repository";

export const userService = {
  async registerUser(name: string, email: string, password: string, age?: number | null) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      return { error: "El email ya está registrado" };
    }

    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "TempPassword123!";
    const hashedPassword = await bcrypt.hash(password || defaultPassword, 10);

    const user = await userRepository.createUser({
      name,
      email,
      password: hashedPassword,
      age: age ?? null,
      role: "user",
    });

    return { user };
  },

  async updateUserRole(id: string, role: string) {
    if (!['user', 'admin'].includes(role)) {
      return { error: "Invalid rol, rol must user or admin" };
    }

    const user = await userRepository.updateRole(id, role);

    if (!user) {
      return { error: "User dont found" };
    }

    return { user };
  },

  async getUsers() {
    return userRepository.getAllUsers();
  },
};
