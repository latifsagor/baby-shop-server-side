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
    const customerInformation = database.collection('order_information')
    const usersInformation = database.collection('users')
    const reviewInfo = database.collection('review')

    // Create Api
    app.get('/products', async (req, res) => {
      const cursor = await productsCollection.find({}).toArray()
      //   console.log(cursor)
      res.json(cursor)
    })

    // Product added
    app.post('/addProduct', (req, res) => {
      productsCollection.insertOne(req.body).then((result) => {
        res.send(result.insertedId)
      })
    })

    // Order collection by Buy Now Button
    app.post('/addItem', async (req, res) => {
      const result = await orderCollection.insertOne(req?.body)
      res.json(result)
    })

    // Order Review
    app.get('/myOrders', async (req, res) => {
      const email = req?.query?.email
      const query = { email: email }
      const result = await orderCollection.find(query).toArray()
      res.send(result)
    })

    // Deleted orders products
    app.delete('/orders/:id', async (req, res) => {
      const id = req?.params?.id
      const query = { _id: ObjectId(id) }
      const result = await orderCollection.deleteOne(query)
      res.json(result)
    })

    // Deleted Customer Information
    app.delete('/customerInfo/:id', async (req, res) => {
      const id = req?.params?.id
      // console.log(id)
      const query = { _id: ObjectId(id) }
      const result = await customerInformation.deleteOne(query)
      res.json(result)
    })

    // Manage All Orders author only admin
    app.get('/manageAllOrders', async (req, res) => {
      const result = await orderCollection.find({}).toArray()
      res.json(result)
    })

    // Customer information
    app.post('/placeOrder', async (req, res) => {
      const result = await customerInformation.insertOne(req?.body)
      res.json(result)
    })

    // Manage order individual user
    app.get('/manageOrders', async (req, res) => {
      const email = req?.query?.email
      const query = { email: email }
      const result = await customerInformation.find(query).toArray()
      res.json(result)
    })

    // Manage all users order
    app.get('/manageAllOrdersUser', async (req, res) => {
      const result = await customerInformation.find({}).toArray()
      res.json(result)
    })

    // New User Information by Registration
    app.post('/users', async (req, res) => {
      const result = await usersInformation.insertOne(req?.body)
      res.json(result)
    })

    // New User Information by Google Register
    app.put('/users', async (req, res) => {
      const user = req?.body
      const filter = { email: user?.email }
      const options = { upsert: true }
      const updateDoc = { $set: user }
      const result = await usersInformation.updateOne(
        filter,
        updateDoc,
        options
      )
      res.json(result)
    })

    // Make an Admin
    app.put('/users/admin', async (req, res) => {
      const user = req?.body
      console.log('Put', user)
      const filter = { email: user?.email }
      const updateDoc = { $set: { role: 'admin' } }
      const result = await usersInformation.updateOne(filter, updateDoc)
      res.json(result)
    })

    // Only Admin has authorize to make an admin
    app.get('/users/:email', async (req, res) => {
      const email = req?.params?.email
      const query = { email: email }
      const user = await usersInformation.findOne(query)
      let isAdmin = false
      if (user?.role === 'admin') {
        isAdmin = true
      }
      res.json({ admin: isAdmin })
    })

    // Review create
    app.post('/review', async (req, res) => {
      const result = await reviewInfo.insertOne(req?.body)
      res.json(result)
    })

    // Review Read
    app.get('/reviewsInfo', async (req, res) => {
      const result = await reviewInfo.find({}).toArray()
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
