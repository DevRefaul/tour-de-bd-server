const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()
// middle wares
app.use(cors())
app.use(express.json())


// mongo configure
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.w9zclsg.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri);

const run = async () => {
    try {

        const tourDestinations = client.db('tourPlaces').collection('destinations')

        // sending all data
        app.get('/services', async (req, res) => {
            const query = {}
            const result = await tourDestinations.find(query).toArray()
            res.send({
                status: "success",
                data: result
            })
        })
        // sending 3 data to homepage
        app.get('/serviceshome', async (req, res) => {
            const query = {}
            const result = await tourDestinations.find(query).limit(3).toArray()
            res.send({
                status: "success",
                data: result
            })
        })

    } catch (error) {

    }
}
run()
// apis
app.get('/', (req, res) => {
    res.send('Server is Up and Running')
})





app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})