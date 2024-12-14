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
exports.searchItems = exports.uploadCSV = void 0;
const csv_parse_1 = require("csv-parse");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../db");
const uploadCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    const filePath = path_1.default.join(__dirname, '..', '..', '/uploadTmp/data.csv');
    try {
        const mDB = (0, db_1.getCollection)("upload");
        mDB.drop();
        const data = yield readCsvFile(filePath);
        yield mDB.insertMany(data);
        console.log(mDB.collectionName);
    }
    catch (error) {
        res.status(400).json({ message: 'Error loading file' });
    }
    res.status(200).json({ message: 'File uploaded successfully' });
    return;
});
exports.uploadCSV = uploadCSV;
function readCsvFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const headerCSV = [];
            const initialiseData = [];
            fs_1.default.createReadStream(`${filePath}`)
                .pipe((0, csv_parse_1.parse)({ bom: true }))
                .on("data", (row) => {
                if (headerCSV.length == 0) {
                    headerCSV.push(...row);
                    console.log("pushed", headerCSV);
                }
                else {
                    const newDataPoint = {};
                    row.forEach((val, index) => {
                        newDataPoint[headerCSV[index]] = val;
                    });
                    initialiseData.push(newDataPoint);
                }
            }).on("end", () => {
                resolve(initialiseData);
            });
        });
    });
}
const searchItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, offset, filter, sort } = req.body;
    try {
        const mDB = (0, db_1.getCollection)("upload");
        let offsetR = offset;
        let limitR = limit;
        if (!offsetR) {
            offsetR = 0;
        }
        if (!limitR) {
            limitR = 20;
        }
        let filterBody = {};
        let keySort = {};
        if (filter && filter.length > 0) {
            filterBody = convertKeySearchFilters(filter);
        }
        if (sort && sort.length > 0) {
            keySort = convertKeySortFilter(sort);
        }
        const foundData = yield mDB.find(filterBody)
            .skip(offsetR)
            .limit(limitR)
            .sort(keySort)
            .toArray();
        console.log(foundData.length);
        res.status(200).json({ data: foundData });
    }
    catch (err) {
        console.log("Search data items error", err);
        res.status(500).json({ error: "error fetching data" });
    }
});
exports.searchItems = searchItems;
function convertKeySearchFilters(filters) {
    const dbSearch = {};
    filters.forEach(keySet => {
        if (keySet.operator == "=") {
            dbSearch[keySet.key] = keySet.value;
        }
        else if (keySet.operator == "ilike") {
            dbSearch[keySet.key] = { $regex: `/${keySet.value}/`, $options: 'i' };
        }
    });
    return dbSearch;
}
function convertKeySortFilter(sortKeys) {
    const keySorted = {};
    sortKeys.forEach(keySet => {
        if (keySet.asc) {
            keySorted[keySet.key] = 1;
        }
        else {
            keySorted[keySet.key] = -1;
        }
    });
    return keySorted;
}
