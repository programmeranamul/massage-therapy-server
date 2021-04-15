const express = require('express')
const cors = require("cors");
const fileUpload = require('express-fileupload');

const bodyParser = require("body-parser");
require('dotenv').config()


const app = express()
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload())

const port = 8000

app.get('/', (req, res) => {
    res.send('Hello World!')
})


//Database connection

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5yvtj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    //admin collection
    const adminCollection = client.db("massageTherapyCenter").collection("admin");
    const serviceCollection = client.db("massageTherapyCenter").collection("services");
    const reviewCollection = client.db("massageTherapyCenter").collection("reviews");


    //add admin in database by post method
    app.post('/addAdmin', (req, res) => {
        const adminEmail = req.body
        adminCollection.insertOne(adminEmail)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })


    //add new service in database by post method
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const serviceName = req.body.serviceName;
        const serviceDescription = req.body.serviceDescription;
        const serviceCharge = req.body.serviceCharge;
        const newImg = file.data
        const encImg = newImg.toString('base64')
    
        const image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
        };
        
        serviceCollection.insertOne({ serviceName,serviceDescription,serviceCharge, image })
          .then(result => {
            res.send(result.insertedCount > 0)
          })
    
      })


      //get all service from database to show in ui by get request
      app.get("/services", (req, res) => {
        serviceCollection.find({})
        .toArray((error, documents) => {
            res.send(documents)
          
        })
      })


      //chek loged in user is a admin or customer 
      app.post('/isAdmin', (req, res) => {
          const email = req.body.email
          adminCollection.find({email :email })
          .toArray((error, documents) => {
              res.send(documents.length > 0)
              console.log(documents)
          })
        
      })


      //send review data in database by post request
      app.post('/addReview',(req,res) => {
           const reviewData = req.body
           console.log(reviewData)
           reviewCollection.insertOne(reviewData)
           .then(result => {
               res.send(result.insertedCount > 0)
           })
      })


      //get review data from database by get request
      app.get('/reviews', (req,res) => {
        reviewCollection.find({})
        .toArray((error,documents) => {
            res.send(documents)
        }) 
      })



});




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

//massageTherapyCenter
//admin
//massageAdmin
//CxB3DpNhCId4r8cu