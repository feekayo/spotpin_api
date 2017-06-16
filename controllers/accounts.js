//external dependencies
var Session = require('../models/sessions'),
    User = require('../models/users'),
    url = require('url');
    PasswordChange = require('../models/password');
    //Stories = require('../models/stories');

//accounts controllers
module.exports = {
    index : function(request,response){
        response.send("Welcome to the Spotpin API");
    },
    
    
    login : function(request,response){ //route for login
        
        var get_params = url.parse(request.url,true).query;//fetch get request params
        
        if((Object.keys(get_params).length==3) && (get_params.user!=undefined) && (get_params.password!=undefined) && (get_params.platform_id!=undefined)){//check if completete request was sent
            User.validate_account(get_params,response);//do stuff                        
        }else{
            response.data = {};
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client        
        }        
    },
    
    
    signup : function(request,response){ //controller for sign up
        //console.log(request.body);
        if((request.body.username!=undefined && request.body.username!=null) && (request.body.email!=undefined && request.body.email!=null) && (request.body.password!=undefined && request.body.password!=null)){//check request body variables
            User.create_account(request,response);//do stuff
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client         
        }
    },
    
    
    forgot_password : function(request,response){ //controller to send update password message
        if(request.body.email){//check request body variables
            PasswordChange.create(request,response);//create change instance and send email to user
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client         
        }
    },
    
    confirm_account : function(request,response){ //controller to confirm account
        //do stuff
        User.confirm_account(request.params.uniq_key,request.body,response);
    },
    
    update_account : function(request,response){ // controller to update account
        if((request.body.username != null && request.body.username != undefined) && (request.body.bio != null && request.body.bio!= undefined) && (request.body.user_id != null && request.body.user_id!= undefined) && (request.body.dp_bucket != null && request.body.dp_bucket!= undefined) && (request.body.dp_object != null && request.body.dp_object!= undefined)){//check request body variables
            
            //validate session
            Session.validate(request.params.session_id,request.body.user_id,function(validate_session){//call back function
                if(validate_session==true){//if session is valid
                    User.update_account(request.body,response)//do stuff    
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
    
    
    update_password : function(request,response){ //controller to update password
         if((request.body.password != null && request.body.password != undefined) && (request.body.user_id != null && request.body.user_id!= undefined)){//check request body variables
            User.update_password(request.body,response)//do stuff                        
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client         
        }       
    },
    
    
    signout : function(request,response){ //controller to sign out
        if(request.body.user_id != null && request.body.user_id != undefined){//check if user_id was posted
            Session.delete(request.params.session_id,request.body,response);//do stuff
        }else{
            response.data = {};//set response to array
            response.writeHead(201,{'Content-Type' : 'application/json'});//server response is in json format
            response.data.log = "Incomplete Request";//log message for client
            response.data.success = 0; // success variable for client
            response.end(JSON.stringify(response.data)); //send response to client            
        }
    }
};