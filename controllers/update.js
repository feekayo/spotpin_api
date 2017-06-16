var Capsule = require('../models/timecapsule'),
    PinPals = require('../models/pinpals'),
    LeaderBoards = require('../models/leaderboards'),
    Sessions = require('../models/sessions');

//update operations controllers
module.exports = {
    capsule : function(request,response){//controller to update time capsule details
        if((request.body.user_id != undefined) && (request.body.capsule_id!=undefined) && (request.body.name!=undefined) && (request.body.description!=undefined) && (request.body.expires_at!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    Capsule.validate_admin(request.body.user_id,request.body.capsule_id,function(validated){//validate admin status
                        if(validated){
                            Capsule.update(request.body,response);
                        }else{
                            response.data = {};//set response to array
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response to json format
                            response.data.log = "User Unauthorized";
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));
                            return;
                        }
                    });
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client  
                    return;
                }
            });            
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client         
            return;
        }        
    },
    
    
    pinpal : function(request,response){ //controller to accept pinpal request 
        if((request.body.user_id !=undefined) && (request.body.pinpal_id!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    //do stuff
                    PinPals.update_status(request.body,response);
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client    
                    return;
                }
            });            
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client         
        }        
    },
    
    
    leaderboard_invite : function(request,response){ //controller to accept leaderboard invite
        if((request.body.user_id!=undefined)&&(request.body.leaderboard_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    LeaderBoards.update_invite(request.body,response);//do stuff
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client        
                    return;
                }
            });            
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client  
            return;
        }        
    },
    
    capsule_invite : function(request,response){ //controller to accept capsule invite
        if((request.body.user_id!=undefined)&&(request.body.capsule_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    Capsule.update_invite(request.body,response);//do stuff
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client  
                    return;
                }
            });            
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client
            return;
        }        
    },
    
    
    leaderboard : function(request,response){ //controller to update leaderboard details
        if((request.body.user_id!=undefined) && (request.body.leaderboard_id!=undefined) && (request.body.title!=undefined) && (request.body.bio!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    //validate admin status
                    LeaderBoards.validate_admin(request.body.user_id,request.body.leaderboard_id,function(validated){
                        if(validated){//if user is admin
                            LeaderBoards.update(request.body,response);//do stuff
                        }else{//if user aint admin
                            response.data = {};//set response array
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response format to JSON
                            response.data.log = "User Unauthorized";
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            return;
                        }
                    });
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
                    return;
                }
            });            
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client         
        }        
    },
    
    lock_capsule : function(request,response){//controller to lock capsule
        if((request.body.user_id!=undefined) && (request.body.capsule_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    //validate admin status
                    Capsule.lock_capsule(request.body,response);
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
                    return;
                }
            });          
        }else{//if  request is invalid
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client            
        }
    }
};