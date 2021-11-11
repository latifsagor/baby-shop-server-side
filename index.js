const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const port = process.env.PORT || 5000

// MiddleWare
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tigkh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

// console.log(uri)

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

async function run() {
  try {
    await client.connect()
    // console.log('Database connect')

    const database = client.db('Bike_Shop')
    const productsCollection = database.collection('products')
    const orderCollection = database.collection('orders')

    // Create Api
    app.get('/products', async (req, res) => {
      const cursor = await productsCollection.find({}).toArray()
      //   console.log(cursor)
      res.json(cursor)
    })

    // Order collection by Buy Now Button
    app.post('/addItem', async (req, res) => {
      const result = await orderCollection.insertOne(req?.body)
      res.json(result)
    })

    // Order Review
    app.get('/myOrders', async (req, res) => {
      const result = await orderCollection.find({}).toArray()
      res.send(result)
    })

    // Deleted orders products
    app.delete('/orders/:id', async (req, res) => {
      const id = req?.params?.id
      const query = { _id: ObjectId(id) }
      const result = await orderCollection.deleteOne(query)
      res.json(result)
    })
  } finally {
    // await client.close()
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at ${port}`)
})
