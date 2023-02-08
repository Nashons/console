const express = require('express');
const dbConnection = require('./config/dbConnect');
const User = require("./models/userModel");
const auth = require("./middleware/auth")
const bcrypt = require("bcrypt");
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2
const jwt = require("jsonwebtoken");
const cors = require('cors');
const app = express();
require('dotenv').config()





//execute the db connection
dbConnection();

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const PORT = 3001;
// app.use(express.json());
app.use(cors({origin: true, credentials: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.post("/register", (request, response) =>{

    //hash the password before saving the data
    bcrypt.hash(request.body.password, 10)
    .then((hashedPassword) => {
        const user = new User({
            email: request.body.email,
            password: hashedPassword,
        });
        user.save().then((result) => {
            response.status(201).send({
              message: "User Created Successfully",
              result,
            });
          })
          .catch((error) => {
            response.status(500).send({
              message: "Error creating user",
              error,
            });
          });
    })
    .catch((e) => {
        response.status(500).send({
            message: "password hash not succesfull",
            e,
        });
    });
});

app.post("/login", (request, response) => {
    //check if the email that the useer enters exists
    User.findOne({email: request.body.email })
    .then((user)=>{
        bcrypt.compare(request.body.password, user.password)
        .then((passwordCheck) => {
            //check if password matches

            if(!passwordCheck){
                return response.status(400).send({
                    message: "passwords not matching",
                    error,
                });
            }

            //create JWT token
            const token = jwt.sign(
                {
                    userId: user._id,
                    userEmail: user.email,
                },
                "RANDOM-TOKEN",
                { expiresIn: "24h"}
            );

            //return success response
            response.status(200).send({
                message: "Login successful",
                email: user.email,
                token,
            });
        })
        .catch((error) => {
          response.status(400).send({
            message: "Password does not match",
            error,
          });
        })
      })  
     .catch((e) => {
        response.status(404).send({
            message: "Email not found",
            e,
          });
    })
})

//image upload API
app.post("/upload-image", (request, response) => {

  //collect the image from the user
  const data = {
    image: request.body.image
  };

  //upload the image to cloudinary
  cloudinary.uploader.upload(data.image)
  .then((result) => {
    response.status(200).send({
      message: "success",
      result,
    });
  }) 
  .catch((error) => {
    response.status(500).send({
      message: "failure",
      error,
    });
  });

})


  
  
app.listen(PORT,()=>{console.log(' server running on port 3001...')})
