
const mongoose=require('mongoose')

//mongodb connection string
mongoose.connect('mongodb://localhost:27017/SocialMedia')

//model for the user created while we regidter an account
const User=mongoose.model('User',{
    Name:String,
    Email:String,
    Password:String,
    posts:[],
    profilepic:[],
    Following:[],
    Followers:[],
    outgoing:[],   //incomming and outgoing to store message id
    incomming:[]
})

//for storing the comments
const Comment=mongoose.model('Comment',{
    filename:String,
    from_id:String,
    to_id:String,
    comment:String,
    date:String
})

//collection for storing message
const Message=mongoose.model('Message',{
    person1:String,
    person2:String,
    fromPerson1:[],
    fromPerson2:[]

})

//collectin for storing likes according to filename
const Heart=mongoose.model('Heart',{
    filename:String,
    likes:[]
})

//collection for stoing likes according to the useridf of the user
const individualLike=mongoose.model('individualLike',{
    likeId:String,
    filenames:[]
})

//exporting the models
module.exports={
    User,
    Comment,
    Message,
    Heart,
    individualLike
   
}