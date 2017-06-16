var url = require('url'),
    Locations = require('../models/locations'),
    Capsules = require('../models/timecapsule'),
    Pins = require('../models/pins'),
    PinPals = require('../models/pinpals'),
    LeaderBoards = require('../models/leaderboards'),
    Users = require('../models/users'),
    Sessions = require('../models/sessions'),
    Notifications = require('../models/notifications'),
    WatchList = require('../models/watchlist');
//read operations controller
module.exports = {
    nearby_spots : function(request,response){ // controller for fetching nearby spots
        
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==5) && (get_params.longitude!=undefined) && (get_params.latitude!=undefined) && (get_params.radius!=undefined) && (get_params.page_num!=undefined) && (get_params.page_length!=undefined)){
            Locations.fetch_nearby(get_params.longitude,get_params.latitude,get_params.radius,get_params.page_num,get_params.page_length,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }
    },
    spot_pins : function(request,response){ //controller for fetching spot pins
        
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==4) && (get_params.user_id!=undefined) && (get_params.location_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            Pins.fetch_spotpins(get_params.location_id,get_params.user_id,get_params.page_length,get_params.page_num,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }    
    },
    user_stats : function(request,response){ // controller for fetching user stats
        
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==2) && (get_params.user_id!=undefined) && (get_params.session_user_id!=undefined)){
            Users.user_stats(get_params.user_id,get_params.session_user_id,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete request";//get_params.user_id+" "+get_params.session_user_id;//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }    
    },
    user_pinpals : function(request,response){ //controller for fetching user pinpals
       
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==3) && (get_params.user_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            Sessions.validate(request.params.session_id,get_params.user_id,function(validate_session){
                if(validate_session){
                    PinPals.fetch_user_pinpals(get_params.user_id,get_params.page_length,get_params.page_num,response);
                }else{
                    response.data = {};
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                 
                }
            });
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }        
    },
    discover_options : function(request,response){ //controller for fetching disocver options
    
    },
    yesterday_pins : function(request,response){ //controller for fetching previous day's pins
       
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==3) && (get_params.user_id!=undefined) && (get_params.page_length !=undefined) && (get_params.page_num!=undefined)){
            Pins.fetch_yesterday_pins(get_params.user_id,get_params.page_length,get_params.page_num,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }        
    },
    user_notifications : function(request,response){ //controller for fetching user notifications
       
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==3) && (get_params.user_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,get_params.user_id,function(validate_session){
                if(validate_session==true){
                    Notifications.fetch_user_notifications(get_params.user_id,get_params.page_length,get_params.page_num,response);
                }else{
                    response.data = {};
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                 
                }
            });        
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }        
    },
    user_badges : function(request,response){ //controller for fetching user badges
       
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params==1)) && (get_params.user_id!=undefined)){
        
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }        
    },
    pinpal_requests : function(request,response){ //controller for a user's fetching pinpal requests
       
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==3) && (get_params.user_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            //validate session
            Sessions.validate(request.params.session_id,get_params.user_id,function(validate_session){
                if(validate_session==true){
                    PinPals.fetch_user_requests(get_params.user_id,get_params.page_length,get_params.page_num,response);
                }else{
                    response.data = {};
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                 
                }
            });
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }        
    },
    user_pins : function(request,response){ //controller for fetching a user's pins
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==3) && (get_params.user_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            Sessions.validate(request.params.session_id,get_params.user_id,function(validate_session){
                if(validate_session==true){
                    Pins.fetch_user_pins(get_params.user_id,get_params.page_length,get_params.page_num,response);
                }else{
                    response.data = {};
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                 
                }
            });            
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }     
    },
    user_leaderboards : function(request,response){ //controller for fetching a user's leaderboards
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==3) && (get_params.user_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            Sessions.validate(request.params.session_id,get_params.user_id,function(validate_session){
                if(validate_session){
                    LeaderBoards.fetch_user_leaderboards(get_params.user_id,get_params.page_length,get_params.page_num,response);
                }else{
                    response.data = {};
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid Session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                  
                }
            });
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }      
    },
    leaderboard : function(request,response){ //controller for fetching a leaderboard, its' participants and details
         var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==2) && (get_params.user_id!=undefined) && (get_params.leaderboard_id!=undefined)){
            LeaderBoards.fetch_leaderboard(get_params.user_id,get_params.leaderboard_id,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }     
    },
    capsule : function(request,response){ //controller for fetching a leaderboard, its' participants and details
         var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==2) && (get_params.user_id!=undefined) && (get_params.capsule_id!=undefined)){
            Capsules.fetch_capsule(get_params.user_id,get_params.capsule_id,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }     
    },
    user_favorites : function(request,response){ //controller for fetching a user's favorite pins by relative distance
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==4) && (get_params.user_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            Sessions.validate(request.params.session_id,get_params.user_id,function(validate_session){
                if(validate_session){
                    Likes.fetch_user_likes(get_params.user_id,get_params.page_length,get_params.page_num,response);
                }else{
                    response.data = {};
                    response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
                    response.data.log = "Invalid session";//log message for client
                    response.data.success = 0; // success variable for client
                    response.end(JSON.stringify(response.data)); //send response to client                 
                }
            });
            
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }      
    }, 
    somewhere : function(request,response){ //controller for fetching the spots from somewhere searched
          var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==5) && (get_params.longitude!=undefined) && (get_params.latitude!=undefined) && (get_params.radius!=undefined) && (get_params.page_num!=undefined) && (get_params.page_length!=undefined)){
            Locations.fetch_nearby(get_params.longitude,get_params.latitude,get_params.radius,get_params.page_num,get_params.page_length,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }    
    },
    user_capsules : function(request,response){ //controller to fetch the capsules where a user is a participant
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==3) && (get_params.user_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            Capsules.fetch_user_capsules(get_params.user_id,get_params.page_length,get_params.page_num,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }      
    },
    capsule_pins : function(request,response){ //controller to fetch all the stories in a capsule
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==4) && (get_params.capsule_id!=undefined) && (get_params.user_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            Pins.fetch_capsule_pins(get_params.capsule_id,get_params.user_id,get_params.page_length,get_params.page_num,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }     
    },
    capsule_participants : function(request,response){ //controller to fetch all a capsule's participants
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==4) && (get_params.user_id!=undefined) && (get_params.capsule_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            Capsules.fetch_capsule_participants(get_params.user_id,get_params.capsule_id,get_params.page_length,get_params.page_num,response);      
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }      
    },
    /**capsule_invites : function(request,response){ //get all of a user's capsule invites
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==4) && (get_params.user_id!=undefined) && (get_params.capsule_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            
            //Capsules.fetch_capsule_invites(get_params.user_id,get_params.capsule_id,get_params.page_length,get_params.page_num,response);
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client           
        }     
    },**/
    
    user_watchlist : function(request,response){ //controller to fetch a user"s watchlist
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==3) && (get_params.user_id!=undefined) && (get_params.page_length!=undefined) && (get_params.page_num!=undefined)){
            WatchList.fetch_user_watchlist(get_params.user_id,get_params.page_length,get_params.page_num);
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