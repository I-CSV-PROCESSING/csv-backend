import { Request, Response } from 'express';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getCollection } from '../db';

export const uploadCSV = async (req: Request, res: Response): Promise<void> => {
    const file = req.file;

    if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return
    }

    const filePath = path.join(__dirname, '..', '..', '/uploadTmp/data.csv');
    try {
        const mDB = getCollection("upload");
        mDB.drop()
        const data = await readCsvFile(filePath)
        await mDB.insertMany(data)
    } catch (error) {
        res.status(400).json({ message: 'Error loading file' });
    }

    res.status(200).json({ message: 'File uploaded successfully' });
    return
};

async function readCsvFile(filePath: string) {
    return new Promise<Array<{ [key: string]: any }>>((resolve, reject) => {
        const headerCSV: Array<string> = []
        const initialiseData: Array<{ [key: string]: any }> = [];

        fs.createReadStream(`${filePath}`)
            .pipe(parse({ bom: true }))
            .on("data", (row) => {
                if (headerCSV.length == 0) {
                    headerCSV.push(...row);
                } else {
                    const newDataPoint: { [key: string]: any } = {}
                    row.forEach((val: string, index: number) => {
                        newDataPoint[headerCSV[index]] = val;
                    });
                    initialiseData.push(newDataPoint);
                }
            }).on("end", () => {
                resolve(initialiseData);
            });
    });
}


type SearchReq = {
    limit: number;
    offset: number;
    filters: Array<keySearch>;
    sort: Array<keySort>
};

type keySearch = {
    key: string;
    value: string;
    operator: string;
}

type keySort = {
    key: string;
    asc: boolean;
}

export const searchItems = async (req: Request, res: Response): Promise<void> => {
    const { limit, offset, filters, sort } = req.body;
    try {

        const mDB = getCollection("upload");

        let offsetR = offset
        let limitR = limit

        if (!offsetR) {
            offsetR = 0;
        }

        if (!limitR) {
            limitR = 20;
        }

        let filterBody = {}
        let keySort = {}
        if (filters && filters.length > 0) {
            filterBody = convertKeySearchFilters(filters);
        }
        if (sort && sort.length > 0) {
            keySort = convertKeySortFilter(sort);
        }

        const foundData = await mDB.find(filterBody)
            .skip(offsetR)
            .limit(limitR)
            .sort(keySort)
            .toArray();

        res.status(200).json({ data: foundData });
    } catch (err) {
        console.log("Search data items error", err)
        res.status(500).json({ error: "error fetching data" });
    }
};

function convertKeySearchFilters(filters: Array<keySearch>) {
    const dbSearch: { [key: string]: any } = {}
    filters.forEach(keySet => {
        if (keySet.operator === "=") {
            dbSearch[keySet.key] = keySet.value
        } else if (keySet.operator === "ilike") {
            dbSearch[keySet.key] = { $regex: `${keySet.value}`, $options: 'i' }
        } else {
            console.log("no such operator for filters")
        }
    });
    return dbSearch;
}

function convertKeySortFilter(sortKeys: Array<keySort>) {
    const keySorted: { [key: string]: any } = {}
    sortKeys.forEach(keySet => {
        if (keySet.asc) {
            keySorted[keySet.key] = 1
        } else {
            keySorted[keySet.key] = -1
        }
    });
    return keySorted;
}
