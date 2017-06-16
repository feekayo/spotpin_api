var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Notifications = require('./notifications'),
    Pins = require('./pins');
    
var capsuleSchema = new mongoose.Schema({
    id: {type: String, unique: true},
    name: String,
    decription: String,
    expires_at: {type: Date},
    created_at: {type: Date, 'default': Date.now},
    updated_at: {type: Date, 'default': Date.now},
    locked: {type: Boolean, 'default': false}
});

var Capsule = mongoose.model('Capsules',capsuleSchema);

var capsuleMembersSchema = new mongoose.Schema({//define schema
    id : {type: String, unique: true, 'default': shortid.generate},
    user_id : String,
    capsule_id : String,
    role : String,
    status : {type: Boolean, 'default': false}
});

var CapsuleMembers = mongoose.model('CapsuleMembers',capsuleMembersSchema);

var exports = module.exports;

exports.CapsuleModel = Capsule;

exports.create = function(requestBody,response,callback){
    
    console.log("Creating capsule");
    var shortID = shortid.generate();
    var capsule = toCapsule(shortID,requestBody);
    
    var status = false;
    capsule.save(function(error){
        if(error){
            console.log(error);
            status = false;
        }else{
            status = shortID;
        }
        Notifications.create(requestBody.user_id,10,0,function(notified){//notify user
            if(notified){//if user is notified give response 
                callback(status);
            }else{//if user is not notified still give user positive response
               callback(status);                                  
            }
        });  
    });
}

exports.memberCreate = function(role,user_id,capsule_id,stat,callback){
    
    var status = false;//initialize callback flag
    var capsuleMember = toCapsuleMember(user_id,capsule_id,role,stat);//create data instance

    CapsuleMembers.findOne({$and:[{user_id:user_id},{capsule_id:capsule_id}]},function(error,data){

        if(error){
            callback(status);
        }else{
            if(!data){
                capsuleMember.save(function(error){//save leaderboard member
                    if(error){
                        console.log("error saving capsule members : "+error);//log error
                        status = false
                    }else{
                        status = true;
                    } 
                    Notifications.create(user_id,11,0,function(notified){//notify user
                        if(notified){//if user is notified give response 
                            callback(status);
                        }else{//if user is not notified still give user positive response
                           callback(status);                                  
                        }
                    });  
                });
            }else{
                callback(status);
            }
        }
    });
}

exports.update_invite = function(requestBody,response){
    CapsuleMembers.findOne({$and: [{user_id:requestBody.user_id},{capsule_id:requestBody.capsule_id}]},function(error,data){
        if(error){//if error
            console.log(error);//log error
            if(response!=null){//check for error 500
                response.data = {};//initilize client response array
                response.writeHead(500,{'Content-Type':'application/json'});//set response type
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
                return;            
            }
        }else{
            if(data){
                data.status = true;//update status
                
                data.save(function(error){
                    if(error){
                        console.log(error);//log error
                        if(response!=null){    
                            response.data = {};//initilize client response array
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type
                            response.data.log = "Internal server error";//log message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));
                            return;
                        }
                    }else{
                       Notifications.create(requestBody.user_id,10,0,function(notified){//notify user
                            if(notified){//if user is notified give response 
                                response.data = {};//initilize client response array
                                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                response.data.log = "Invite accepted";//log message for client
                                response.data.success = 1;//success variable for client
                                response.end(JSON.stringify(response.data));
                                return;
                            }else{//if user is not notified still give user positive response
                                response.data = {};//initilize client response array
                                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                response.data.log = "Invite accepted";//log message for client
                                response.data.success = 1;//success variable for client
                                response.end(JSON.stringify(response.data));
                                return;                                
                            }
                       });  
                    }
                })
            }else{
                response.data = {};//initilize client response array
                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                response.data.log = "User Unauthorized";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
                return;            
            }
        }
    });
}

