 var Users = require('../models/users'),//
    Sessions = require('../models/sessions'),
    Stories = require('../models/stories'),
    Capsule = require('../models/timecapsule'),
    Favorites = require('../models/likes'),
    Dislike = require('../models/dislikes'),
    Pins = require('../models/pins');
    PinPals = require('../models/pinpals'),
    LeaderBoards = require('../models/leaderboards'),
    Points = require('../models/points'),
    WatchList = require('../models/watchlist');
    multer = require('multer');

//create controllers

module.exports = {
    story : function(request,response){//story creation **incomplete
        if((request.params.session_id!=undefined) && (request.body.user_id!=undefined) && (request.body.title!=undefined) && (request.body.category_id!=undefined) && (request.body.story_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    //create story
                    Stories.create(request.body,response,function(created){//created callback
                        if(created!=false){//if story was created
                            Points.create(request.body.user_id,3,2,function(notified){//notify user of points and award points
                                if(notified){//if user is notified
                                    response.data = {};//set response to array
                                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                                    response.data.log = "Success";//log message for client
                                    response.data.success = 1;//success variable for client
                                    response.end(JSON.stringify(response.data));
                                    return;
                                }else{//if notification fails
                                    response.data = {};//set response to array
                                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                                    response.data.log = "Success";//log message for client
                                    response.data.success = 1;//success variable for client
                                    response.end(JSON.stringify(response.data));
                                    return;
                                }
                            });  

                        }else{
                            response.data = {};//set response to array
                            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                            response.data.log = "Story creation failed";//log message for client
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
    
    pin : function(request,response){//create single pin
if((request.params.session_id!=undefined) && (request.body.user_id!=undefined) && (request.body.caption!=undefined) && (request.body.category_id!=undefined) && (request.body.story_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    //create story
                    Pins.create(request,response,function(created){
                        if(created){
                            response.data = {};//set response array
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response type to json
                            response.data.log = "Pinned";//log message for client
                            response.data.success = 1;//success variable for client
                            response.end(JSON.stringify(response.data));//return data to user
                            return;
                        }else{
                            response.data = {}//set response array
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response type to json
                            response.data.log = "Pin Error"//log message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));//return data to user
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
    
    capsule : function(request,response){//capsule creation ^^complete untested
        if((request.params.session_id!=undefined) && (request.body.user_id!=undefined) && (request.body.name!=undefined) && (request.body.description!=undefined) && (request.body.expires_at!=undefined)){//request validation
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){//if session is validated
                    //create capsule
                    Capsule.create(request.body,response,function(created){//callback function
                        if(created){//if capsule was created
                            var capsule_id = created;
                            Capsule.memberCreate('admin',request.body.user_id, capsule_id,true,function(created){//create leaderboard admin
                                if(created){
                                    response.data = {};//set response array
                                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                                    response.data.capsule_id = capsule_id;
                                    response.data.log = "Capsule created";//log message to client
                                    response.data.success = 1;//success variable for client
                                    response.end(JSON.stringify(response.data));                                
                                    return;
                                }else{
                                    response.data = {};//set response array
                                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                                    response.data.log = "Capsule Admin not set";//log message to client
                                    response.data.success = 0;//success variable for client
                                    response.end(JSON.stringify(response.data));                                  
                                    return;
                                }
                            
                            });
                        }else{
                            response.data = {};
                            response.writeHead(201,{'Content-Type' : 'application/json'});//set server response to json format
                            response.data.log = "Capsule not created";//log message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));//send response to client
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
    
    capsule_members : function(request,response){//create capsule members ^^complete untested
        if((request.body.user_id!=undefined) && (request.body.capsule_id != undefined) && (request.body.member_user_id!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session){
                    Capsule.validate_admin(request.body.user_id,request.body.capsule_id,function(validated){//validate that user is admin of capsule
                        if(validated){
                                Capsule.memberCreate('muggle',request.body.member_user_id,request.body.capsule_id,false,function(created){//callback function
                                    if(created){//if last upload has been carried out
                                        response.data = {};//initialize client response array
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.success = 1;//success variable for client
                                        response.data.log = "Member Added";//log message for client
                                        response.end(JSON.stringify(response.data));//return 
                                        return;                                 
                                    }else{
                                        response.data = {};//initialize client response array
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.success = 0;//success variable for client
                                        response.data.log = "Member not added";//log message for client
                                        response.end(JSON.stringify(response.data));//return 
                                        return; 
                                    }
                                    
                                }); 
                        }else{
                            response.data = {};//set response to array
                            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                            response.data.log = "User Unauthorized!";//log message for client
                            response.data.success = 0; // success variable for client
                            response.end(JSON.stringify(response.data)); //send response to client                     
                            return;
                        }
                    });
                }else{//if session is not valid
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
        
    leaderboard : function(request,response){//leaderboard creation ^^complete untested
        if((request.body.title != undefined) && (request.body.bio != undefined) && (request.body.user_id)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    //create leaderboards
                    LeaderBoards.create(request.body,function(created){
                        if(created!=false){
                            var leaderboard_id = created; //return leaderboard_id passed from call back function
                            //create admin user 
                            LeaderBoards.memberCreate('admin',request.body.user_id, leaderboard_id,true,function(created){//create leaderboard admin
                                if(created){
                                    response.data = {};//set response array
                                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                                    response.data.leaderboard_id = leaderboard_id;
                                    response.data.log = "LeaderBoard created";//log message to client
                                    response.data.success = 1;//success variable for client
                                    response.end(JSON.stringify(response.data));        
                                    return;
                                }else{
                                    response.data = {};//set response array
                                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                                    response.data.log = "LeaderBoard Admin not set";//log message to client
                                    response.data.success = 0;//success variable for client
                                    response.end(JSON.stringify(response.data));
                                    return;
                                }
                            
                            });
                        }else{
                            response.data = {};//set response array
                            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                            response.data.log = "LeaderBoard could not be created";//log message to client
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
    
    leaderboard_members : function(request,response){//create leaderboard members ^^complete untested
       if((request.body.user_id!=undefined) && (request.body.leaderboard_id != undefined) && (request.body.member_user_id!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session){
                    LeaderBoards.validate_admin(request.body.user_id,request.body.leaderboard_id,function(validated){//validate that user is admin of leaderboards
                        if(validated){//if admin status validated successfully
                            LeaderBoards.memberCreate('muggle',request.body.member_user_id,request.body.leaderboard_id,false,function(created){
                                            
                                if(created){//if last upload has been carried out
                                    response.data = {};//initialize client response array
                                    response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                    response.data.success = 1;//success variable for client
                                    response.data.log = "Member added";//log message for client
                                    response.end(JSON.stringify(response.data));//return 
                                    return;                                 
                                }else{
                                    response.data = {};//initialize client response array
                                    response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                    response.data.success = 0;//success variable for client
                                    response.data.log = "Member not added";//log message for client
                                    response.end(JSON.stringify(response.data));//return 
                                    return;   
                                }
                                    
                            });
                        }else{
                            response.data = {};//set response to array
                            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                            response.data.log = "User Unauthorized!";//log message for client
                            response.data.success = 0; // success variable for client
                            response.end(JSON.stringify(response.data)); //send response to client                     
                            return;
                        }
                    });
                }else{//if session is not valid
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
    
    
    favorite : function(request,response){//favorite creation ^^complete & untested
        if((request.body.pin_id!=undefined) && (request.body.user_id!=undefined) && (request.body.pin_user_id!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){//if session is validated
                    //console.log(validate_session+" line 340");
                    //validate pin *** validate pin first
                    Pins.validate(request.body.pin_id,function(validated){//validate pin
                        //console.log(validated+" line 343");
                        if(validated){//if pin is validated
                            Favorites.create(request.body,response);//create favorite
                        }else{
                            response.data = {};//set response to array
                            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                            response.data.log = "Pin doesnt exist";//log message for client
                            response.data.success = 0; // success variable for client
                            response.end(JSON.stringify(response.data)); //send response to client      
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
    
    
    dislike : function(request,response){//dislike creation ^^complete & untested
        if((request.body.pin_id!=undefined) && (request.body.user_id!=undefined) && (request.body.pin_user_id!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){//if session is validated
                    //validate pin *** validate pin first
                    Pins.validate(request.body.pin_id,function(validated){//validate pin
                        if(validated){//if pin is validated
                            Dislike.create(request.body,response);//create dislike
                        }else{
                            response.data = {};//set response to array
                            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                            response.data.log = "Pin doesnt exist";//log message for client
                            response.data.success = 0; // success variable for client
                            response.end(JSON.stringify(response.data)); //send response to client      
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
    
    
    pinpal : function(request,response){//pin pal creation ^^ complete untested
        if((request.body.user_id != undefined) && (request.body.pal_id != undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){//if session is validated
                    PinPals.create(request.body,response);//create pinpal
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
    
    
    points : function(request,response){//points awarding ^^complete untested
        if((response.data.user_id!=undefined) && (response.data.points!=undefined) && (response.data.reason!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){
                if(validate_session==true){
                    //insert points
                    Points.create(request.body,response);
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
    
    watchlist_item : function(request,response){//controller for creating watchlist items 
        if((request.body.user_id!=undefined) && (request.body.capsule_id!=undefined)){//validate request
            //validate session
            Sessions.validate(request.params.session_id,request.body.user_id,function(validate_session){//validate session
                if(validate_session==true){//if session is validated
                    WatchList.create(request.body,response);
                }else{//if session isnt validated
                    response.data = {};//set response to array
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid session";//log message for client
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
    }
}