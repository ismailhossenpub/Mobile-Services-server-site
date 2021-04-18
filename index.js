const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbarr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express();

app.use(express.json());
app.use(cors());

const port = 5500;

app.get("/", (req, res) => {
  res.send("Mobile Service");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const serviceCollection = client.db("MobileServices").collection("service");
  const reviewCollection = client.db("MobileServices").collection("review");
  const ordersCollection = client.db("MobileServices").collection("orders");
  const emailCollection = client.db("MobileServices").collection("emails");

//Admin part
  app.get("/isAdmin", (req, res) => {
    const email = req.body.email;
    console.log("Email",email);
    emailCollection.find({email: email})
    .toArray((err, admins) => {
      res.send(admins.length > 0);
    });
  });

  app.post("/makeAdmin", (req, res) => {
    const newAdmin = req.body;
    emailCollection.insertOne(newAdmin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

// Service part
//Write service
  app.post("/addService", (req, res) => {
    const newService = req.body;
    serviceCollection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
//Read service
  app.get("/service", (req, res) => {
    serviceCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });


// Review part
//Write Review
  app.post("/addReview", (req, res) => {
    const newReview = req.body;
    reviewCollection.insertOne(newReview).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
//Read Review
  app.get("/review", (req, res) => {
    reviewCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });
  

  //Read by id
  app.get("/book/:id", (req, res) => {
    const id = req.params.id;
    serviceCollection.find({ _id: ObjectID(id) }).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/getOrder", (req, res) => {
    ordersCollection.find({ email: req.query.email }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete("/deleteBook/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    console.log("delete this", id);
    serviceCollection
      .deleteOne({ _id: id })
      .then(result =>{
        res.send(result.deletedCount > 0);
      })
  });

});

app.listen(process.env.PORT || port);
