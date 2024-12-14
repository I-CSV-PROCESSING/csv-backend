"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const csvRoutes_1 = __importDefault(require("./routes/csvRoutes"));
const db_1 = require("./db");
// dotenv.config();
const port = 8000;
const app = (0, express_1.default)();
dotenv_1.default.config();
dotenv_1.default.configDotenv();
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'; // Fallback to localhost if not set
const dbName = process.env.DB_NAME || 'csv_upload';
const dbCollection = process.env.MONGODB_COLLECTION || 'upload';
(0, db_1.connectToMongoDB)(uri, dbName, dbCollection);
app.use('/', express_1.default.json(), csvRoutes_1.default);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
