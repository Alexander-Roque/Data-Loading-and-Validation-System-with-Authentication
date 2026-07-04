import { Request, Response } from 'express';
import { uploadService } from '../service/upload.service';

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ ok: false, message: 'No se proporcionó ningún archivo' });
    return;
  }

  try {
    const content = req.file.buffer.toString('utf-8');
    const parsedCsv = uploadService.parseCsv(content);

    if ('error' in parsedCsv) {
      res.status(400).json({ ok: false, message: parsedCsv.error });
      return;
    }

    const { errors, validRows } = uploadService.validateRows(parsedCsv.rows);
    const importResult = await uploadService.importUsers(validRows);

    res.status(200).json({
      ok: true,
      data: {
        success: importResult.insertedUsers,
        errors: [...errors, ...importResult.errors],
      },
    });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: 'Error servidor internal' });
  }
};
