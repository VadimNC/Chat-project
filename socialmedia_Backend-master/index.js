
//imporing express cors logicfile multer db file path and jwt
const express=require('express')
const cors=require('cors')
const logic=require('./services/logic')
const multer=require('multer')
const db=require('./services/db')
const path=require('path')
const jwt=require('jsonwebtoken')
require('dotenv').config()


//Schema

//creating server using express
const server=express()
//connecting frontend with backend
server.use(cors({
    origin:'http://localhost:4200'
}))

//for getting the response as json data
server.use(express.json())

//for getting the images we need to change the images folder to a static public folder
server.use("/images",express.static('images'));

//connecting the server to port 5000
server.listen(5000,()=>{
   console.log('server connected to port 5000')
})

//setting up middleware
const jwtmiddleware=(req,res,next)=>{
    console.log('inside jwt token middleware')

    try {
        const token=req.headers["shots-token"] //getting token through headers
        console.log(token)
        const data=jwt.verify(token,'shots_key_2023') //verifying token
        console.log(data)
        next()
        
        
    } catch (error) {
        //throwing error if no token found or token doesnt match
        res.status(400).json('Please login')
    }
}

//setting up the function for storing the image
const imageStorage = multer.diskStorage({
    // Destination to store image     
    destination: 'images', 
    //creating a unique filename
      filename: (req, file, cb) => {
          cb(null, file.fieldname + '_' + Date.now() 
             + path.extname(file.originalname))
            
    }
});

//setting up function for uploading an image
const imageUpload = multer({
    //giving the storage as storage function
    storage: imageStorage,
    //filesize
    limits: {
      fileSize: 1000000 //size of file
    }

}) 
  

