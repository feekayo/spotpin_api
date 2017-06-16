var mongoose = require('mongoose'),
    shortid = require('shortid');

var sessionsSchema = new mongoose.Schema({
    id: {type: String, unique: true, 'default': shortid.generate},
    session_id: String,
    platform_id : Number,
    user_id : String,
    created_at : {type: Date, 'default': Date.now}
}); 

var Sessions = mongoose.model('Sessions',sessionsSchema);

var exports = module.exports;

exports.create = function(session_id,user_id,requestBody,response){
    
    console.log("Create a session");
    
    var session = toSession(user_id,requestBody,session_id);//create session
    
    session.save(function(error){//save session
        if(!error){
            console.log("session created");
            return true;//session created
        }else{
            console.log(error);
            return false;//session not created
        }
    });
}

exports.validate = function(session_id,user_id,callback){
    
    console.log("validate session");
    
    Sessions.findOne({$and: [{session_id:session_id},{user_id:user_id}]},function(error,data){//find session user
        var status = false;//status flag set to fault, for callback method
        if(error){//try to catch error 500
            console.log(error);
            status = false; //failed to validate
        }else{
            if(data){
                console.log("session exists");
                status = true;//user validated 
            }else{
                console.log("session doesnt exists");
                status = false;//user not validated
            }
        }
        
        callback(status);
    });
    
}

exports.delete = function(session_id,requestBody,response){

    response.data = {};
    console.log("Delete Session");
    
    var user_id = requestBody.user_id;//initialize user_id variable
    
    console.log("user_id : "+user_id+" , session_id : "+session_id);
    
    Sessions.findOne({$and: [{session_id:session_id},{user_id:user_id}]},function(error,data){//find session user
    
        if(error){//try to catch error 500
            console.log(error);
            
            if(response!=null){
                response.writeHead(500,{'Content-Type' : 'application/json'});//set server response to json format
                response.data.log = "Internal Server Error";//log message to client
                response.data.success = 0; //success variable for client
                response.end(JSON.stringify(response.data));//send response to client
            }
            return;
        }else{
            if(!data){
                
                if(response!=null){//if user does not exist
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Session does not exist";//log message for client
                    response.data.success = 0; //success variable for client
                    response.end(JSON.stringify(response.data));// send response to client
                }
                return;
                
            }else{
            
                data.remove(function(error){
                    if(!error){
                        response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                        response.data.log = "Session Deleted";//log message for client
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

function generate_key(){
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
        uniqid = '';

    for(var i=0; i<15; i+=1){
        uniqid += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return uniqid;
} 

function toSession(user_id,data,session_id){
        
    return new Sessions({
        session_id : session_id,
        platform_id : data.platform_id,
        user_id : user_id
    });
    
}