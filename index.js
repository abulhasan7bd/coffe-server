const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const { ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://coffe_application:CHcbvt4pOPocnPzf@coffe-cluster.qufz1bm.mongodb.net/?retryWrites=true&w=majority&appName=coffe-cluster`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// response route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected succesfull");

    // Create database and collection
    const coffeeDatabase = client.db("coffeeDB");
    const coffeeCollection = coffeeDatabase.collection("coffees");

    // get all coffes
    app.get("/coffees", async (req, res) => {
      try {
        const allCoffees = await coffeeCollection.find().toArray();
        console.log(allCoffees);
        res.status(200).json(allCoffees);
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch coffees" });
      }
    });

    // coffee create
    app.post("/coffee", async (req, res) => {
      try {
        const coffee = req.body;
        const result = await coffeeCollection.insertOne(coffee);
        res.status(201).json({
          result: result,
          message: "Coffee added successfully",
          coffee: coffee,
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to add coffee" });
      }
    });

    // update

    // single data get
    app.get("/coffe/:id", async (req, res) => {
      try {
        const id = req.params.id.trim();
        const query = { _id: new ObjectId(id) };
        const findCoffeeCard = await coffeeCollection.findOne(query);
        res.send(findCoffeeCard);
      } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: err.message,
        });
      }
    });

  // ✅ Update route
app.put("/coffees/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateCoffee = req.body;

  const updateDoc = {
    $set: updateCoffee,
  };

  try {
    const result = await coffeeCollection.updateOne(filter, updateDoc);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Update failed" });
  }
});

// ✅ Get coffee by ID for loader
app.get("/coffees/:id", async (req, res) => {
  const id = req.params.id;
  const coffee = await coffeeCollection.findOne({ _id: new ObjectId(id) });
  res.send(coffee);
});


    // coffee deleate
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id.trim();
      const query = { _id: new ObjectId(id) };
      try {
        const result = await coffeeCollection.deleteOne(query);
        res.status(201).json({ deleteStatus: true, dleletdata: result });

        if (result.deletedCount === 1) {
          console.log("Successfully deleted one document.");
        } else {
          console.log("No documents matched the query. Deleted 0 documents.");
        }
      } catch (error) {
        res.status(500).json({ deletStatus: false, message: error.message });
      }
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

run().catch(console.dir);
