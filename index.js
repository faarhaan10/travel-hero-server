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
        const blogCollection = database.collection("blogs");


        /*******************************************\
         -------------all post api's----------------
        \*******************************************/
        // users
        app.post('/users', async (req, res) => {
            const doc = req.body;
            const result = await userCollection.insertOne(doc);
            res.send(result);
        });

        // blogs
        app.post('/blogs', async (req, res) => {
            const doc = req.body;
            const result = await blogCollection.insertOne(doc);
            res.send(result);
        });



        /*******************************************\
         -------------all get api's----------------
        \*******************************************/
        //check admin
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //get all blogs or filtered by email
        app.get('/blogs/all', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            let result;
            if (email) {
                const cursor = blogCollection.find(query).sort({ "_id": -1 });
                result = await cursor.toArray();
            }
            else {
                const cursor = blogCollection.find({}).sort({ "_id": -1 });
                result = await cursor.toArray();
            }
            res.send(result);
        });
        //blogs
        app.get('/blogs', async (req, res) => {
            const status = { status: true };
            const query = req.body.size;
            const cursor = blogCollection.find(status).sort({ "_id": -1 });
            let result;
            if (query) {
                result = await cursor.limit(query).toArray();
            }
            else {
                result = await cursor.toArray();
            }
            res.send(result);
        });

        // top blogs
        app.get('/blogs/top', async (req, res) => {
            const status = { status: true };
            const cursor = blogCollection.find(status).sort({ rating: -1 });
            const result = await cursor.limit(4).toArray();
            res.send(result);
        });

        // single blogs
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.findOne(query);
            res.send(result);
        });



        /*******************************************\
         -------------all put api's----------------
        \*******************************************/
        // users
        app.put('/users', async (req, res) => {
            const doc = req.body;
            const filter = { email: doc.email };
            const options = { upsert: true };
            const updateDoc = { $set: doc };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        //make user to an admin
        app.put('/users/admin', async (req, res) => {
            const doc = req.body;
            const filter = { email: doc.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        });


        /*******************************************\
         -------------all delete api's--------------
        \*******************************************/
        //delete blog
        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(query);
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