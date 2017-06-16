var mongoose = require('mongoose'),
    session = require('./sessions'),
    shortid = require('shortid'),
    //mongodb = require("mongodb"),
    //ObjectID = mongodb.ObjectID,
    crypto = require('crypto'),
    nodemailer= require('nodemailer'),
    PinPals = require('./pinpals'),
    //SparkPost = require('sparkpost'),    
    AWS = require('aws-sdk'),
    fs = require('fs');

//Define AWS params
var s3  = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2',
});

//Define user model
var usersSchema = new mongoose.Schema({
    id: {type: String, unique: true, 'default':shortid.generate}, //check the validity of this
    username: {type: String,unique: true,require:true}, //check the validity of this shii
    password: {type: String, require:true},
    //first_name: String,
    //last_name: String,
    email: {type: String,unique: true,require:true},//check the validity this shii
    dp: {
        bucket: String,
        object: String
    }, 
    bio: String,
    created_at: {type: Date, 'default': Date.now},
    updated_at: {type: Date, 'default': Date.now}
});


var Users = mongoose.model('Users', usersSchema);//initialize model instance

//Define TempUser model

var tempUserSchema = new mongoose.Schema({
    id: {type: String, unique: true, 'default':shortid.generate}, //check the validity of this
    username: String, //check the validity of this shii
    password: String,
    email: String,//check the validity this shii
    uniqKey : String
});

var TempUser = mongoose.model('TempUser',tempUserSchema);//initialize model instance


//end Temp user definition


//set up re-usable smtp server

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'fikayormie@gmail.com',
        pass: 'FIkk**164499'
    }
});
//var Sparky = new SparkPost();//uses process.env.SPARPOST_API_KEY

var exports = module.exports;

exports.UsersModel = Users;//export Users model
//exports.TempUserModel = TempUser; //export temp users model


exports.check_user_exists = function(param,callback){
    
    //returns true or false, depending on whether user is found or not           
    console.log("Find user where username or email = "+param);//log message
             
    var status = false;//status flag for callback 
    var searchParam = param;//initialize searchParam from requestbody
    Users.findOne({$or: [{username:searchParam},{email:searchParam}]}, function(error,data){//try to fetch single user
        if(error){//try to catch internal server error
            console.log(error);
            status = false;//do not allow user to proceed with operation because server didnt give definite response
        }else{//if not error
            
            if(!data){
                status = false;// dont allow user to proceed, user doent exist    
            }else{//user does exist
                console.log("User Exists");
                status = true;// allow user to proceed, user does exist                
            }
        }
        callback(status);    
    }); 
    
} 

exports.validate_account = function(requestBody,response){
    response.data = {};//set response to array
    console.log("Find where username or email = param and password=param");
            
    
    var searchParam = requestBody.user;//initialize searchParam from requestbody
    var password = requestBody.password;//initialize password variable
    Users.findOne({$and: [{$or: [{username:searchParam},{email:searchParam}]},{password:password}]},{_id: false, password:false},function(error,data){//try to fetch single user
        if(error){//try to catch internal server error
            console.log(error);
            
            if(response!=null){
                response.writeHead(500,{'Content-Type' : 'application/json'}); //set content resolution variables
                response.data.log = "Internal Server Error";//log response  for client
                response.data.success = 0;//success variable for clent
                response.end(JSON.stringify(response.data));//return response.data json string for client parser
            }
            
            return;//do not allow user to proceed with operation because server didnt give definite response
        }else{//if not error
            
            if(!data){
                
               if(response!=null){//if user doesnt exist
                    response.writeHead(201,{'Content-Type' : 'application/json'}); //set content resolution variables
                    response.data.log = "User doesnt exist";//log response  for client
                    response.data.success = 0;//success variable for clent
                    response.end(JSON.stringify(response.data));//return response.data json string for client parser                   
                }
                
                return;// allow user to proceed, user doent exist
                    
            }else{//user does exist
                
                if(response!=null){//if user exists
                    response.writeHead(201,{'Content-Type' : 'application/json'}); //set content resolution variables
                    
                    var session_id = shortid.generate();
                    
                    var newSession= session.create(session_id,data.id,requestBody,response);//create session 
                    
                    console.log(session_id);
                    if(newSession!=false){//if session is created    
                        response.data.log = "User exists";//log response  for client
                        response.data.success = 1;//success variable for client
                        response.data.session_id = session_id;
                        response.data.data = data;//return user data to client
                        //createDirectory('uploads/user_'+data.id+'/');//create a directory to store a user's memories
                        //createDirectory('uploads/user_'+data.id+'/dps/');//create a directory to store a user's memories
                        //createDirectory('uploads/user_'+data.id+'/stories/');//create a directory to store a user's stories
                        //createDirectory('uploads/user_'+data.id+'/pins/');//create a directory to store a user's pins
                        response.end(JSON.stringify(response.data));//return response.data json string for client parser
                    }
                }
                
                return;//allow user to proceed, user exists                
            
            }
        }
    });      
}

