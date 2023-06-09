const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const userSchema = new Schema({
   name:{
      type: String,
      required: [true, "Please add a name"]
   },
   email:{
      type: String,
      required: [true, "Please add email"],
      unique: true,
      trim: true, //remove space
      match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ , "Please enter a valid emailID"]
   },
   password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Password must contains 6 characters"],
      //maxLength: [23, "Password must not be more than 23 characters"]
   },
   photo: {
      type: String,
      //required: [true, "Please add a photo"],
      default: "photos\avtar.jpg"
   },
   phone: {
      type: Number,
      default: +91,
   },
   bio: {
      type: String,
      maxLength: [250, "Bio must not be more than 250 characters"],
      default: "bio"
   }
},
   {
      timestamps: true,
   }
);

//ENCRYPT PASSWORD BEFOR SAVING IN DB
userSchema.pre("save", async function(next){
   if(!this.isModified("password")){
      return next()
   }
 //HASH PASSWORD        
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(this.password, salt);
this.password = hashedPassword
next();
})

const User = mongoose.model("User", userSchema)

module.exports = User;
// export default User;