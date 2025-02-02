const express = require('express')
const router = express.Router();
const cors = require('cors')
const {test,registerUser,loginUser} = require('../controllers/authController')
const User = require('../models/user');
const Token = require('../models/token');
const cloudinary = require("../helper/cloudinaryconfig");
//const upload = multer({ dest: 'images/' })
const multer = require("multer");
//middleware
router.use(
    cors({
        credentials: true,
        origin: "http://localhost:5173"
    })
)
const imgconfig = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,"images/")
    },
    filename:(req,file,callback)=>{
        callback(null,`image-${Date.now()}.${file.originalname}`)
    }
});
// img filter
const isImage = (req,file,callback)=>{
    if(file.mimetype.startsWith("image")){
        callback(null,true)
    }else{
        callback(new Error("only images is allow"))
    }
}

const upload = multer({
    storage:imgconfig,
    fileFilter:isImage
})



router.get('/',test)
router.post('/register',upload.single('image'), registerUser)

router.post('/login', loginUser)

router.get("/:id/verify/:token",async(req,res)=>{
    try {
        const user = await User.findOne({_id: req.params.id});
        if(!user) return res.status(400).send({message: " Invalid link"});
        const token = await Token.findOne({
            userId: user._id,
            token : req.params.token
        });
        if (!token) return res.status(400).send({message:"Invalid link"});
         user.verified =true ;
         await user.save();
         res.redirect("http://localhost:5173/login")
       
    } catch (error) {
        res.status(500).send({message: "Internal server error"});
        console.log(error)
    }
})


module.exports = router