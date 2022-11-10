const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.klfob8q.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db("dentistDB").collection("services");
        const reviewCollection = client.db("dentistDB").collection("reviews");

        //READ services data from MnngoDB & create services api
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        //limit services api
        app.get('/servicesHome', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })

        //create a single service api
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //send data to mongo and create reviews api
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            //console.log(review);
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });


        //allreviews api using query parameter (service id)
        app.get('/allreviews', async (req, res) => {
            let query = {};

            if (req.query.service) {
                query = {
                    service: req.query.service
                }
            }

            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //myreviews api using query parameter (email)
        app.get('/myreviews', async (req, res) => {
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = reviewCollection.find(query);
            const myreview = await cursor.toArray();
            res.send(myreview);
        });

        //delete review
        app.delete('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });

        //send data to mongo and create service api
        app.post('/addservice', async (req, res) => {
            const service = req.body;
            //console.log(service);
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });




        //update review
        app.put('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const reviewinfo = req.body;
            const option = { upsert: true };

            const updatedReview = {
                $set: {
                    name: reviewinfo.name,
                    date: reviewinfo.date,
                    message: reviewinfo.message
                }
            }
            const result = await reviewCollection.updateOne(filter, updatedReview, option);
            res.send(result);
        })



    }
    finally {

    }
}
run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('Dr. Watson server is running');
})

app.listen(port, () => {
    console.log(`Dr. Watson server is running on: ${port}`);
})