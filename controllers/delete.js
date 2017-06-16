var Stories = require('../models/stories'),
    Pins = require('../models/pins'),
    Favorites = require('../models/likes'),
    Dislike = require('../models/dislikes'),
    LeaderBoards = require('../models/leaderboards'),
    Capsules = require('../models/timecapsule'),
    PinPals = require('../models/pinpals'),
    WatchList = require('../models/watchlist');
    

//delete operations controllers
module.exports = {
    story : function(request,response){//controller to delete a story and all it's pins
         if((request.body.user_id!=undefined) && (request.body.story_id != undefined) && (request.body.delete_pins != undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                        Stories.delete(request.body,response);
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
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
    
    pin : function(request,response){ //controller to delete an individual pin
        if((request.body.user_id!=undefined) && (request.body.pin_id!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    //validate user ownership of story
                    Pins.delete_one(request.body,response);//delete one pin
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
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
    
    favorite : function(request,response){ //controller to unfavorite a pin
        if((request.body.user_id!=undefined) && (request.body.like_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    Favorites.delete(request,response);
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
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
    
    dislike : function(request,response){ //controller to unfavorite a pin
        if((request.body.user_id!=undefined) && (request.body.dislike_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    Dislike.delete(request,response);//delete dislike
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
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
    
    leaderboard : function(request,response){ //controller to delete a leaderboard
        if((request.body.user_id != undefined) && (request.body.leaderboard_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    //validate user admin status
                    LeaderBoards.delete_one(request.body,response);   
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
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
    
    leaderboard_participant : function(request,response){ //controller to exit a leaderboard
        if((request.body.user_id != undefined) && (request.body.leaderboard_id!=undefined) && (request.body.member_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){//callback function
                if(validate_session==true){
                    LeaderBoards.delete_one_member(request.body,response);//carry out action            
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
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
    
    capsule : function(request,response){ //controller to delete a capsule (doesnt delete pins tho)
        if((request.body.user_id != undefined) && (request.body.capsule_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    Capsules.delete_one(request.body,response);//do stuff
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
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
    
    capsule_participant : function(request,response){ //controller to stop participating in a capsule
        if((request.body.user_id != undefined) && (request.body.capsule_id!=undefined) && (request.body.member_id!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    Capsules.delete_one_member(request.body,response);//carry out action 
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
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
    
    pinpal : function(request,response){ //controller to decline pinpal request/ stop pinpalship
        if((request.body.user_id != undefined) && (request.body.pinpal_id)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    PinPals.delete(request.body,response);
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                      
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
    
    watchlist_item : function(request,response){//controller for deleting watchlist items
        if((request.body.user_id!=undefined) && (request.body.watch_id!=undefined)){//validate request
            //validate session
            Session.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session){
                    WatchList.remove_watchlist_item(request.body,response);
                }else{
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client 
                }
            });
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client         
        }
    
    }
    
}