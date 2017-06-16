var mongoose = require('mongoose'),
    shortid = require('shortid'),
    fs = require('fs');
    Pins = require('../models/pins');
    //AWS = require('aws-sdk')
 

var storiesSchema = new mongoose.Schema({
    id: {type: String, unique: true},
    title: String,
    category_id: Number,   
    user_id: String,
    created_at: {type: Date, 'default': Date.now},
    updated_at: {type: Date, 'default': Date.now}
});

//Define AWS params
/*var s3  = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
});*/


var Stories = mongoose.model('Stories',storiesSchema);

var exports = module.exports;

exports.create = function(requestBody,response,callback){
    
    
    var status = false;// create callback boolean flag
    var shortID = requestBody.story_id;
    var story = toStory(shortID, requestBody);//create story instance
    
    story.save(function(error){//save story instance
        console.log("Creating story..");
        
        if(!error){//if successfully saved
            
            console.log("Story Created");
            //createDirectory('uploads/user_'+requestBody.user_id+'/stories/story_'+shortID+'/');//create story directory synchronously
            status = true;//set flag as true
            
            //try to 
        }else{
                        
            console.log("error : "+error);
            status = false;//set flag as false
        }
        callback(status);
    });
}

exports.fetch_one = function(story_id,response){
    
    console.log("Find Story where id = "+story_id);
    
    Stories.findOne({id:story_id},function(error,data){
        if(error){//check for error
            
            if(response!=null){//catch error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }
        }else{
            if(!data){//if data doesnt exists in backend
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Story doesn't exist";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }else{
                //try to find number of likes and views so that stats can be passed along with data
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Story Fetched";//log error for client
                response.data.success = 1;//success variable for client
                response.data.data = data;
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }
        }
    });
}

exports.fetch_user_stories = function(user_id,response){//use pagination later on
    
    console.log("Find Stories where user_id = "+user_id);
    Stories.find({user_id:user_id},function(error,data){
        if(error){//check for error
            console.log("error: "+error);        
            if(response!=null){//catch error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }
        }else{
            if(!data){//if data doesnt exists in backend
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Story doesn't exist";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }else{
                //try to find number of likes and views so that stats can be passed along with data
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Story Fetched";//log error for client
                response.data.success = 1;//success variable for client
                response.data.data = data;
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }
        }    
    });
}

exports.update = function(story_id,requestBody,response){
    Stories.findOne({id: story_id},function(error,data){//fetch data to be updated
        if(error){//check internal server error
            console.log("error: "+error);
            if(response!=null){//catch error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }            
        }else{
            if(!data){//check if data doesnt exist
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Story doesnt exist";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }else{
                data.title = requestBody.title;
                data.category_id = requestBody.category_id;
                data.updated_at = Date.now();//update time of creation
                
                data.save(function(error){//save data
                    if(!error){
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Updated";//log error for client
                        response.data.success = 1;//success variable for client
                        response.end(JSON.stringify(response.data));//send json response to client
                        return;
                    }else{
                        console.log(error);
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Update Failed";//log error for client
                        response.data.success = 0;//success variable for client
                        response.end(JSON.stringify(response.data));//send json response to client                    
                        return;
                    }
                });
            }
        }
    
    });
}

exports.delete = function(requestBody,response){
    response.data = {};
    Stories.findOne({$and: [{id:requestBody.story_id},{user_id:requestBody.user_id}]},function(error,data){
        if(error){//check internal server error
            console.log("story deleting error: "+error);
            if(response!=null){//catch error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }            
        }else{
            if(!data){//check if data doesnt exist
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "User Unauthorized!";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }else{
                data.remove(function(error){//delete data
                    if(!error){
                        if(requestBody.delete_pins != false){//if user choose to delete story pins
                            Pins.delete_story_pins(requestBody,response);
                        }else{
                            response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                            response.data.log = "Story deleted without Pins";//log error for client
                            response.data.success = 1;//success variable for client
                            response.end(JSON.stringify(response.data));//send json response to client
                            return;   
                        }
                    }else{
                        console.log("Error Deleting story : "+error);
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Deletion Failed";//log error for client
                        response.data.success = 0;//success variable for client
                        response.end(JSON.stringify(response.data));//send json response to client                    
                        return;
                    }
                });
            }
        }    
    });
}  


/*function createDirectory(dir){//function for creating s3 directory
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
}*/

function toStory(shortID, data){
    return new Stories({
        id : shortID,
        title: data.title,
        category_id: data.category_id,
        user_id: data.user_id
    });
}