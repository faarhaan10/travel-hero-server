const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middle weares
app.use(cors());
app.use(express.json());


//mongodb connection tools
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y4qnm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("travelHeroDB");
        // db collections
        const userCollection = database.collection("users");


        /***************\
         all post api's 
        \***************/
        // users
        app.post('/users', async (req, res) => {
            const doc = req.body;
            const result = await userCollection.insertOne(doc);
            res.send(result);
            console.log(doc)
            console.log(result)
        });


        /***************\
         all put api's 
        \***************/
        // users
        app.put('/users', async (req, res) => {
            const doc = req.body;
            const filter = { email: doc.email };
            const options = { upsert: true };
            const updateDoc = { $set: doc };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


//default api's
app.get('/', (req, res) => {
    res.send('Databse is live');
});

app.listen(port, () => {
    console.log('DB is running on port', port);
});