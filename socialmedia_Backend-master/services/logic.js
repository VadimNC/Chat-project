const { response } = require('express')
const db=require('./db')
const jwt=require('jsonwebtoken')
const nodeMailer=require('nodemailer')
require('dotenv').config()

//register the user
const registerUser=(Name,Email,Password)=>{
    //checking if user present
    return db.User.findOne({Email}).then((response)=>{
        if(response){
            return{
                statuscode:401,
                message:'Email already present'
            }
        }else{
          //adding new user to db
           const newUser=db.User({
            Name,
            Email,
            Password,
            Followers:[],
            Following:[],
            profilepic:[{path:"images/file_1695290185515.jpg"}]
           })
           //saving new user
           newUser.save()
           return{
            statuscode:200,
            message:'Successfully registered'
           }
        }
    })
        
}

//logging in the user
const login=(Email,Password)=>{
    return db.User.findOne({Email,Password}).then((response)=>{
        if(response){

            //generating token for authentication

            const token=jwt.sign({
                loginEmail:Email
            },'shots_key_2023')

            return{
                //passing the token and userid
                statuscode:200,
                message:'Successfully loggined',
                InstaFlixId:response._id,
                token
            }
        }else{
            return{
                statuscode:400,
                message:'Invalid request' 
            }
        }
    })
}


//getting details of a particular user
const getDetails=(_id)=>{
    return db.User.findOne({_id}).then((response)=>{
        if(response){
            console.log(response)
            return{
                statuscode:200,
                message:'person found',
                details:response
            }
        }else{
           return{
            statuscode:400,
            message:'not found'
           }
        }
    },(response)=>{
        return{
            statuscode:400,
            message:'not found'
           } 
    })
}

//get details of all users 
const getAllUsers=()=>{
    return db.User.find({}).then((response)=>{
        if(response){
            return{
                statuscode:200,
                Message:'Items found',
                Details:response
            }
        }else{
            return{
                statuscode:400,
                message:'Not found'
            }
        }
    })
}

//view details of  a specific user
const viewSuggestion=(_id)=>{
    return db.User.findOne({_id}).then((response)=>{
        if(response){
            console.log(response)
            return{
                statuscode:200,
                message:'person found',
                details:response
            }
        }else{
           return{
            statuscode:400,
            message:'not found'
           }
        }
    })
}

//updating followers
const followUser=(_id,followId)=>{
    console.log(followId)
    //finding the user
        return db.User.findOne({_id}).then((details)=>{
          let detailsArr=details.Followers
          
          if(_id==followId){
                return{
                    statuscode:400,
                    message:'cannot follow your own account'
                }
          }else{
            for(let i=0;i<detailsArr.length;i++){
                if(followId==detailsArr[i].followId){
                    
                    return{
                        statuscode:400,
                        message:'Already following this account'
                    }
                }
              }
          }
               //updating the followers array
                    console.log(details.Followers)
                    const body={
                       followId
                    }
                    //pushing the id into arra
                    detailsArr.push(body)
                    //saving the array
                    details.save()
                    //calling the other function for updating the recipient following array
                    updateFollower(_id,followId)
                    return{
                        statuscode:200,
                        message:'Following'
                    }
                
            
           
           })  
          
      
}

//add follower to the the people who you followed
const updateFollower=(_id,followId)=>{
    console.log(followId)
        return db.User.findOne({_id:followId}).then((details)=>{
          let detailsArr=details.Following
          
         
          
            for(let i=0;i<detailsArr.length;i++){
                if(_id==detailsArr[i].followerId){
                    
                    return{
                        statuscode:400,
                        message:'Already following this account'
                    }
                }
              }
        
               
                    console.log(details.Following)
                    const body={
                        followerId:_id
                    }
                    detailsArr.push(body)
                    details.save()
                    return{
                        statuscode:200,
                        message:'Following'
                    }
                
            
           
           })  
      
}

//uploading details of the post to mongodb
const uploadDetails=(_id,destination,filename,path,date)=>{
      return db.User.findOne({_id}).then((details)=>{
        if(details){
            //poshing thee details to post array
            const body={
                destination,
                filename,
                path,
                date
            }
            details.posts.push(body)
            //saving the new details
            details.save()
            return{
                statuscode:200,
                message:'sucess'
            }
        }else{
             return{
                statuscode:400,
                message:'coudnt upload the file'
             }
        }
        
      })
}

