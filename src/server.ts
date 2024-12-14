import express from 'express';
import dotenv from 'dotenv';
import csvRoutes from './routes/csvRoutes';
import { connectToMongoDB } from './db';


// dotenv.config();
const port = 8000;
const app = express();
dotenv.config()
dotenv.configDotenv()

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'; // Fallback to localhost if not set
const dbName = process.env.DB_NAME || 'csv_upload';
const dbCollection = process.env.MONGODB_COLLECTION || 'upload';

connectToMongoDB(uri, dbName, dbCollection);

app.use('/', express.json(), csvRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;


