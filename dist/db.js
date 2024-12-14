"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollection = exports.connectToMongoDB = void 0;
const mongodb_1 = require("mongodb");
let db;
const connectToMongoDB = (uri, dbName, dbCollection) => __awaiter(void 0, void 0, void 0, function* () {
    if (!db) {
        try {
            const client = new mongodb_1.MongoClient(uri);
            yield client.connect();
            db = client.db(dbName);
            console.log('Successfully connected to MongoDB');
        }
        catch (error) {
            console.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    return db;
});
exports.connectToMongoDB = connectToMongoDB;
const getCollection = (name) => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db.collection(name);
};
exports.getCollection = getCollection;