//uploading profile pic same as post upload
const uploadProfilePic=(_id,destination,filename,path,date)=>{
    return db.User.findOne({_id}).then((details)=>{
        if(details){
            //setting the profilepic array to an empty array
            details.profilepic=[]
            const body={
                destination,
                filename,
                path,
                date
            }
            details.profilepic.push(body)
            details.save()
            return{
                statuscode:200,
                message:'sucess'
            }
           
        }else{
             return{
                statuscode:400,
                message:'coudnt upload the file'
             }
        }
        
      })
}

//adding comments for a specific file
const addComments=(filename,from_id,to_id,comment,date)=>{
    //making the details as a body
      const body={
        filename,
        from_id,
        to_id,
        comment,
        date
      }
      //insering the comment into a new collecion
      return db.Comment.insertMany(body).then((response)=>{
        return{
            statuscode:200,
            message:'uploaded successfully'
        }
      },(response)=>{
        return{
            statuscode:400,
            message:'failed'
        }
      })
}

//getting comments of a particular post

const readComments=(filename)=>{
    return db.Comment.find({filename}).then((details)=>{
        console.log(details)
        
        return{
            statuscode:200,
            message:'present',
            details
            
        }
    },(details)=>{
        return{
            statuscode:400,
            message:'failed'
        }
    })
}

//unfollowing a user
const unFollow=(_id,followId)=>{
    //updating using put method inside an array
    return db.User.updateOne({_id},{
        //pulling out the userid of the user
        $pull:{'Followers':{followId:followId}}
    }).then((response)=>{
        //calling the other function to pull the userid from the following array of other user
        removeFollowing(_id,followId)
        return{
            statuscode:200,
            message:'Unfollowed',
            reap:response
        }
    },(response)=>{
        return{
            statuscode:400,
            message:'Cannot unfollow'
        }
    })
}

//delete folllowing almost same as other user
const removeFollowing=(_id,followId)=>{
    return db.User.updateOne({_id:followId},{
        $pull:{'Following':{followerId:_id}}
    }).then((response)=>{
        return{
            statuscode:200,
            message:'Unfollowed',
            reap:response
        }
    },(response)=>{
        return{
            statuscode:400,
            message:'Cannot unfollow'
        }
    })
}

//starting the message by inserting it into message collection
const startMessage=(person1,person2)=>{
    //finding if a message document fo these users are present
    return db.Message.findOne({person1,person2}).then((response)=>{
        if(response){
            return{
                statuscode:400,
                message:'already found'
            } 
        }else{
            //adding a new document to the collection
             const newMessage=db.Message({
                person1,
                person2,
                fromPerson1:[],
                fromPerson2:[]
             })
             //saving the new document
             newMessage.save()


             return{
                statuscode:200,
                mesage:'Message started successfully',
            
               }

        }
    })
}
//setting up outgoing
//if I sent a message to the other user their userid will be stored inside outgoing array of my details document
//and my userid will be set as incomming inside their user details document
//this happens in viceversa
const outGoing=(person1,person2)=>{
    //in outgoing userid will be person 1(it will be my id) 
    //finding an user of this id
    return db.User.findOne({_id:person1}).then((response)=>{
        if(response){
            //checking the array with the help of a loop if the userid of person 2 is found inside outgoing array
            for(let i=0;i<response.outgoing.length;i++){
               if(person2==response.outgoing[i]){
                return{
                    statuscode:400,
                    message:'already present'
                }
               }
            }

            //inserting the details inside outgoing
            response.outgoing.push(person2)

            //saving
            response.save()

            return{
                statuscode:200,
                mesage:'Message started successfully',
            }
        }
    })
}
//setting up incomming message
//if someone message me my id will be person2 and their id will be person 1
const inComming=(person1,person2)=>{
    return db.User.findOne({_id:person2}).then((response)=>{
        if(response){
            for(let i=0;i<response.outgoing.length;i++){
                if(person2==response.incomming[i]){
                 return{
                     statuscode:400,
                     message:'already present'
                 }
                }
             }
            response.incomming.push(person1)

            response.save()

            return{
                statuscode:200,
                mesage:'Message started successfully',
            }
        }
    })
}
//finding if chatbox prsent
const findChats=(person1,person2)=>{
    //finding if chats preset on these 2 userids inside message collection
    return db.Message.findOne({person1,person2}).then((response)=>{
        return{
            statuscode:200,
            message:'found',
            details:response
        }
    },(response)=>{
        return{
            statuscode:400,
            message:'coudnt find'
        }
    })
}

