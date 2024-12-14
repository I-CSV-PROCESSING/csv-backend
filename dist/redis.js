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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
class RedisClient {
    constructor() {
        const redisPort = process.env.REDIS_PORT || '6379';
        const redisHost = process.env.REDIS_HOST || '';
        const redisUser = process.env.REDIS_USERNAME || '';
        const redisPass = process.env.REDIS_PASSWORD || '';
        this.client = new ioredis_1.default({
            host: redisHost,
            port: parseInt(redisPort),
            password: redisPass,
            username: redisUser
        });
        this.client.on('connect', () => {
            console.log(`Connected to Redis on port ${redisPort}`);
        });
        this.client.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }
    setValue(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.set(key, value);
            console.log(`Set ${key} = ${value}`);
        });
    }
    // Method to get a value from Redis
    getValue(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.client.get(key);
            console.log(`Got ${key} = ${value}`);
            return value;
        });
    }
    // Method to close the Redis connection
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.quit();
            console.log('Redis connection closed.');
        });
    }
}
exports.default = RedisClient;
