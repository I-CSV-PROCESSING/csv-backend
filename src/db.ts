import { Collection, Db, MongoClient } from "mongodb";


let db: Db;

export const connectToMongoDB = async (uri: string, dbName: string, dbCollection: string): Promise<Db> => {
    if (!db) {
        try {
            const client: MongoClient = new MongoClient(uri);
            await client.connect();
            db = client.db(dbName);
            console.log('Successfully connected to MongoDB');

        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    return db;
};

export const getCollection = (name: string): Collection => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db.collection(name);
};