//message from person1
//this is the function for meswage from person1
const messsagePerson1=(person1,person2,message,date,from_id)=>{
    return db.Message.findOne({person1,person2}).then((details)=>{
        if(details){
            //details of the message
            //here from_id is id of person1
            const body={
                message:message,
                date:date,
                messageId:from_id
            }
            //pushing the message details into fromperson1 array
           details.fromPerson1.push(body)

           details.save()
           return{
            statuscode:200,
            mesage:'Message sent successfully'
           }
           
        }else{
            return{
                statuscode:400,
                mesage:'message not sent'
               }
        }
        //if no details throwing error
    },(details)=>{
        return{
            statuscode:400,
            mesage:'message not sent'
           }
    })
}

//message from person 2
const messsagePerson2=(person1,person2,message,date,from_id)=>{
    //checking if person present
    return db.Message.findOne({person1,person2}).then((details)=>{
        if(details){
            //here from_id is person2
            const body={
                message:message,
                date:date,
                messageId:from_id
            }
            //pushing the messaged etails into fromperson 2 array
           details.fromPerson2.push(body)
//saving the daetails
           details.save()
           return{
            statuscode:200,
            mesage:'Message sent successfully'
           }
           
        }else{
            return{
                statuscode:400,
                mesage:'message not sent'
               }
        }
    },(details)=>{
        return{
            statuscode:400,
            mesage:'message not sent'
           }
    })
}

//startlikes
//when we upload a picture a ike document is formed in hearts collection aqccording to the filename
const startLikes=(filename)=>{
    //inserting document into the collection
    return db.Heart.insertMany({filename}).then((response)=>{
       
        return{
            statuscode:200,
            message:'Successfully started'
        }
    })
}

//likes for a picture
//here like id will be userid of the user
const likes=(filename,likeId)=>{
    //finding the document inside the heart collection according to filename
    return db.Heart.findOne({filename}).then((response)=>{
        if(response){
            //checking if the likeid is present in the array with healp of loop
            for(let i=0;i<response.likes.length;i++){
                if(response.likes[i]==likeId){
                    //if present pulling out the the id from the array
                    //this is how the unlike works
                    response.likes.pull(likeId)
                    response.save()

                 

                    
    
                    return{
                        statuscode:200,
                        message:'un liked'
                    }
                }
            }
            
            //if likeid note present inside the array pushing it to the array
                response.likes.push(likeId)
                response.save()
                
                
                return{
                    statuscode:200,
                    message:'liked'
                }
          
        }
    },(response)=>{
        return{
            statuscode:400,
            message:'error'
        }
    })
}

//get likes
const getLikes=(filename)=>{
    //gettig likes according to the filename
    return db.Heart.findOne({filename}).then((response)=>{
      if(response){
        return{
            statuscode:200,
            mesage:"found",
            //passing the response
            response
        }
      }else{
        return{
            statuscode:400,
            mesage:"not found"
        }
      }
    },(response)=>{
        return{
            statuscode:400,
            mesage:"not found",
            response
        }
    })
}



//deleting a post
const deletePost=(_id,filename)=>{
    //deleting a post by pulling out the post detials from users post array
    return db.User.updateOne({_id},{
        $pull:{'posts':{
            filename:filename
        }}
    }).then((response)=>{
        return{
            statuscode:200,
            message:'Deleted'
        }
    },(response)=>{
        return{
            statuscode:400,
            message:'connot be Deleted'
        }
    })
}

//editing the profile
//here the editing details is the object
const editProfile=(_id,editingDetails)=>{
     return db.User.findOne({_id}).then((response)=>{
        //taking the edited details from editingdetails for assigning it to the userdetails
        response.Name=editingDetails.Name
        response.Email=editingDetails.Email
        //saving
        response.save()
        return{
            statuscode:200,
            message:'Successfully updated'
        }
     })
}



//change password from inside from the profile
const changePasswordFromProfile=(_id,Password)=>{
    //finding user
    return db.User.findOne({_id}).then((response)=>{
        //assigning new password to the document
        response.Password=Password
        //saving the new details
        response.save()
        return{
            statuscode:200,
            messaage:'Password changed successfully'
        }
    },(response)=>{
        return{
            statuscode:200,
            messaage:'Account not found for this Email'
        }
    })
}

