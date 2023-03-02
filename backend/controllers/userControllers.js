const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
//const JWT_SECRET_KEY = "MyKey";

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET_KEY, {expiresIn: "1d"})
 }
// REGISTER USER
const registerUser = asyncHandler(async (req, res) => {

   const {name, email, password} = req.body;

   //VALIDATION
   if(!name || !email || !password){
      res.status(400)
      throw new Error("Please fill in all required fields")
   }
   if(password.length <= 6){
      res.status(400)
      throw new Error("Password must be of 6 characters")
   }
// CHECK EMAIL IF IT IS ALREADY EXIST
   const userExist = await User.findOne({email})
      if(userExist){
         res.status(400)
         throw new Error("User email has already been regestired")
      }
//CREATE NEW USER
   const user = await User.create({
         name,
         email,
         password,
      });
            //GENERATE TOKEN FOR USER
   const token = generateToken(user._id);
   // const token = jwt.sign({id: user._id},process.env.JWT_SECRET_KEY,{
      // expiresIn:"1d"
   // });
   //SEND HTTP-only COOKIE
   res.cookie("token",token,{
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now()+1000*86400),
      sameSite:"lax",
      secure:true,
   })
   // res.cookie("token",String(user._id),token,{
      // path: "/",
      // httpOnly: true,
      // expires: new Date(Date.now()+1000*86400),
      // sameSite:"lax"
   // })
   // res.cookie("token", token, {
      // path: "/",
      // httpOnly: true,
      // expires: new Date(Date.now() + 1000 * 86400), // 1 DAY
      // sameSite: "none",
      // secure: true,
   // })
      
      if(user){
         const {_id, name, email, photo, phone, bio} = user  
         res.status(201).json({
            _id, name, email, photo, phone, bio, token
         })
      }else{
         res.status(400)
            throw new Error("Invalid user data")
      }
  
});

//LOGIN USER
const loginUser = asyncHandler(async(req, res) => {
   const {email, password} = req.body
   //VALIDATE USER
   if(!email || !password){
      res.status(400);
      throw new Error("Please add email & password"); 
   }
   //check user exist
   const user = await User.findOne({email})
   if(!user){
      res.status(400);
      throw new Error("User not found, please Sing up");
   }
   //check if password is correct
   const passwordIsCorrect = await bcrypt.compare(password, user.password)
      
      //GENERATE TOKEN
   // const token = jwt.sign({id: user._id},process.env.JWT_SECRET_KEY,{
      // expiresIn:"1d"})
      const token = generateToken(user._id)
      //SEND HTTP-only COOKIE
   res.cookie("token",token,{
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now()+1000*86400),
      sameSite:"lax"
   })

      if(user && passwordIsCorrect){
         const {_id, name, email, photo, phone, bio} = user
         res.status(200).json({
            _id,
            name, 
            email,
            photo,
            phone,
            bio,
            token,
         });  
      }else{
         res.status(400)
         throw new Error("Invalid email or password")
      }
});

//LOGOUT USER
const logout = asyncHandler(async(req, res) => {
    res.cookie("token",String(),"",{
      path: "/",
      httpOnly: true,
      expires: new Date(0),
      sameSite:"none",
      secure:true,
    })
    return res.status(200).json({message:"successfully logged out"})
   //res.send("Logout user")
});

//get USER DATA
const getUser = asyncHandler(async(req, res) => {
   var user = await User.findById(req.user._id)

   if(user){
      const {_id, name, email, photo, phone, bio} = user
      res.status(200).json({
         _id, name, email, photo, phone, bio,
      });
   }else{
      res.status(400)
         throw new Error("User not found")
   }
})
//GET LOGIN STATUS
const loginStatus = asyncHandler(async(req, res) => {
   const token = req.cookies.token;
   if(!token){
      return res.json(false)
   }
   //verify token
   const verified = jwt.verify(token,process.env.JWT_SECRET_KEY)
   if(verified){
      return res.json(true)
   }
   return res.json(false)
})

//UPDATE USER
const updateUser = asyncHandler(async(req, res) => {
   const user = await User.findById(req.user._id)

   if(user){
      const {name, email, phone, photo, bio} = user;
      user.email = email;
      user.name = req.body.name || name;
      user.phone = req.body.phone || phone;
      user.photo = req.body.photo || photo;
      user.bio = req.body.bio || bio;
  
      const updatedUser = await user.save()
      res.status(200).json({
          _id: updatedUser._id,
         name: updatedUser.name,
         email: updatedUser.email,
         photo: updatedUser.photo,
         phone: updatedUser.phone,
         bio: updatedUser.bio,
      })
   }else{
      res.status(404)
      throw new Error("User not found")
   }
});
//CHANGE PASSWORD
const changePassword = asyncHandler(async(req, res) =>{
   const user = await User.findById(req.user._id)
   const {oldpassword , password} = req.body

   if(!user){
      res.status(400);
      throw new Error("User not found, please signup")
   }
   //VALIDATE
   if(!oldpassword || !password){
      res.status(400);
      throw new Error("Please add old and new password");
   }
   //CHECK IF PASSWORD MATCH WITH OLD PASSWORD
   const passwordIsCorrect = await bcrypt.compare(oldpassword, user.password)
   //SAVE NEW PASSWORD
   if(user && passwordIsCorrect){
      user.password = password
      await user.save()
      res.status(200).send("Password change successful")
   }else{
      res.status(400);
      throw new Error("Old password is incorrect")
   }
})

module.exports = {
   registerUser,
   loginUser,
   logout,
   getUser,
   loginStatus,
   updateUser,
   changePassword,
   
};