import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploadTmp");
  },
  filename: (req, file, callback) => {
    callback(null, "data.csv");
  },
});

const upload = multer({ storage });
const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('csv_file')(req, res, (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(400).json({ error: 'File upload failed', message: "invalid format" })
    }
    next();
  })

}
export default uploadMiddleware;