exports.update_account = function(requestBody,response){
    response.data = {};//set response to array
    console.log("Update all params where id = "+requestBody.user_id); //do this
    
    var user_id = requestBody.user_id;//get user_id from post request
    Users.findOne({id:user_id},function(error,data){//try to fetch a single user
        if(error){ // catch internal server error
            
            console.log(error);//log error
            if(response != null){ 
                response.writeHead(500,{'Content-Type' : 'application/json'}); 
                response.data.log = "Internal Server Error"; //log response for client
                response.data.success = 0; //success response for client
                response.end(JSON.stringify(response.data)); //json stringify so client can parse resposne
            }
            
            return;
        }else{//if not error
            //var user = toUSer(); //create new user instance
            if(!data){//if user doesnt exist give user error response
                
                if(response != null){
                    response.writeHead(201,{'Content-Type' : 'application/json'});
                    response.data.log = "User doesnt Exist"; // log response for client
                    response.data.success = 0;//success response for client
                    response.end(JSON.stringify(response.data));//json stringify so client can parse response
                }
                
                return;
                
            }else{ //if user does exist
                
                //fetch user data and then replace content with requestBody Data
                data.username = requestBody.username;
                data.dp.bucket = requestBody.dp_bucket;
                data.dp.object = requestBody.dp_object;
                data.bio = requestBody.bio;
                data.updated_at = Date.now();//check js method for doing this
                
                //now save
                data.save(function(error){//check for errors in saving
                    if(!error){
                        response.writeHead(201,{'Content-Type':'application/json'});
                        response.data.log = "Updated"; //log response for client
                        response.data.success = 1; // success response for client
                        response.end(JSON.stringify(response.data));//json stringify so client can see response
                    }else{
                        console.log(error);
                        response.writeHead(201,{'Content-Type':'application/json'});
                        response.data.log = "Update Failed"; //log response for client
                        response.data.success = 0; // success response for client
                        response.end(JSON.stringify(response.data));//json stringify so client can see response                    
                    }
                    return;
                });
            }
        }
    });
}

exports.update_password = function(requestBody,response){
    console.log("Update password where user_id = "+ requestBody.user_id); //do this
    response.data = {};//set response to array
    
    var user_id = requestBody.user_id;//get user_id from post request
    Users.findOne({id:user_id},function(error,data){//try to fetch a single user
        if(error){ // catch internal server error
            console.log(error); //log error
            if(response != null){ 
                response.writeHead(500,{'Content-Type' : 'application/json'}); 
                response.data.log = "Internal Server Error"; //log response for client
                response.data.success = 0; //success response for client
                response.end(JSON.stringify(response.data)); //json stringify so client can parse resposne
            }
            
            return;
        }else{//if not error
            //var user = toUSer(); //create new user instance
            if(!data){//if user doesnt exist give user error response
                
                if(response != null){
                    response.writeHead(201,{'Content-Type' : 'application/json'});
                    response.data.log = "User doesnt Exist"; // log response for client
                    response.data.success = 0;//success response for client
                    response.end(JSON.stringify(response.data));//json stringify so client can parse response
                }
                
                return;
                
            }else{ //if user does exist
                
                //fetch user data and then replace content with requestBody Data
                data.password = requestBody.password;
                data.updated_at = Date.now();
                
                //now save
                data.save(function(error){//check for errors in saving
                    if(!error){
                        response.writeHead(201,{'Content-Type':'application/json'});
                        response.data.log = "Password Updated"; //log response for client
                        response.data.success = 1; // success response for client
                        response.end(JSON.stringify(response.data));//json stringify so client can see response
                    }else{
                        console.log(error);
                        response.writeHead(201,{'Content-Type':'application/json'});
                        response.data.log = "Password update Failed"; //log response for client
                        response.data.success = 0; // success response for client
                        response.end(JSON.stringify(response.data));//json stringify so client can see response                    
                    }
                    return;
                });
            }
        }
    });    
}