exports.fetch_user_capsules = function(user_id,page_length,page_num,response){
    var pipeline = [{
        $match: {user_id: user_id}
    },
    {
        $group: {_id: '$capsule_id'}
    },
    {
        $lookup: {
            from: "capsules",
            localField: '_id',
            foreignField: 'id',
            as: 'capsule_details'
        }
    },
    {
        $lookup:{
            from: "capsulemembers",
            localField:"_id",
            foreignField: "capsule_id",
            as: 'members'
        }
    },
    {
        $project:{
            _id: 1,
            capsule_details: {
                id: 1,
                name: 1,
                description: 1,
                expires_at: 1,
                locked: 1,
                updated_at: 1,
                created_at: 1
            },
            members_num: {$size:"$members"}
        }
    },
    {
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)
    },
    {
        $limit: parseInt(page_length)                
    }];
    
    CapsuleMembers.aggregate(pipeline,function(error,data){
        if(error){
            console.log(error);
            if(response!=null){
                response.data = {};
                response.writeHead(500,{'Content-Type':'application/json'});
                response.data.log = "Internal server error";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }
        }else{
            if(data){
                response.data = {};
                response.writeHead(201,{'Content-Type':'application/json'});
                response.data.log = "Successfully fetched capsules";
                response.data.data = data;
                response.data.success = 1;
                response.end(JSON.stringify(response.data));
            }else{
                response.data = {};
                response.writeHead(200,{'Content-Type':'application/json'});
                response.data.log = "No Capsules";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }
        }
    });    
}

exports.fetch_capsule_participants = function(user_id,capsule_id,page_length,page_num,response){

    var pipeline = [{
            $match: {$and: [{capsule_id:capsule_id},{status:true}]}
        },      
        {
            $lookup:{
                from: "users",
                localField : 'user_id',
                foreignField: 'id',
                as: 'user_data'
            }        
        },
        {
            $project:{
                id: 1,
                user_data: {
                    id: 1,
                    username: 1,
                    dp: 1
                }
            }
        },
        {
            $skip: (parseInt(page_num) - 1) * parseInt(page_length)
        },
        {
            $limit: parseInt(page_length)                
    }];
    
    CapsuleMembers.aggregate(pipeline,function(error,data){
        
        console.log(error);
        console.log(data);
        if(error){
            console.log(error);
            
            if(response!=null){
                response.data = {};
                response.writeHead(500,{'Content-Type':'application/json'});
                response.data.log = "Internal server error";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }
        }else{
            if(data && Object.keys(data).length!=0){
                var i = 0;
                data.forEach(function(element){//async for loop
                    //return pins uploaded each
                    Pins.PinsModel.count({$and: [{user_id: element.user_data.id},{capsule_id:capsule_id}]},function(error,data){
                            
                        if(data){
                            element.user_data.pins_uploaded = data;
                        }else{
                            element.user_data.pins_uploaded = "N/A";
                        }
                        
                        if(i = data.length-1){
                            response.data = {};
                            response.writeHead(201,{'Content-Type':'application/json'});
                            response.data.log = "Successfully fetched participants";
                            response.data.data = data;
                            response.data.success = 1;
                            response.end(JSON.stringify(response.data));
                        }
                        
                        i++;
                    });//this might cause errors if async
                    
                });
            }else{
                response.data = {};
                response.writeHead(200,{'Content-Type':'application/json'});
                response.data.log = "No Participants";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }
        }
    });      
}


/**NOT NEEDED exports.fetch_capsule_invites = function(user_id,capsule_id,page_length,page_num,response){
    
    var pipeline = [{
    
    }];
    
    CapsuleMembers.aggregate(pipeline,function(error,data){
        if(error){
            console.log(error);
            
            if(response!=null){
                response.data = {};
                response.writeHead(500,{'Content-Type':'application/json'});
                response.data.log = "Internal server error";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }else{
                if(data){
                    response.data = {};
                    response.writeHead(201,{'Content-Type':'application/json'});
                    response.data.log = "Successfully fetched capsules";
                    response.data.data = data;
                    response.data.success = 1;
                    response.end(JSON.stringify(response.data));
                }else{
                    response.data = {};
                    response.writeHead(200,{'Content-Type':'application/json'});
                    response.data.log = "No Capsules";
                    response.data.success = 0;
                    response.end(JSON.stringify(response.data));
                }
            }
        }
    });  
} NOT NEEDED**/