//uploading the post to the server
server.post('/social/uploadFile/:userId',imageUpload.any(),jwtmiddleware, (req, res) => { 
    //placing the image upload function after the path
    console.log('Inside upload file api request')
    
    console.log(req.files)
    console.log(req.params.userId)
    //setting date for sorting
    var date=new Date
    //uploading the details to the mongodb
    logic.uploadDetails(req.params.userId,req.files[0].destination,req.files[0].filename,req.files[0].path,date).then((response)=>{
        console.log(response)
        //making a like document on heart collection
        logic.startLikes(req.files[0].filename).then((response)=>{
            
        })
        res.status(response.statuscode).json(response)
    })
    


}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//storage post portion ended

server.get('/social',(req,res)=>{
    console.log('on main page')
})

//registering an account
server.post('/social/register',(req,res)=>{
    console.log('inside register api call')
    logic.registerUser(req.body.Name,req.body.Email,req.body.Password).then((response)=>{
        res.status(response.statuscode).json(response)
    })
})

//for logging in to the account
server.post('/social/login',(req,res)=>{
    console.log('Inside login api call')
    logic.login(req.body.Email,req.body.Password).then((response)=>{
        res.status(response.statuscode).json(response)
    })
})



server.get('/social/getdetails/:InstaId',jwtmiddleware,(req,res)=>{
    console.log('Inside getdetails api call')
    logic.getDetails(req.params.InstaId).then((response)=>{
        res.status(response.statuscode).json(response)
    })
})

server.get('/social/getallusers',jwtmiddleware,(req,res)=>{
    console.log('inside get all req call')
    logic.getAllUsers().then((response)=>{
        res.status(response.statuscode).json(response)
    })
})

//updating followers into server
server.post('/social/updatefollower/:userId',jwtmiddleware,(req,res)=>{
    logic.followUser(req.params.userId,req.body.followId).then((response)=>{
        res.status(response.statuscode).json(response)
    })
})

//getting details of a specific user
server.get('/social/viewSuggestion/:suggestionId',jwtmiddleware,(req,res)=>{
    logic.viewSuggestion(req.params.suggestionId).then((response)=>{
        res.status(response.statuscode).json(response)
    })
})

//profile picture
server.post('/social/profilepic/:userId',imageUpload.any(),jwtmiddleware, (req, res) => {
    console.log('Inside profilepic api request')
    
    // console.log(req.files)
    // console.log(req.params.userId)
    var date=new Date
    logic.uploadProfilePic(req.params.userId,req.files[0].destination,req.files[0].filename,req.files[0].path,date).then((response)=>{
        // console.log(response)
        res.status(response.statuscode).json(response)
    })
   

})

//uploading comments
server.post('/social/uploadcomment',jwtmiddleware,(req,res)=>{
    console.log('inside upload comment call')
    var date =new Date
    logic.addComments(req.body.filename,req.body.from_id,req.body.to_id,req.body.comment,date).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})

//gettign the uploaded comments
server.get('/social/readcomments/:filename',jwtmiddleware,(req,res)=>{
    console.log('Inside get comments call')
    logic.readComments(req.params.filename).then((response)=>{
        res.status(response.statuscode).json(response)
    })
})

//unfollowing a user
server.put('/social/unfollow/:userId',jwtmiddleware,(req,res)=>{
    console.log('inside unfollow user call')
    logic.unFollow(req.params.userId,req.body.followId).then((response)=>{
        res.status(response.statuscode).json(response)
    })
})

//message page
//starting a message portion
server.post('/social/startinbox',jwtmiddleware,(req,res)=>{
    console.log('inside start inbox  call')
    logic.startMessage(req.body.person1,req.body.person2).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})

//the person who messages first goes into outgoing
server.post('/social/outgoing/:person1',jwtmiddleware,(req,res)=>{
    logic.outGoing(req.params.person1,req.body.person2).then((response)=>{
        res.status(response.statuscode).json(response)  
    })
})
//setting up the person who messaged saecond
server.post('/social/incomming/:person2',jwtmiddleware,(req,res)=>{
    logic.inComming(req.body.person1,req.params.person2).then((response)=>{
        res.status(response.statuscode).json(response)  
    })
})

//finding a chat present
server.get('/social/findchat/:person1/:person2',jwtmiddleware,(req,res)=>{
    console.log('inside findchat  call')
    logic.findChats(req.params.person1,req.params.person2).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})

//insert person1 message
server.post('/social/messagefromperson1/:person1/:person2',jwtmiddleware,(req,res)=>{
    console.log('inside message from person1 call')
    var date=new Date
    logic.messsagePerson1(req.params.person1,req.params.person2,req.body.message,date,req.body.user_id).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})

//insert person2 message
server.post('/social/messagefromperson2/:person2/:person1',jwtmiddleware,(req,res)=>{
    console.log('inside message from person1 call')
    var date=new Date
    logic.messsagePerson2(req.params.person2,req.params.person1,req.body.message,date,req.body.user_id).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})

//adding likes to mongodb
server.post('/social/addlikes/:filename',jwtmiddleware,(req,res)=>{
    console.log('Inside ;ikes call')
    logic.likes(req.params.filename,req.body.likeId).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})

// getting likes of each posts
server.get('/social/getlikes/:filname',jwtmiddleware,(req,res)=>{
    console.log('inside get likes call')
    logic.getLikes(req.params.filname).then((response)=>{
        res.status(response.statuscode).json(response)  
    })
})



//deleting a post
server.put('/social/deletepost/:userId',jwtmiddleware,(req,res)=>{
    console.log('inside delete api call')
    logic.deletePost(req.params.userId,req.body.filename).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})

//update profile
server.post('/social/updateprofile/:userId',jwtmiddleware,(req,res)=>{
    console.log('Inside editprofile call')
    logic.editProfile(req.params.userId,req.body.editingDetails).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})



//change password from inside profile
server.post('/social/changepasswordfromprofile/:userId',jwtmiddleware,(req,res)=>{
    logic.changePasswordFromProfile(req.params.userId,req.body.Password).then((response)=>{
        res.status(response.statuscode).json(response)  
    })
})

//change password outside profile
server.post('/social/changepassword',(req,res)=>{
    logic.changePassword(req.body.Email,req.body.Password).then((response)=>{
        res.status(response.statuscode).json(response)  
    })
})

//delete account 
server.delete('/social/deleteaccount/:userId',jwtmiddleware,(req,res)=>{
    logic.deleteAccount(req.params.userId).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})

//remove peoplw who follow
server.put('/social/removepeoplewhofollow',jwtmiddleware,(req,res)=>{
    console.log('inside api call')
    logic.removePeopleWhoFollow(req.body._id,req.body.followId).then((response)=>{
        res.status(response.statuscode).json(response) 
 
    })
})

//add inividual likes to manipulate dom
server.post('/social/addindividuallikes',jwtmiddleware,(req,res)=>{
    console.log('inside individual likes call')
    logic.individualLiking(req.body.filename,req.body.likeId).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})

//getting the individual likes
server.get('/social/individual/:likeId',jwtmiddleware,(req,res)=>{
    console.log('inside individual like')
    logic.getIndividualLikes(req.params.likeId).then((response)=>{
        res.status(response.statuscode).json(response)
    })
})

//change password request
server.post('/social/changepass',(req,res)=>{
    logic.getOtp(req.body.Email).then((response)=>{
        res.status(response.statuscode).json(response)
    })
})

//change password after otp
server.post('/social/changepass2',(req,res)=>{
    logic.changePassword(req.body.Email,req.body.Password).then((response)=>{
        res.status(response.statuscode).json(response) 
    })
})