var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Notifications = require('./notifications'),
    Users = require('./users');

var pinpalSchema = new mongoose.Schema({
    id : {type: String, unique: true, 'default': shortid.generate},
    initator_id : String,
    pal_id : String,
    status : {type: Boolean, 'default': false},
    created_at: {type: Date, 'default': Date.now},
    updated_at: {type: Date, 'default': Date.now}
});

var PinPals = mongoose.model('PinPals',pinpalSchema);

var exports = module.exports;

exports.PinPalsModel = PinPals;
exports.create = function(requestBody,response){
    
    response.data = {};//initialize response data array 
    //check if relationship exists
    PinPals.findOne({$or: [{$and: [{initator_id : requestBody.user_id},{pal_id : requestBody.pal_id}]}
                            ,{$and: [{initator_id : requestBody.pal_id},{pal_id : requestBody.user_id}]}]} , function(error,data){
        if(error){//check for error
            console.log(error);//log error
            if(response!=null){//catch error 500
                response.writeHead(500,{'Content-Type': 'application/json'});//set response type to JSON
                response.data.log = "Internal server error";//log error message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//return data to client
                return;
            }
        }else{
            if(data){
                response.writeHead(201,{'Content-Type': 'application/json'});//set response type to JSON
                response.data.log = "Pinpal exists";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//return data to client 
                return;
            }else{
               var pinpal = toPinPal(requestBody);//create pinpal instance
                
                pinpal.save(function(error){//save pinpal instance
                    console.log(error);//log error
                    if(error){
                        if(response!=null){//catch error 500
                            response.writeHead(500,{'Content-Type': 'application/json'});//set response type to JSON
                            response.data.log = "Internal server error";//log error message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));//return data to client
                            return;
                        }
                    }else{
                        Notifications.create(requestBody.pal_id,5,0,function(notified){//notify user
                            if(notified){//if user is notified give response 
                                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                response.data.log = "Success";
                                response.data.success = 1;
                                response.end(JSON.stringify(response.data));   
                                return;
                            }else{//if user is not notified still give user positive response
                                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                response.data.log = "Success";
                                response.data.success = 1;
                                response.end(JSON.stringify(response.data));   
                                return;                                    
                            }
                        });  
                    }
                })
            }
        }
    });
}

exports.fetch_one = function(requestBody,response){

}

exports.fetch_user_pinpals = function(user_id,page_length,page_num,response){//use paginator

    var pipeline = [{
        $match: {$and: [{$or:[{initator_id:user_id},{pal_id:user_id}]},{status: true}]}
    },
    {
        $project: {
            id: 1,
            initator_id: 1,
            pal_id: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,
        }
    },
    {
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)    
    },{
        $limit: parseInt(page_length)
    }];
    
    PinPals.aggregate(pipeline,function(error,data){
        if(error){
            console.log(error);//log error
            if(response!=null){//check for error 500
                response.data = {};//set server response arrya
                response.writeHead(500,{'Content-Type':'application/json'});//set server response header and type
                response.data.log = "Internal server error";//log error message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send response to client 
            }
        }else{
            if(data && Object.keys(data).length !=0){//if data is found 
                
                var i = 0; //set up counter
                //pass user data into each instance
                data.forEach(function(element){//async for loop
                    if(user_id!=element.initator_id){
                        Users.UsersModel.findOne({id: element.initator_id},function(error,docs){
                            if(docs){
                                element.user_data = {};
                                element.user_data.username = docs.username;//pass user data into array
                                element.user_data.bio = docs.bio;//pass user data into array
                                element.user_data.dp = docs.dp;//pass user data into array
                                element.user_data.user_id = docs.id;//pass user data into array
                            }                     
                            
                            if(i==data.length-1){
                                response.data = {};//set server response to an array
                                response.writeHead(201,{'Content-Type':'application/json'});//set server response type to JSON
                                response.data.log = "Success";//client log message
                                response.data.data = data; 
                                response.data.success = 1;//success variable for client
                                response.end(JSON.stringify(response.data));//send response to client                                  
                            }
                            i++;//increment counter
                        });
                    }else if(user_id!=element.pal_id){
                        Users.UsersModel.findOne({id: element.pal_id},function(error,docs){//find user data
                            if(docs){
                                element.user_data = {};
                                element.user_data.username = docs.username;//pass user data into array
                                element.user_data.bio = docs.bio;//pass user data into array
                                element.user_data.dp = docs.dp;//pass user data into array
                                element.user_data.user_id = docs.id;//pass user data into array
                            }                     
                            
                            if(i==data.length-1){
                                response.data = {};//set server response to an array
                                response.writeHead(200,{'Content-Type':'application/json'});//set server response type to JSON
                                response.data.log = "Success";//client log message
                                response.data.data = data; 
                                response.data.success = 1;//success variable for client
                                response.end(JSON.stringify(response.data));//send response to client   
                            }
                            
                            i++;//increment counter
                        });
                    }
                });
            }else{//if data is not found
                response.data = {};//set server response to an array
                response.writeHead(200,{'Content-Type':'application/json'});//set server response type to JSON
                response.data.log = "No Data";//client log message
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send response to client         
            }
        }
    });
}

