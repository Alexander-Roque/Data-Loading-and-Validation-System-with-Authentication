import pool from "../db";

export const authRepository = {
  async findByEmail(email: string) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  async findById(id: number) {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [id],
    );
    return result.rows[0];
  },
};
