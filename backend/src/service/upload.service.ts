import bcrypt from "bcrypt";
import { uploadRepository, CreateUsersResult } from "../repository/upload.repository";

interface CsvRow {
  name: string;
  email: string;
  age: string;
  row: number;
}

interface RowError {
  row: number;
  details: {
    name?: string;
    email?: string;
    age?: string;
  };
  rowData?: CsvRow;
}

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRow = (row: CsvRow): RowError["details"] => {
  const errors: RowError["details"] = {};

  if (!row.name || row.name.trim() === "") {
    errors.name = "El campo 'name' no puede estar vacío.";
  }

  if (!row.email || row.email.trim() === "") {
    errors.email = "El campo 'email' no puede estar vacío.";
  } else if (!validateEmail(row.email.trim())) {
    errors.email = "El formato del campo 'email' es inválido.";
  }

  if (row.age !== undefined && row.age.trim() !== "") {
    const age = Number(row.age);
    if (!Number.isInteger(age) || age <= 0) {
      errors.age = "El campo 'age' debe ser un número entero positivo.";
    }
  }

  return errors;
};

export const uploadService = {
  parseCsv(content: string) {
    const lines = content.split("\n").filter((line) => line.trim() !== "");

    if (lines.length === 0) {
      return { error: "El CSV está vacío" };
    }

    const firstLine = lines[0];
    if (!firstLine) {
      return { error: "El CSV está vacío" };
    }

    const headers = firstLine.split(",").map((h) => h.trim().toLowerCase());

    if (!headers.includes("name") || !headers.includes("email")) {
      return { error: "El CSV debe tener las columnas name y email" };
    }

    const rows: CsvRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());
      rows.push({
        name: values[headers.indexOf("name")] || "",
        email: values[headers.indexOf("email")] || "",
        age: values[headers.indexOf("age")] || "",
        row: i + 1,
      });
    }

    return { rows };
  },

  validateRows(rows: CsvRow[]) {
    const errors: RowError[] = [];
    const validRows: CsvRow[] = [];

    rows.forEach((row, index) => {
      const rowErrors = validateRow(row);
      if (Object.keys(rowErrors).length > 0) {
        errors.push({ row: index + 2, details: rowErrors, rowData: row });
      } else {
        validRows.push(row);
      }
    });

    return { errors, validRows };
  },

  async importUsers(rows: CsvRow[]): Promise<CreateUsersResult> {
    const importedUserPassword = process.env.IMPORT_USER_PASSWORD || "prueba123";
    const hashedPassword = await bcrypt.hash(importedUserPassword, 10);
    return uploadRepository.createUsersFromCsv(rows, hashedPassword);
  },
};
