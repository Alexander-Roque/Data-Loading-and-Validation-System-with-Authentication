import pool from "../db";

interface CsvRow {
  name: string;
  email: string;
  age: string;
  row: number;
}

export interface RowError {
  row: number;
  details: {
    name?: string;
    email?: string;
    age?: string;
  };
  rowData?: CsvRow;
}

export interface CreateUsersResult {
  insertedUsers: Array<{ id: number; name: string; email: string; age: number | null }>;
  errors: RowError[];
}

export const uploadRepository = {
  async createUsersFromCsv(rows: CsvRow[], hashedPassword: string): Promise<CreateUsersResult> {
    const insertedUsers = [] as Array<{ id: number; name: string; email: string; age: number | null }>;
    const errors = [] as RowError[];

    for (const row of rows) {
      try {
        const result = await pool.query(
          "INSERT INTO users (name, email, password, age, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, age",
          [
            row.name.trim(),
            row.email.trim(),
            hashedPassword,
            row.age.trim() !== "" ? Number(row.age) : null,
            "user",
          ],
        );

        insertedUsers.push(result.rows[0]);
      } catch (error: any) {
        if (error?.code === "23505") {
          errors.push({
            row: row.row,
            details: { email: "This email already registered." },
            rowData: row,
          });
          continue;
        }

        throw error;
      }
    }

    return { insertedUsers, errors };
  },
};
