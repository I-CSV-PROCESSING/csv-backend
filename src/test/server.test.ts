import request from 'supertest';
import app from '../server';
import chai from 'chai';
import fs from 'fs';
import path from 'path';
const { expect } = chai;

describe('POST /csv-upload', () => {
    const filePath = path.join(__dirname, 'data.csv');
    const csvData = fs.readFileSync(filePath);

    it('should return 200 and the received data when valid data is sent', async () => {
        const response = await request(app)
            .post('/csv-upload')
            .attach('csv_file', csvData, { filename: 'data.csv', contentType: 'file/csv' })
            .set('Content-Type', 'application/json');

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            message: 'File uploaded successfully',
        });
    });

    it('should return 400 when no data is sent', async () => {
        const response = await request(app)
            .post('/csv-upload')
            .set('Content-Type', 'application/json');

        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            message: 'No file uploaded'
        });
    });

    it('should return 400 when payload is not correct', async () => {
        const response = await request(app)
            .post('/csv-upload')
            .attach('csv', csvData, { filename: 'data.csv', contentType: 'file/csv' })
            .set('Content-Type', 'application/json');

        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({
            error: 'File upload failed',
            message: "invalid format"
        });
    });

    it('should return 200 when different headers and data are provided', async () => {
        const filePathExtra = path.join(__dirname, 'data_extra.csv');
        const noFixData = fs.readFileSync(filePathExtra);
        const response = await request(app)
            .post('/csv-upload')
            .attach('csv_file', noFixData, { filename: 'data.csv', contentType: 'file/csv' })
            .set('Content-Type', 'application/json');

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({
            message: 'File uploaded successfully',
        });
    });
});

describe('POST /search', async () => {
    const filePath = path.join(__dirname, 'data.csv');
    const csvData = fs.readFileSync(filePath);

    before(async () => {
        const response = await request(app)
            .post('/csv-upload')
            .attach('csv_file', csvData, { filename: 'data.csv', contentType: 'file/csv' })
            .set('Content-Type', 'application/json');
    });

    it('should return 200 with a max of 20 data points for no filters', async () => {
        const respSearch = await request(app)
            .post('/search')
            .send({})
            .set('Content-Type', 'application/json');

        expect(respSearch.status).to.equal(200);
        expect(respSearch.body.data.length).to.equal(20);
    });

    it('should return 200 with a max of 10 data points for filters with limit of 10', async () => {
        const respSearch = await request(app)
            .post('/search')
            .send({ limit: 10 })
            .set('Content-Type', 'application/json');

        expect(respSearch.status).to.equal(200);
        expect(respSearch.body.data.length).to.equal(10);
    });

    it('should return 200 with 5 data points for filters with postId as 1', async () => {
        const respSearch = await request(app)
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
        const isCorrect: boolean = respSearch.body.data.every((x: any) => x.postId === "1")
        expect(isCorrect).to.true
    });

    it('should return 200 with 2 data points for filters with email that contain meghan', async () => {
        const respSearch = await request(app)
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
        const isCorrect: boolean = respSearch.body.data.every((x: any) => x.email.toLowerCase().includes('meghan'))
        expect(isCorrect).to.true
    });

    it('should return 200 with 1 data points for filters with email that contain meghan and id 9', async () => {
        const respSearch = await request(app)
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
        const isCorrect: boolean = respSearch.body.data.every((x: any) =>
            x.email.toLowerCase().includes('meghan') &&
            x.id === "9")
        expect(isCorrect).to.true
    });

    it('should return 200 with 5 data points with sorted by email', async () => {
        const respSearch = await request(app)
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
        const isCorrect: boolean = respSearch.body.data.every((x: any) =>
            x.email.toLowerCase().startsWith("z") || x.email.toLowerCase().startsWith("y"))
        expect(isCorrect).to.true

    });


    it('should return 200 with 5 data points with sorted by email, offset by 20', async () => {
        const respSearch = await request(app)
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
        const isCorrect: boolean = respSearch.body.data.every((x: any) =>
            x.email.toLowerCase().startsWith("v"))
        expect(isCorrect).to.true
    });

});