exports.update = function(requestBody,response){
    //fetch data instance
    Capsule.findOne({id:requestBody.capsule_id},function(error,data){
        if(error){//if error
            console.log(error);//log error
            if(response!=null){//check for error 500
                response.data = {};//set client response array
                response.writeHead(500,{'Content-Type':'application/json'});//set server response type to json
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send response to client
                return;
            }
        }else{
            if(data){
                //reset data entries
                data.name = requestBody.name;//reset name
                data.description = requestBody.description;//reset description
                data.expires_at = requestBody.expires_at;//reset expiry
                data.updated_at = Date.now();//reset updated timestamp
                
                data.save(function(error){//update
                    if(error){//check for error
                        console.log(error);//log error
                        if(response!=null){//check for error 500
                            response.data = {};//set client response array
                            response.writeHead(500,{'Content-Type':'application/json'});//set server response type to json
                            response.data.log = "Internal server error";//log message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));//send response to client
                            return;
                        }
                    }else{
                        response.data = {};//set client response array
                        response.writeHead(200,{'Content-Type':'application/json'});//set server response type to json
                        response.data.log = "Capsule Updated";//log message for client
                        response.data.success = 1;//success variable for client
                        response.end(JSON.stringify(response.data));//send response to client  
                        return;
                    }
                });
            }else{
                response.data = {};//set client response array
                response.writeHead(201,{'Content-Type':'application/json'});//set server response type to json
                response.data.log = "Capsule non-existent";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send response to client
                return;
            }
        }
    });
}

exports.validate_admin = function(user_id,capsule_id,callback){//validate user admin status
    CapsuleMembers.findOne({$and: [{capsule_id: capsule_id},{user_id: user_id},{role: 'admin'}]},function(error,data){
        var status = false;
        
        if(error){
            status = false;
        }else{
            if(data){
                status = true;
            }else{
                status = false;
            }
        }
        
        callback(status);
    });
}

exports.delete_one = function(requestBody,response){
    CapsuleMembers.findOne({$and: [{capsule_id: requestBody.capsule_id},{user_id: requestBody.user_id},{role: 'admin'}]},function(error,data){ //check if user is the admin
        if(error){//catch error
            console.log(error);
            if(response!=null){//check for error 500
                response.data = {};//set response array
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
            }
            return;            
        }else{
            if(data){
                Capsule.remove({id: requestBody.capule_id},function(error){//delete capsule data
                    if(error){
                        if(response!=null){//check for error 500
                            response.data = {};//set response array
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                            response.data.log = "Internal Server Error";//log error for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));//send json response to client             
                        }
                        return;                     
                    }else{
                        CapsuleMembers.remove({capsule_id: requestBody.capsule_id},function(error){//delete membership data
                            if(error){
                                if(response!=null){//check for error 500
                                    response.data = {};//set response array
                                    response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                                    response.data.log = "Internal Server Error";//log error for client
                                    response.data.success = 0;//success variable for client
                                    response.end(JSON.stringify(response.data));//send json response to client             
                                }
                                return;                             
                            }else{
                                response.data = {};//set response array
                                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                                response.data.log = "Capsule Deleted";//log error for client
                                response.data.success = 1;//success variable for client
                                response.end(JSON.stringify(response.data));//send json response to client                             
                                return;
                            }
                        });
                    }
                });
            }else{
                response.data = {};//set response array
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "User Unauthorized!";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
                return;
            }
        }
    });
}

exports.delete_one_member = function(requestBody,response){
    CapsuleMembers.findOne({and: [{id: requestBody.member_id},{capsule_id: requestBody.capsule_id},{user_id: requestBody.user_id}]},function(error,data){
        if(error){
            console.log("timecapsule.js:134: "+error);//log error
            if(response!=null){//log error 500
                response.data = {};//initilize client response array
                response.writeHead(500,{'Content-Type':'application/json'});//set response type
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
                return;
            }        
        }else{
            if(data){
                data.remove(function(error){
                    if(error){
                        console.log("timecapsule.js:147: "+error);//log error
                        if(response!=null){//log error 500
                            response.data = {};//initilize client response array
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type
                            response.data.log = "Internal server error";//log message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));
                            return;
                        }
                    }else{
                        response.data = {};//initilize client response array
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                        response.data.log = "Membership Deleted";//log message for client
                        response.data.success = 1;//success variable for client
                        response.end(JSON.stringify(response.data)); 
                        return;
                    }
                });
            }else{
                response.data = {};//initilize client response array
                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                response.data.log = "User Unauthorized";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));   
                return;
            }
        }
    });
}