exports.fetch_user_requests = function(user_id,page_length,page_num,response){

    var pipeline = [{
        $match: {$and: [{$or:[{initator_id:user_id},{pal_id:user_id}]},{status: false}]}
    },
    {
        $project: {
            id: 1,
            initator_id: 1,
            pal_id: 1,
            status: 1,
            created_at: 1,
            updated_at: 1,
        }
    },
    {
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)    
    },{
        $limit: parseInt(page_length)
    }];
    
    PinPals.aggregate(pipeline,function(error,data){
        if(error){
            console.log(error);//log error
            if(response!=null){//check for error 500
                response.data = {};//set server response arrya
                response.writeHead(500,{'Content-Type':'application/json'});//set server response header and type
                response.data.log = "Internal server error";//log error message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send response to client 
            }
        }else{
            if(data && Object.keys(data).length !=0){//if data is found 
                
                var i = 0; //set up counter
                //pass user data into each instance
                data.forEach(function(element){//async for loop
                    if(user_id!=element.initator_id){
                        Users.UsersModel.findOne({id: element.initator_id},function(error,docs){
                            if(docs){
                                element.user_data = {};
                                element.user_data.showAcceptButton = true;//do not show accept button
                                element.user_data.username = docs.username;//pass user data into array
                                element.user_data.bio = docs.bio;//pass user data into array
                                element.user_data.dp = docs.dp;//pass user data into array
                                element.user_data.user_id = docs.id;//pass user data into array
                            }                     
                            
                            if(i==data.length-1){
                                response.data = {};//set server response to an array
                                response.writeHead(201,{'Content-Type':'application/json'});//set server response type to JSON
                                response.data.log = "Success";//client log message
                                response.data.data = data; 
                                response.data.success = 1;//success variable for client
                                response.end(JSON.stringify(response.data));//send response to client                                  
                            }
                            i++;//increment counter
                        });
                    }else if(user_id!=element.pal_id){
                        Users.UsersModel.findOne({id: element.pal_id},function(error,docs){//find user data
                            if(docs){
                                element.user_data = {};
                                element.user_data.showAcceptButton = false;//do not show accept button
                                element.user_data.username = docs.username;//pass user data into array
                                element.user_data.bio = docs.bio;//pass user data into array
                                element.user_data.dp = docs.dp;//pass user data into array
                                element.user_data.user_id = docs.id;//pass user data into array
                            }                     
                            
                            if(i==data.length-1){
                                response.data = {};//set server response to an array
                                response.writeHead(200,{'Content-Type':'application/json'});//set server response type to JSON
                                response.data.log = "Success";//client log message
                                response.data.data = data; 
                                response.data.success = 1;//success variable for client
                                response.end(JSON.stringify(response.data));//send response to client   
                            }
                            
                            i++;//increment counter
                        });
                    }
                });
            }else{//if data is not found
                response.data = {};//set server response to an array
                response.writeHead(200,{'Content-Type':'application/json'});//set server response type to JSON
                response.data.log = "No Data";//client log message
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send response to client         
            }
        }
    });
}

exports.update_status = function(requestBody,response){//confirm friendship, change status from false to true
    //check for data instance
    PinPals.findOne({$and: [{pal_id: requestBody.user_id},{id:requestBody.pinpal_id}]},function(error,data){
        if(error){//if error
            console.log(error);//log error
            if(response!=null){
                response.data = {};//set server response array
                response.writeHead(500,{'Content-Type': 'application/json'});//set response type to JSON
                response.data.log = "Internal server error";//log error message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//return data to client
                return;                
            }
        }else{
            if(data){
                data.status = true;//update pinpal status
                data.updated_at = Date.now();//update timestamp
                
                var pinpal_user_id = data.initator_id;
                data.save(function(error){//save updated data set
                    if(error){//if error in saving
                        console.log(error);//log error
                        if(response!=null){
                            response.data = {};//set server response array
                            response.writeHead(500,{'Content-Type': 'application/json'});//set response type to JSON
                            response.data.log = "Internal server error";//log error message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));//return data to client
                            return;                
                        }                    
                    }else{//if no error in saving
                        Notifications.create(pinpal_user_id,6,0,function(notified){//notify user
                            if(notified){//if user is notified give response 
                                response.data = {};
                                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                response.data.log = "Success";
                                response.data.success = 1;
                                response.end(JSON.stringify(response.data));   
                                return;
                            }else{//if user is not notified still give user positive response
                                response.data = {};
                                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                response.data.log = "Success";
                                response.data.success = 1;
                                response.end(JSON.stringify(response.data));   
                                return;                                    
                            }
                        });                    
                    }
                });
            }else{
                response.data = {};//set server response array
                response.writeHead(201,{'Content-Type': 'application/json'});//set response type to JSON
                response.data.log = "User Unauthorized";//log error message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//return data to client
                return;   
            }
        }
    });
}

exports.delete = function(requestBody,response){
    PinPals.findOne({$and: [{id: requestBody.pinpal_id},{$or: [{initiator_id: requestBody.user_id},{pal_id: requestBody.user_id}]}]},function(error,data){//fetch user set
        if(error){
            if(response!=null){
                response.data = {};//set response array
                response.writeHead(500,{'Content-Type': 'application/json'});//set response type to JSON
                response.data.log = "Internal server error";//log error message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//return data to client
                return;                
            }
        }else{
            if(data){
                data.remove(function(error){
                    if(error){
                        console.log(error);
                        if(response!=null){
                            response.data = {}; //set response array
                            response.writeHead(500,{'Content-Type': 'application/json'});//set response type to JSON
                            response.data.log = "Internal server error";//log error message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));//return data to client
                            return;
                        }
                    }else{
                        response.data = {};//set response array
                        response.writeHead(500,{'Content-Type': 'application/json'});//set response type to JSON
                        response.data.log = "Internal server error";//log error message for client
                        response.data.success = 0;//success variable for client
                        response.end(JSON.stringify(response.data));//return data to client
                        return;                    
                    }
                });
            }else{
                response.data = {};//set response array
                response.writeHead(201,{'Content-Type': 'application/json'});//set response type to JSON
                response.data.log = "User Unauthorized";//log error message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//return data to client
                return;
            }
        }
    });
}

function toPinPal(data){
    return new PinPals({
        initator_id : data.user_id,
        pal_id : data.pal_id
    })
}