var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Notifications = require('./notifications');
    
var leaderboardsSchema = new mongoose.Schema({//define schema
    id : {type: String, unique: true},
    title : String,
    bio : String,
    created_at : {type: Date,'default': Date.now},
    updated_at : {type: Date,'default': Date.now}
});

var LeaderBoards = mongoose.model('LeaderBoards',leaderboardsSchema);//create mongoose model


var leaderboardsMembersSchema = new mongoose.Schema({//define schema
    id : {type: String, unique: true, 'default': shortid.generate},
    user_id : String,
    leaderboard_id : String,
    role : String,
    status : {type: Boolean, 'default': false},
    created_at : {type: Date,'default': Date.now},
    updated_at : {type: Date,'default': Date.now}
});

var LeaderBoardsMembers = mongoose.model('LeaderBoardsMembers',leaderboardsMembersSchema);//create mongoose model

var exports = module.exports;

exports.create = function(requestBody,callback){//create leaderboard function
    
    var shortID = shortid.generate();//generate id for leaderboard
    var leaderboard = toLeaderBoards(shortID,requestBody);//create new leaderboard instance
    var status = false;//flag for success or failure of operation
    
    leaderboard.save(function(error){//save leaderboard instance
        console.log("creating leaderboard..");
        if(error){//if failed to save
            console.log(error);//log error
            status = false;//return false
        }else{
            status = shortID;//return id of saved data
        }
        
        Notifications.create(requestBody.user_id,7,0,function(notified){//notify user
            if(notified){//if user is notified give response 
                callback(status);//return data synchronously with callback function
            }else{//if user is not notified still give user positive response
                callback(status);//return data synchronously with callback function          
            }
        });      
    });
}

exports.memberCreate = function(role,user_id,leaderboard_id,status,callback){
    
    var status = false;//initialize callback flag
    var leaderBoardMember = toLeaderBoardMember(user_id,leaderboard_id,role,status);
    
    LeaderBoardsMembers.findOne({$and: [{user_id:user_id},{leaderboard_id:leaderboard_id}]},function(error,data){
        if(error){
            callback(status);
        }else{   
            if(!data){
                leaderBoardMember.save(function(error){//save leaderboard member
                    if(error){
                        console.log("error saving leaderboard members : "+error);//log error
                        status = false
                    }else{
                        status = true;
                    } 
                    Notifications.create(user_id,8,0,function(notified){//notify user
                        if(notified){//if user is notified give response 
                            callback(status);//return data synchronously with callback function
                        }else{//if user is not notified still give user positive response
                            callback(status);//return data synchronously with callback function          
                        }
                    }); 
                });
            }else{
                callback(false);
            }
        }
    })
}