exports.create_account = function(request,response){
    console.log("Create User and Store in Temp_User table");//create temporary account before email verification
    response.data = {};//set response to array
        
    Users.findOne({$or: [{username:request.body.username},{email:request.body.email}]},function(error,data){
        
        if(error){
            if(response!=null){
                response.writeHead(500,{'Content-Type':'application/json'});//set server response format
                response.data.log = "Internal server error";
                response.data.success = 0;
                response.end(JSON.stringify(response.data)); 
            }
        }else{
            if(!data){
                var user_key = generate_key();//generate user key and store in variable

                var temp_user = toTempUser(user_key,request.body);//generate model instance

                temp_user.save(function(error){
                    if(!error){
                        //send mail here
                        //set up mail options
                        var mailOptions = {
                            from : 'SpotPin Administrator',
                            to : request.body.email,
                            subject : "Confirm Account",
                            html: "<a href='"+request.protocol+"://"+request.get('host')+"/user/confirm/"+user_key+"'>Click me</a> to confirm account"
                        }


                        transporter.sendMail(mailOptions,function(error,info){//uncomment codeblock when smtp is working fine
                            if(error){
                                console.log(error);
                                response.data.log = "Email Sending Failed";
                                response.data.success = 0;
                                response.end(JSON.stringify(response.data));
                                console.log(user_key);
                                return;
                            }else{
                                response.data.log = "Check Email for Link to Complete Registration";
                                response.data.success = 1;
                                response.end(JSON.stringify(response.data));
                                return;
                            }

                            return;
                        });
                        
                        /*var transmission = {
                            transmissionBody: {
                                content: {
                                    from: 'spotpinAdmin@'+process.env.SPARKPOST_SANDBOX_DOMAIN,
                                    subject: 'Confirm Spotpin Account',
                                    html: "<a href='"+request.protocol+"://"+request.get('host')+"/user/confirm/"+user_key+"'>Click me</a> to confirm account" 
                                }

                            },
                            recipients: [
                                {
                                    address: request.body.email
                                }
                            ]
                        }                        
                        
                        Sparky.transmissions.send(transmission,function(error,info){
                            if(error){
                                console.log(error);
                                response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                                response.data.log = "Email Sending Failed";
                                response.data.success = 0;
                                response.end(JSON.stringify(response.data));
                                console.log(user_key);                        
                            }else{
                                response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                                response.data.log = "Check Email for Link to Complete Registration";
                                response.data.success = 1;
                                response.end(JSON.stringify(response.data));                        
                            }
                        });*/                    

                    }else{
                        console.log(error);
                        //check for error 500
                        if(response!=null){
                            response.writeHead(500,{'Content-Type':'application/json'});//server response is in json format
                            response.data.log = "Internal Server Error";//log error for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data)); //send json response
                        }else{
                            response.writeHead(200,{'Content-Type' : 'application/json'});//server response is in json format
                            response.data.log = "Unforeseen Database Error";//log error for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data)); //send json response                   
                        }
                        return;            
                    }
                });  
            }else{
                response.writeHead(200,{'Content-Type' : 'application/json'});//server response is in json format
                response.data.log = "Username or Email in Use";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data)); //send json response               
            }
        }
    });
    
}  

