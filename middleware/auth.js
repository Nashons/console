const jwt = require("jsonwebtoken");

//authorization code will leave here
module.exports = async (request, response, next) => {
    //use try catch block to check if a user is logged in
    try {
        //get the authorization token from authorization header
        const token = await request.headers.authorization.split("")[1];

        //Check if the token that was generated matches the token string (RANDOM-TOKEN) entered initially
        const decodedToken = await jwt.verify(
            token,
            "RANDOM-TOKEN"
        );

        
// retrieve the user details of the logged in user
    const user = await decodedToken;

    
// pass the the user down to the endpoints here
request.user = user;


// pass down functionality to the endpoint
next();
        
    } catch (error) {
        response.status(401).json({
            error: new Error("Invalid request!"),
          });
    }
}