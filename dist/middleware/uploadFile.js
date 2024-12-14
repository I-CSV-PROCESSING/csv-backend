"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "uploadTmp");
    },
    filename: (req, file, callback) => {
        callback(null, "data.csv");
    },
});
const upload = (0, multer_1.default)({ storage });
const uploadMiddleware = (req, res, next) => {
    upload.single('csv_file')(req, res, (err) => {
        if (err) {
            console.error('Error uploading file:', err);
            return res.status(400).json({ error: 'File upload failed', message: "invalid format" });
        }
        next();
    });
};
exports.default = uploadMiddleware;