exports.confirm_account = function(user_key,requestBody,response){
    console.log("Confirm Account");
    
    TempUser.findOne({uniqKey:user_key},function(error,data){//find instance of key in tempUser table 
        if(error){//if error was returned
            console.log(error);//log error
            if(response!=null){//if error 500
                response.writeHead(500,{'Content-Type' : 'text/plain'});//server response is in text format
                response.end("Internal Server Error");//send response to client
            }
            return;       
        }else{
            if(data){
                var user = toUSer(data);
                
                user.save(function(error){
                    if(!error){
                        data.remove();//delete data instance in temp_user document
                        response.writeHead(201,{'Content-Type':'text/plain'});//server response is in json format
                        response.end("Account Confirmed");//log response for client        
                        return;
                    }else{
                        console.log(error);//log error
                        //check if user already exists
                        Users.findOne({$or: [{email:requestBody.email},{username:requestBody.username}]},function(error,data){
                            if(error){
                                console.log(error); //log error
                                //check for error 500
                                if(response!=null){
                                    response.writeHead(500,{'Content-Type':'text/plain'});//server response is in json format
                                    response.end("Internal Server Error");//log error for client
                                }else{
                                    response.writeHead(200,{'Content-Type' : 'text/plain'});//server response is in json format
                                    response.end("Unforeseen Database Error");//log error for client                 
                                }
                                return;
                            }else if(data){
                                    response.writeHead(200,{'Content-Type' : 'text/plain'});//server response is in json format
                                    response.end("Username or Email Already in Use"); //log error for client
                                    return;
                            }else{
                                response.writeHead(200,{'Content-Type' : 'text/plain'});//server response is in json format
                                response.end("Unforeseen Server Error");//log error for clien
                                return;
                            }                
                
                        });
                    }
                });
            }else{
                response.writeHead(201,{'Content-Type' : 'text/plain'});//server response is in text format
                response.end("Invalid User Key"); //log error for client           
            }       
        }
    })
}

exports.delete_account = function(requestBody,response){
    console.log("Delete Account"); //do this
    
    var user_id = requestBody.user_id//initialize user_id from requestBody
    
    //fetch query
    Users.findOne({id:user_id},function(error,data){ //find user
        if(error){//if error is returned
            console.log(error);//log error
            if(response!=null){//if error 500
                response.writeHead(500,{'Content-Type' : 'application/json'});//server response is in json format
                response.data.log = "Internal Server Error"; //log error for client
                response.data.success = 0;// success variable for client
                response.end(JSON.stringify(response.data));//send response to client
            }
            return;
        }else{
            
            if(!data){//if no account is found
                
                if(response!=null){//if user does not exist
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "User does not exist";//log message for client
                    response.data.success = 0; //success variable for client
                    response.end(JSON.stringify(response.data));// send response to client
                }
                return;    
            }else{
            
                data.remove(function(error){
                    if(!error){
                        response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                        response.data.log = "Account Deleted";//log message for client
                        response.data.success = 1; // success variable for client
                        response.end(JSON.stringify(response.data)); //send response to client                      
                    }else{
                        console.log(error);//log error
                        response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                        response.data.log = "Error in Deleteion";//log error for client
                        response.data.success = 0; //success variable for client
                        response.end(JSON.stringify(response.data)); //send response to client                       
                        
                    }
                    
                    return;
                });
            }
        
        }
    });
}

exports.fetch_user = function(requestBody,response){
    console.log("Fetch User where id = "+requestBody.user_id);
    
    var user_id = requestBody.user_id;
    //fetch one user
    Users.findOne({id:user_id},function(error,data){
        
        if(error){//try to catch error 500
            console.log(error)//log error
            if(response!=null){//if internal server error
                response.writeHead(500,{'Content-Type' : 'application/json'});//json data type to notify client
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send response to user
            }
            return;
            
        }else{
            if(!data){//if no account is found   
                if(response!=null){//if user does not exist
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "User does not exist";//log message for client
                    response.data.success = 0; //success variable for client
                    response.end(JSON.stringify(response.data));// send response to client
                }
                return;    
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//server response is in jsons format
                response.data.log = "User Fetched"; //log message for client
                response.data.success = 1;//success variable for client
                response.data.user = JSON.stringify(data); //return user data
                response.end(JSON.stringify(response.data)); //send response to server
                
                return;
            } 
        }
    });
}