exports.update_invite = function(requestBody,response){
    LeaderBoardsMembers.findOne({$and: [{user_id:requestBody.user_id},{leaderboard_id:requestBody.leaderboard_id}]},function(error,data){
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
                data.updated_at = Date.now();//update time stamp
                
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
                        Notifications.create(requestBody.user_id,9,0,function(notified){//notify user
                            if(notified){//if user is notified give response 
                                response.data = {};
                                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                response.data.log = "Invite Accepted";
                                response.data.success = 1;
                                response.end(JSON.stringify(response.data));   
                                return;
                            }else{//if user is not notified still give user positive response
                                response.data = {};
                                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                response.data.log = "Invite Accepted";
                                response.data.success = 1;
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

exports.validate_admin = function(user_id,leaderboard_id,callback){//validate user admin status
    LeaderBoardsMembers.findOne({$and: [{leaderboard_id: leaderboard_id},{user_id: user_id},{role: 'admin'}]},function(error,data){
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
    LeaderBoardsMembers.findOne({$and: [{user_id: requestBody.user_id},{leaderboard_id:requestBody.leaderboard_id},{role:'admin'}]},function(error,data){//check if user is admin of leaderbodard
       
        if(error){//check for errors
            console.log("leaderboards.js:65: "+error);//log error
            if(response!=null){//log error 500
                response.data = {};//initilize client response array
                response.writeHead(500,{'Content-Type':'application/json'});//set response type
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
                return;
            }
        }else{
            if(data){//if user is indeed admin
                LeaderBoards.remove({id: requestBody.leaderboard_id},function(error){//remove data set
                    if(error){
                        console.log("leaderboards.js:77: "+error);//log error
                        if(response!=null){//log error 500
                            response.data = {};//initilize client response array
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type
                            response.data.log = "Internal server error";//log message for client
                            response.data.success = 0;//success variable for client
                            response.end(JSON.stringify(response.data));
                            return;
                        }                        
                    }else{
                        LeaderBoardsMembers.remove({leaderboard_id: requestBody.leaderboard_id},function(error){//delete membership data
                            if(error){
                                console.log("leaderboards.js line 88: "+error);//log error
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
                                response.data.log = "LeaderBoard Deleted";//log message for client
                                response.data.success = 1;//success variable for client
                                response.end(JSON.stringify(response.data));  
                                return;
                            }
                        });
                    }
                });
            }else{//if user isnt admin
                response.data = {};//initilize client response array
                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                response.data.log = "User unauthorized!";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));    
                return;
            }
        }
        
    });
}

exports.delete_one_member = function(requestBody,response){
    LeaderBoardsMembers.findOne({and: [{id: requestBody.member_id},{leaderboard_id: requestBody.leaderboard_id},{user_id: requestBody.user_id}]},function(error,data){
        if(error){
            console.log("leaderboards.js:121: "+error);//log error
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
                        console.log("leaderboards.js:133: "+error);//log error
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

exports.update  = function(requestBody,response){
    LeaderBoards.findOne({id:requestBody.leaderboard_id},function(error,data){
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
            if(data){
                data.title = requestBody.title;
                data.bio = requestBody.bio;
                data.updated_at = Date.now();
                
                data.save(function(error){
                    if(error){//check for errors
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
                        response.data = {};//initialize client response array
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                        response.data.log = "Leaderboard Updated";//log message for client
                        response.data.success = 1;//success variable for client
                        response.end(JSON.stringify(response.data));
                        return;
                    }
                });
            }else{
                response.data = {};//initialize client response array
                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                response.data.log = "Capsule non-existent";//log message for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
                return;
            }
        }
    });
}

exports.fetch_user_leaderboards = function(user_id,page_length,page_num,response){
    var pipeline = [{
        $match: {user_id: user_id}
    },
    {
        $lookup: {
            from: "leaderboards",
            localField: 'leaderboard_id',
            foreignField: 'id',
            as: 'leaderboards_details'
        }
    },
    {
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)
    },
    {
        $limit: parseInt(page_length)                
    }];
    
    LeaderBoardsMembers.aggregate(pipeline,function(error,data){
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
                response.data = {};
                response.writeHead(201,{'Content-Type':'application/json'});
                response.data.log = "Successfully fetched leaderboards";
                response.data.data = data;
                response.data.success = 1;
                response.end(JSON.stringify(response.data));
            }else{
                response.data = {};
                response.writeHead(200,{'Content-Type':'application/json'});
                response.data.log = "No Leaderboards";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }
        }
    });
}


exports.fetch_leaderboard_heirachy = function(user_id,leaderboard_id,filter,page_length,page_num){
    
    var Date = Date.now();
    
    if(filter == "week"){
        //get first day of the week morning
        var firstWeekdayMorning = (function(){this.setDate(this.getDate()-this.getDay());return this}).call(new Date);
        
        firstWeekdayMorning.setHours(24);
        firstWeekdayMorning.setMinutes(59);
        firstWeekdayMorning.setSeconds(59,999);
        
        console.log(firstWeekdayMorning);
        console.log(firstWeekdayNight);
        
        var gt = firstWeekdayMorning;
        var lt = Date.now();
        
    }else if(filter == "month"){
        //get first day of the week morning
        var firstMonthMorning = (function(){this.setDate(this.getDate()-this.getDate());return this}).call(new Date);;
        
        firstMonthMorning.setHours(24);
        firstMonthMorning.setMinutes(59);
        firstMonthMorning.setSeconds(59,999);
        
        console.log(firstMonthMorning);
        
        var gt = firstMonthMorning;
        var lt = Date.now();
        
    }else{
        var gt = "";//start of all time
        var lt = Date.now();//current date time
    }
    
    
    var pipeline = [{
        $match: {$and:[{leaderboard_id: leaderboard_id},{status:true},{created_at:{$gt:gt,$lt:lt}}]}
    },{
        $lookup: {
            from: "points",
            localField: "user_id",
            foreignField: "user_id",
            as: "points"
        }
    },{
        $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "id",
            as: "user_data"
        }
    },{
        $project: {
            id: 1,//leaderboardmembership id
            user_id: 1,
            leaderboard_id: 1,
            role: 1,//membership role
            status: 1,
            created_at: 1,
            updated_at: 1,
            points: {$sum: "$points.points"},
            user_data: {
                username: 1,
                dp: 1,
                bio: 1
            }
        }
    },{
        $sort: {"points": -1}
    },{
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)
    },{
        $limit: parseInt(page_length)
    }];
    
    LeaderBoardsMembers.aggregate(pipeline,function(error,data){
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
                response.data = {};
                response.writeHead(201,{'Content-Type':'application/json'});
                response.data.log = "Successfully fetched leaderboard heirachy";
                response.data.data = data;
                response.data.success = 1;
                response.end(JSON.stringify(response.data));
            }else{
                response.data = {};
                response.writeHead(200,{'Content-Type':'application/json'});
                response.data.log = "No Leaderboard";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }
        }
    });
}


exports.fetch_leaderboard = function(user_id,leaderboard_id,response){
    var pipeline = [{
        $match: {id: leaderboard_id}
    },
    {
        $lookup: {
            from: "leaderboardsmembers",
            localField: 'id',
            foreignField: 'location_id',
            as: 'leaderboards_details'
        }
    },
    {
        $project: {
            id: 1,
            title: 1,
            bio: 1,
            updated_at: 1,
            created_at: 1,
            members_num: {$size: "$leaderboards_details"}
        }
    }];
    
    LeaderBoards.aggregate(pipeline,function(error,data){
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
                LeaderBoardsMembers.findOne({$and:[{leaderboard_id:leaderboard_id},{user_id:user_id}]},function(error,dataFetched){

                    if(dataFetched){
                        data.user_data = dataFetched;
                        response.data = {};//initialize client response array
                        response.writeHead(201,{'Content-Type':'application/json'});//set server response type
                        response.data.log = "Data Fetched";
                        response.data.data = data;
                        response.data.success = 1;
                        response.end(JSON.stringify(response.data));
                        return;                               
                    }else{
                        if(error){
                            console.log(error);//if there is an error log it
                        }
                        data.user_data = "N/A";
                        response.data = {};//initialize client response array
                        response.writeHead(201,{'Content-Type':'application/json'});//set server response type
                        response.data.log = "Data Fetched";
                        response.data.data = data;
                        response.data.success = 1;
                        response.end(JSON.stringify(response.data));
                        return;                        
                    }
                
                
                });

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

function toLeaderBoards (id,data){//create data instance before insertion
    return new LeaderBoards({
        id : id,
        title : data.title,
        bio : data.bio
    });
}

function toLeaderBoardMember(user_id,leaderboard_id,role,status){//create data instance before insertion
    return new LeaderBoardsMembers({
        user_id: user_id,
        leaderboard_id: leaderboard_id,
        role : role,
        status : status
    });
}