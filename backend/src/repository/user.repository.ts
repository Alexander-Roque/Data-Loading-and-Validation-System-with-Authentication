import pool from "../db";

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  age?: number | null;
  role: string;
}

export const userRepository = {
  async findByEmail(email: string) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  async createUser(userData: CreateUserData) {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, age, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, age, role",
      [userData.name, userData.email, userData.password, userData.age ?? null, userData.role],
    );
    return result.rows[0];
  },

  async updateRole(id: string, role: string) {
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role",
      [role, id],
    );
    return result.rows[0] || null;
  },

  async getAllUsers() {
    const result = await pool.query(
      "SELECT id, name, email, age, role FROM users",
    );
    return result.rows;
  },
};