exports.fetch_capsule = function(user_id,capsule_id,response){
    var pipeline = [{
        $match: {id: capsule_id}
    },
    {
        $lookup: {
            from: "capsulemembers",
            localField: 'id',
            foreignField: 'capsule_id',
            as: 'capsule_details'
        }
    },
    {
        $project: {
            id: 1,
            name: 1,
            description: 1,
            updated_at: 1,
            created_at: 1,
            expires_at: 1,
            locked: 1,
            members_num: {$size: "$capsule_details"}
        }
    }];
    
    Capsule.aggregate(pipeline,function(error,data){
        if(error){//if error 
            console.log(error);//log error
            if(response!=null){//check for error 500
                response.data = {};//initialize client response array
                response.writeHead(500,{'Content-Type':'application/json'});//set response type
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
                return;
            }
        }else{
            if(data && Object.keys(data).length !=0){
                response.data = {};//initialize client response array
                response.writeHead(201,{'Content-Type':'application/json'});//set server response type
                response.data.log = "Data Fetched";
                response.data.data = data;
                response.data.success = 1;
                response.end(JSON.stringify(response.data));
                return;                 
            }else{
                response.data = {};//initialize client response array
                response.writeHead(200,{'Content-Type':'application/json'});//set server response type to json
                response.data.log = "No Data";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }
        }        
    });
}

exports.lock_capsule = function(requestBody,response){
    
    CapsuleMembers.findOne({$and: [{capsule_id:requestBody.capsule_id},{user_id:requestBody.user_id},{role: 'admin'}]},function(error,data){
        if(error){
            console.log(error);//log error
            if(response!=null){//check for error 500
                response.data = {};//initialize client response array
                response.writeHead(500,{'Content-Type':'application/json'});//set response type
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
                return;
            }        
        }else{
            if(data){
                Capsule.findOne({id: requestBody.capsule_id},function(error,data){
                    if(error){
                        console.log(error);//log error
                        if(response!=null){//check for error 500
                            response.data = {};//initialize client response array
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type
                            response.data.log = "Internal server error";//log message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));
                            return;
                        }                        
                    }else{
                        if(data){
                            data.locked = true;
                            data.updated_at = Date.now();
                            
                            data.save(function(error){
                                if(error){
                                    if(response!=null){
                                        response.data = {};//initialize client response array
                                        response.writeHead(500,{'Content-Type':'application/json'});//set response type
                                        response.data.log = "Internal server error";//log message for client
                                        response.data.success = 0;//success variable for client
                                        response.end(JSON.stringify(response.data));
                                        return;        
                                    }
                                }else{
                                    response.data = {};//initialize client response array
                                    response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                    response.data.log = "Capsule Locked";//log message for client
                                    response.data.success = 1;//success variable for client
                                    response.end(JSON.stringify(response.data));
                                    return;                                
                                }
                            });                
                            
                        }else{
                            response.data = {};//initialize client response array
                            response.writeHead(200,{'Content-Type':'application/json'});//set response type
                            response.data.log = "Capsule cannot be verified";//log message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));
                            return;                        
                        }
                    }
                });
            }else{
                response.data = {};//initialize client response array
                response.writeHead(200,{'Content-Type':'application/json'});//set response type
                response.data.log = "User Unauthorized";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
                return;            
            }
        }
    });

}

function toCapsule(id,data){
    return new Capsule({
        id : id,
        name : data.name,
        description : data.description,
        expires_at : data.expires_at 
    });
}

function toCapsuleMember(user_id,capsule_id,role,status){//create data instance before insertion
    return new CapsuleMembers({
        user_id: user_id,
        capsule_id: capsule_id,
        role : role,
        status : status
    });
}