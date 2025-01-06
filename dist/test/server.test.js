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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const chai_1 = __importDefault(require("chai"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { expect } = chai_1.default;
describe('POST /csv-upload', () => {
    const filePath = path_1.default.join(__dirname, 'data.csv');
    const csvData = fs_1.default.readFileSync(filePath);
    it('should return 200 and the received data when valid data is sent', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post('/csv-upload')
            .attach('csv_file', csvData, { filename: 'data.csv', contentType: 'file/csv' })
            .set('Content-Type', 'application/json');
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            message: 'File uploaded successfully',
        });
    }));
    it('should return 400 when no data is sent', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post('/csv-upload')
            .set('Content-Type', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            message: 'No file uploaded'
        });
    }));
    it('should return 400 when payload is not correct', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post('/csv-upload')
            .attach('csv', csvData, { filename: 'data.csv', contentType: 'file/csv' })
            .set('Content-Type', 'application/json');
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            error: 'File upload failed',
            message: "invalid format"
        });
    }));
    it('should return 200 when different headers and data are provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const filePathExtra = path_1.default.join(__dirname, 'data_extra.csv');
        const noFixData = fs_1.default.readFileSync(filePathExtra);
        const response = yield (0, supertest_1.default)(server_1.default)
            .post('/csv-upload')
            .attach('csv_file', noFixData, { filename: 'data.csv', contentType: 'file/csv' })
            .set('Content-Type', 'application/json');
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            message: 'File uploaded successfully',
        });
    }));
});
describe('POST /search', () => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path_1.default.join(__dirname, 'data.csv');
    const csvData = fs_1.default.readFileSync(filePath);
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default)
            .post('/csv-upload')
            .attach('csv_file', csvData, { filename: 'data.csv', contentType: 'file/csv' })
            .set('Content-Type', 'application/json');
    }));
    it('should return 200 with a max of 20 data points for no filters', () => __awaiter(void 0, void 0, void 0, function* () {
        const respSearch = yield (0, supertest_1.default)(server_1.default)
            .post('/search')
            .send({})
            .set('Content-Type', 'application/json');
        expect(respSearch.status).to.equal(200);
        expect(respSearch.body.data.length).to.equal(20);
    }));
    it('should return 200 with a max of 10 data points for filters with limit of 10', () => __awaiter(void 0, void 0, void 0, function* () {
        const respSearch = yield (0, supertest_1.default)(server_1.default)
            .post('/search')
            .send({ limit: 10 })
            .set('Content-Type', 'application/json');
        expect(respSearch.status).to.equal(200);
        expect(respSearch.body.data.length).to.equal(10);
    }));
    it('should return 200 with 5 data points for filters with postId as 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const respSearch = yield (0, supertest_1.default)(server_1.default)
            .post('/search')
            .send({
            filters: [
                {
                    key: 'postId',
                    value: '1',
                    operator: '='
                }
            ]
        })
            .set('Content-Type', 'application/json');
        expect(respSearch.status).to.equal(200);
        expect(respSearch.body.data.length).to.equal(5);
        const isCorrect = respSearch.body.data.every((x) => x.postId === "1");
        expect(isCorrect).to.true;
    }));
    it('should return 200 with 2 data points for filters with email that contain meghan', () => __awaiter(void 0, void 0, void 0, function* () {
        const respSearch = yield (0, supertest_1.default)(server_1.default)
            .post('/search')
            .send({
            filters: [
                {
                    key: 'email',
                    value: 'meghan',
                    operator: 'ilike'
                }
            ]
        })
            .set('Content-Type', 'application/json');
        expect(respSearch.status).to.equal(200);
        expect(respSearch.body.data.length).to.equal(2);
        const isCorrect = respSearch.body.data.every((x) => x.email.toLowerCase().includes('meghan'));
        expect(isCorrect).to.true;
    }));
    it('should return 200 with 1 data points for filters with email that contain meghan and id 9', () => __awaiter(void 0, void 0, void 0, function* () {
        const respSearch = yield (0, supertest_1.default)(server_1.default)
            .post('/search')
            .send({
            filters: [
                {
                    key: 'email',
                    value: 'meghan',
                    operator: 'ilike'
                },
                {
                    key: 'id',
                    value: '9',
                    operator: '='
                }
            ]
        })
            .set('Content-Type', 'application/json');
        expect(respSearch.status).to.equal(200);
        expect(respSearch.body.data.length).to.equal(1);
        const isCorrect = respSearch.body.data.every((x) => x.email.toLowerCase().includes('meghan') &&
            x.id === "9");
        expect(isCorrect).to.true;
    }));
    it('should return 200 with 5 data points with sorted by email', () => __awaiter(void 0, void 0, void 0, function* () {
        const respSearch = yield (0, supertest_1.default)(server_1.default)
            .post('/search')
            .send({
            sort: [
                {
                    key: 'email',
                    asc: false,
                },
            ],
            limit: 5
        })
            .set('Content-Type', 'application/json');
        expect(respSearch.status).to.equal(200);
        expect(respSearch.body.data.length).to.equal(5);
        const isCorrect = respSearch.body.data.every((x) => x.email.toLowerCase().startsWith("z") || x.email.toLowerCase().startsWith("y"));
        expect(isCorrect).to.true;
    }));
    it('should return 200 with 5 data points with sorted by email, offset by 20', () => __awaiter(void 0, void 0, void 0, function* () {
        const respSearch = yield (0, supertest_1.default)(server_1.default)
            .post('/search')
            .send({
            sort: [
                {
                    key: 'email',
                    asc: false,
                },
            ],
            limit: 5,
            offset: 20
        })
            .set('Content-Type', 'application/json');
        expect(respSearch.status).to.equal(200);
        expect(respSearch.body.data.length).to.equal(5);
        const isCorrect = respSearch.body.data.every((x) => x.email.toLowerCase().startsWith("v"));
        expect(isCorrect).to.true;
    }));
}));
