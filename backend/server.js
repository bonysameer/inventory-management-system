const express = require("express");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
//const { urlencoded } = require("body-parser");
const userRoute = require("./routes/userRoutes");
const errorHandler = require("./middleWare/errorMiddleware")
const cookieParser = require('cookie-parser');

mongoose.set('strictQuery', false);

const app = express()

//MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
//ROUTES MIDDLEWARE
app.use("/api/users", userRoute)
//ROUTES
app.get("/", function(req,res,next){
   res.send("HELLO WORLD")
})
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));
// app.use(bodyParser.json());


//ERRORHANDLER
app.use(errorHandler);


const PORT=process.env.PORT
// mongoose.connect("mongodb+srv://Sameerbony:Indianarmy@cluster0.u45axrp.mongodb.net/Inventory-app?retryWrites=true&w=majority")
   mongoose.connect(process.env.MONGO_URI)
   .then(()=>{
      app.listen(PORT)
         console.log(`server connected on port ${PORT}`);
   })
   .catch((err) => console.log(err));
      
   // 

//const PORT = process.env.PORT || 
//console.log(process.env.PORT);

// mongoose
   // .connect(process.env.MONGO_URI)
   // .then(()=>{
   // app.listen(PORT, () => {
      // console.log(`servwr connected to ${PORT}`);
   // })     
// })
// .catch((err) => console.log(err));



// app.get("/",function(req, res, next){
   // res.send("Hello world")
// })
// 
// app.listen(3000,function(){
   // console.log("server connected to 3k");
// })