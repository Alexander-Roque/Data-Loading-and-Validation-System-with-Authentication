import { Request, Response } from 'express';
import pool from '../config/db';

interface CsvRow {
  name: string;
  email: string;
  age: string;
}

interface RowError {
  row: number;
  details: {
    name?: string;
    email?: string;
    age?: string;
  };
}

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRow = (row: CsvRow): RowError['details'] => {
  const errors: RowError['details'] = {};

  if (!row.name || row.name.trim() === '') {
    errors.name = "El campo 'name' no puede estar vacío.";
  }

  if (!row.email || row.email.trim() === '') {
    errors.email = "El campo 'email' no puede estar vacío.";
  } else if (!validateEmail(row.email.trim())) {
    errors.email = "El formato del campo 'email' es inválido.";
  }

  if (row.age !== undefined && row.age.trim() !== '') {
    const age = Number(row.age);
    if (!Number.isInteger(age) || age <= 0) {
      errors.age = "El campo 'age' debe ser un número entero positivo.";
    }
  }

  return errors;
};

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ ok: false, message: 'No se proporcionó ningún archivo' });
    return;
  }

  try {
    const content = req.file.buffer.toString('utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) {
      res.status(400).json({ ok: false, message: 'El CSV está vacío' });
      return;
    }

    const firstLine = lines[0];
    if (!firstLine) {
      res.status(400).json({ ok: false, message: 'El CSV está vacío' });
      return;
    }

    const headers = firstLine.split(',').map(h => h.trim().toLowerCase());

    if (!headers.includes('name') || !headers.includes('email')) {
      res.status(400).json({ ok: false, message: 'El CSV debe tener las columnas name y email' });
      return;
    }

    const success: object[] = [];
    const errors: RowError[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) {
        continue;
      }

      const values = line.split(',').map(v => v.trim());
      const row: CsvRow = {
        name: values[headers.indexOf('name')] || '',
        email: values[headers.indexOf('email')] || '',
        age: values[headers.indexOf('age')] || '',
      };

      const rowErrors = validateRow(row);

      if (Object.keys(rowErrors).length > 0) {
        errors.push({ row: i + 1, details: rowErrors });
        continue;
      }

      const result = await pool.query(
        'INSERT INTO users (name, email, age, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, age',
        [
          row.name.trim(),
          row.email.trim(),
          row.age.trim() !== '' ? Number(row.age) : null,
          'user',
        ]
      );

      success.push(result.rows[0]);
    }

    res.status(200).json({
      ok: true,
      data: { success, errors },
    });

  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
};