//deleting account from mongodb
const deleteAccount=(_id)=>{
    //deleting an account using deletemethod
    return db.User.deleteOne({_id}).then((response)=>{
        //the comments of the person also deleted while deleting an account
        deleteComments(_id)
        return{

            statuscode:200,
            message:'Account deleted successfully'
        }
    })
    
}

//delete comments while deleting an account
const deleteComments=(from_id)=>{
    return db.Comment.deleteOne({from_id}).then((response)=>{
        return{
            statuscode:200,
            message:'Account deleted successfully'
        }
    })
}

// remove follower from profile
//removing a follower form profile page
const removePeopleWhoFollow=(_id,followerId)=>{
    return db.User.updateOne({_id},{
        $pull:{'Following':{
            followerId:followerId
        }}
    }).then((response)=>{
        //function to remove our userid from thier userdetails
         remove_idFromFollower(_id,followerId)
        return{
            statuscode:200,
            message:'successfully Deleted'
        }
    })
}

//remover from followId
const remove_idFromFollower=(_id,followId)=>{
    //updating using put method
    return db.User.updateOne({_id:followId},{
        $pull:{'Followers':{
            followId:_id
        }}
    }).then((response)=>{

        return{
            statuscode:200,
            message:'successfully Deleted'
        }
    })
}



//iundividually liked
//for knowing who likes which picture we need to store likes in a seperate collection 
//according to the userid of each person
const individualLiking=(filename,likeId)=>{
    //checking if a document according to likeid present
    return db.individualLike.findOne({likeId}).then((response)=>{
        if(response){
            //checking if likeid present in individual like document
            for(let i=0;i<response.filenames.length;i++){
                if(response.filenames[i]==filename){
                    //if present pull it out also known as unlike
                    response.filenames.pull(filename)
                    //saving it
                    response.save()
    
                    return{
                        statuscode:200,
                        message:'un liked'
                    }
                }
            }
            //if filename not present inside the array push the filename into the array and save it
                response.filenames.push(filename)
                response.save()
                return{
                    statuscode:200,
                    message:'liked'
                }

        //if no response  is presnt
          
        }else{
            //inserting the document acording to the user id for holding likes
            return db.individualLike.insertMany({likeId}).then((response)=>{
                if(response){
                    //finding the document from the collection
                    return db.individualLike.findOne({likeId}).then((response)=>{
                        //push the filename into the array
                        response.filenames.push(filename)
                return{
                    statuscode:200,
                    message:'liked'
                }
                    })
                }
            })
        }
        //throw error if nothing happens
    },(response)=>{
        return{
            statuscode:400,
            message:'error'
        }
    })
}

//get individual likes
const getIndividualLikes=(likeId)=>{
    //finding the document fromthe collection
    return db.individualLike.findOne({likeId}).then((response)=>{
        return{
            statuscode:200,
            message:'Individual likes found',
            response
        }
    },(response)=>{
      return{
        statuscode:200,
        message:'Not found' 
      }
    })
}

const EMAIL=process.env.EMAIL
const PASS=process.env.PASS
//change password from outside profile
const getOtp=(Email)=>{
    
    return db.User.findOne({Email}).then((reponse)=>{
        let config={
            service:'gmail',
            auth: {
              
              user: EMAIL,
              pass: PASS,
            },
         }

      
      let transporter=nodeMailer.createTransport(config)

      let otp=Math.floor(Math.random()*9999)

      let message={
        from:EMAIL,
        to:Email,
        subject:'Password change request',
        html:`<p>Your otp to reset password is ${otp}</p>`
      }

      transporter.sendMail(message)

      return{
        statuscode:200,
        message:'Email send successfully',
        otp
      }

    })

       

}

//change password outside profile
const changePassword=(Email,Password)=>{
  return db.User.findOne({Email}).then((response)=>{
    response.Password=Password
    response.save()
    return{
        statuscode:200,
        message:'Successfully updated'
    }
  },(response)=>{
    return{
        statuscode:400,
        message:''
    }
  })
}


//exporting thr functions to use it on other files
module.exports={
    registerUser,
    login,
    uploadDetails,
    getDetails,
    getAllUsers,
    viewSuggestion,
    followUser,
    uploadProfilePic,
    addComments,
    readComments,
    unFollow,
    startMessage,
    findChats,
    messsagePerson1,
    messsagePerson2,
    outGoing,
    inComming,
    startLikes,getLikes,likes,
    deletePost,
    editProfile,
    
    changePasswordFromProfile,deleteAccount,
    removePeopleWhoFollow,
    individualLiking,getIndividualLikes,getOtp,changePassword
   
}