exports.user_stats = function(user_id,session_user_id,response){
    
    var pipeline = [{
        $match: {id: user_id}
    },
    {
        $lookup: {
            from: "points",
            localField: "id",
            foreignField: "user_id",
            as: "points"
        }
    },
    {
        $lookup: {
            from: "pins",
            localField: "id",
            foreignField: "user_id",
            as: "pins"
        }
    },                  
    {
        $lookup: {
            from: "likes",
            localField: "id",
            foreignField: "user_id",
            as: "likes"
        }
    },                  
    {
        $lookup: {
            from: "leaderboardsmembers",
            localField: "id",
            foreignField: "user_id",
            as: "leaderboards"
        }
    },
    {
        $lookup: {
            from: "capsulemembers",
            localField: "id",
            foreignField: "user_id",
            as: "capsules"
        }    
    },
    {
        $project: {
            user_points: {$sum:"$points.points"},
            user_pins: {$size: "$pins"},
            user_likes: {$size: "$likes"},
            user_leaderboards: {$size: "$leaderboards"},
            user_capsules: {$size: "$capsules"}
        }
    }];
    Users.aggregate(pipeline,function(error,data){
        response.data = {};//define data array 
        if(error){//try to catch error 500
            console.log(error)//log error
            if(response!=null){//if internal server error
                response.writeHead(500,{'Content-Type' : 'application/json'});//json data type to notify client
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send response to user
            }
            return;
            
        }else{
            if(!data){//if no account is found   
                if(response!=null){//if user does not exist
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "User does not exist";//log message for client
                    response.data.success = 0; //success variable for client
                    response.end(JSON.stringify(response.data));// send response to client
                }
                return;    
            }else{
                //fetch user pinpals num
                //fetch user pal status
                //fetch user request num
                data.forEach(function(element){
                    PinPals.PinPalsModel.count({$or:[{$and:[{initator_id:user_id},{status:true}]},{$and:[{pal_id:user_id},{status:true}]}]},function(error,pinpals_num){//fetch pinpals num

                        if(pinpals_num){
                            element.user_pinpals = pinpals_num;
                        }else{
                            element.user_pinpals = 0;
                        }

                        PinPals.PinPalsModel.findOne({$or:[{$and:[{initator_id:user_id},{pal_id:session_user_id}]},{$and:[{initator_id:session_user_id},{pal_id:user_id}]}]},function(error,pinpal_status){//fetch pal status

                            if(pinpal_status){//if pinpalship returns data
                                if(pinpal_status.status==true){//if pinpal is true
                                    element.user_pinpal_status = 1;
                                }else{//if pinpalship is not confirmed
                                    element.user_pinpal_status = 3;
                                }
                            }else if(session_user_id == user_id){
                                element.user_pinpal_status = 0;
                            }else{
                                element.user_pinpal_status = 2;
                            }

                            PinPals.PinPalsModel.count({$or:[{$and:[{initator_id:user_id},{status:false}]},{$and:[{pal_id:user_id},{status:false}]}]},function(error,request_num){//fetch user request num

                                if(request_num){
                                    element.user_requests = request_num;
                                }else{
                                    element.user_requests = 0;
                                }

                                console.log(data);
                                response.writeHead(201,{'Content-Type':'application/json'});//server response is in jsons format
                                response.data.log = "User Fetched"; //log message for client
                                response.data.success = 1;//success variable for client
                                response.data.data = data; //return user data
                                response.end(JSON.stringify(response.data)); //send response to server
                                return;
                            });
                        });
                    });
                });
            } 
        }        
    });
}

function generate_key(){//find a better way to implement this
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
        uniqid = '';

    for(var i=0; i<31; i+=1){
        uniqid += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return uniqid;
} 

function createDirectory(dir){//function for creating s3 directory
    var params = {
        Key: dir,
        Bucket: spotpin-cdn,
        ACL: 'public-read',
        Body: 'create directory' 
    }
    
    s3.upload(params,function(error,data){
        if(error){
            console.log("error createing directory:"+ error);
        }else{
            if(data){
                console.log(data);
            }
        }
    });
}

function toUSer(data){ //function to parse request body in update and delete queries into a mongodb collection
    return new Users({
        username: data.username,
        password: data.password,
        email: data.email,
        //dp: data.dp,
        //bio : data.bio
    });
}

function toTempUser(user_key,data){//function to parse request body in update and delete queries into a mongodb collection
    return new TempUser({
        username : data.username,
        password : data.password,
        email : data.email,
        uniqKey : user_key
    });
}