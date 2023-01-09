const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");  //Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

dotenv.config();

mongoose.connect(process.env.MONGO_URL,()=>{
    console.log("connected to MongoDB");
});


//middleware
app.use(express.json());//a body-parser
app.use(helmet());
app.use(morgan("common"));


//api
app.use("/api/users",userRoute);
app.use("/api/auth",authRoute);
app.use("/api/post",postRoute);

app.listen(8800,()=>{
    console.log("backend server is running at port 8800");
});