const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u8ama.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("Ema_John");
      const productCollection = database.collection("Products");
      const orderCollection = database.collection("Orders");
      
      // Get All items
      app.get('/products', async (req, res) => {
          console.log(req.query);
          const cursor = productCollection.find({});
          const page = req.query.page;
          const size = req.query.size;
          let products = [];
          const count = await cursor.count();
          if(page){
            products = await cursor.skip(page * size).limit(parseInt(size)).toArray();
          }
          else{
            const products = await cursor.toArray();
          }
          
          res.send({
              count,
            products
          }); 
      })

      // Use post to get Data by key
      app.post('/products/byKeys', async (req, res) => {
        const keys = req.body;
        const query = {key: {$in: keys}}
        const products = await productCollection.find(query).toArray();
        res.send(products);
      })

      // Get orders from DB 
      app.get('/orders', async (req, res) => {
        let query = {};
        const email = req.query.email;
        if(email){
          query = { email: email }
        }
        const result = await orderCollection.find(query).toArray();
        res.send(result);
      })

      // Post Orders to DB
      app.post('/orders', async (req, res) => {
        const order = req.body;
        order.createAt = new Date();
        console.log(order);
        const result = await orderCollection.insertOne(order);
        res.json(result);
      })
      
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Server is Running');
})

app.listen(port, () => {
    console.log('Listening to', port);
})