const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express()
require('dotenv').config()
// middle wares
app.use(cors())
app.use(express.json())


// function for verifying jwt token
const verifyJWT = (req, res, next) => {
    const authToken = req.headers.authorization
    if (!authToken) {
        return res.status(401).send({
            message: 'Unauthorized Access'
        })
    }
    const token = authToken.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'Unauthorized Access'
            })
        }
        req.decoded = decoded
        next()
    })
}


// mongo configure
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.w9zclsg.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri);

const run = async () => {
    try {

        // jwt token generate
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2hr' })
            res.send({ token })
        })



        const tourDestinations = client.db('tourPlaces').collection('destinations')
        const reviewsCollection = client.db('tourPlaces').collection('reviews')

        // sending all data
        app.get('/services', async (req, res) => {
            const query = {}
            const result = await tourDestinations.find(query).sort({ createdTime: -1 }).toArray()
            res.send({
                status: "success",
                data: result
            })
        })

        // add service
        app.post('/addservice', async (req, res) => {
            const document = req.body;
            const result = await tourDestinations.insertOne(document)
            res.send({
                status: "success",
                data: result
            })
        })


        // sending 3 data to homepage
        app.get('/serviceshome', async (req, res) => {
            const query = {}
            const result = await tourDestinations.find(query).limit(3).sort({ createdTime: -1 }).toArray()
            res.send({
                status: "success",
                data: result
            })
        })

        // sending single data
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await tourDestinations.findOne(filter)
            res.send({
                status: 'success',
                data: result
            })
        })




        //posting review on services
        app.post('/postreview', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review)
            res.send(
                {
                    status: 'success',
                    data: result
                }
            )
        })

        // getting the specific reviews on each services
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { reviewedService: id }

            const result = await reviewsCollection.find(query).sort({ reviewTime: -1 }).toArray()
            res.send({
                status: "success",
                data: result
            })

        })

        // getting all  the specefic reviews by each user have reviewed
        app.get('/myreviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded
            const email = req.query.email;


            if (decoded.email !== email) {
                return res.status(403).send({
                    message: 'Forbidden Access'
                })
            }

            const filter = { email: email }
            const result = await reviewsCollection.find(filter).toArray()

            res.send({
                status: "success",
                data: result
            })

        })
        // sorting the review user need to get before update review
        app.get('/myreviews/:id', async (req, res) => {
            const id = req.params.id;

            const filter = { _id: ObjectId(id) }
            const result = await reviewsCollection.findOne(filter)
            res.send({
                status: "success",
                data: result
            })

        })


        // delete single review
        app.delete('/deletereview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(filter)
            res.send({
                status: "success",
                data: result
            })
        })

        // api for updating an existing review
        app.patch('/updatereview/:id', async (req, res) => {
            const id = req.params.id;
            const updatedDoc = req.body
            const filter = { _id: ObjectId(id) }
            const result = await reviewsCollection.replaceOne(filter, updatedDoc)
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