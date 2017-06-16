var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Capsule = require('./timecapsule');

var WatchListSchema = new mongoose.Schema({
    id: {type: String, Unique: true, 'default':shortid.generate},
    capsule_id: String,
    user_id: String
});


var WatchList = mongoose.model("WatchList",WatchListSchema);

var exports = module.exports;

exports.create = function(requestBody,response){
    WatchList.findOne({$and: [{capsule_id: requestBody.capsule_id},{user_id: requestBody.user_id}]},function(error,data){
        if(error){
            if(response!=null){
                response.data = {};
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json array
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;                  
            }
        }else{
            if(data){
                response.data = {};
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json array
                response.data.log = "Capsule priorly watched";//log message for client
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;              
            }else{  
                
                var Item = toWatchListItem(requestBody);
                Item.save(function(error){
                    if(error){
                        if(response!=null){
                            response.data = {};
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type to json array
                            response.data.log = "Internal server error";//log message for client
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            return;
                        }
                    }else{
                        response.data = {};
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json array
                        response.data.log = "Added to watchlist";//log message for client
                        response.data.success = 1;
                        response.end(JSON.stringify(response.data));
                        return;                      
                    }
                });
            }
        }
    });
}

exports.fetch_user_watchlist = function(user_id,page_length,page_num,response){
    var pipeline = [{
        $match: {user_id: user_id}
    },
    {
        $group: {_id: '$capsule_id'}
    },
    {
        $lookup: {
            from: "capsule",
            localField: '_id',
            foreignField: 'id',
            as: 'capsule_details'
        }
    },
    {
        $lookup: {
            from: "pins",
            localField: "_id",
            foreignField: 'capsule_id',
            as: "capsule_pins"
        }               
    },
    {
        $project: {
            _id: 1,
            capsule_details:{
                name: 1,
                description: 1,
                expires_at: 1,
                created_at: 1,
                updated_at: 1,
                locked: 1,
                pins_num: {
                    $size: "$capsule_pins"
                }
            }
        }
    },
    {
        $skip: (page_num - 1) * page_length
    },
    {
        $limit: page_length                
    }];
    
    WatchList.aggregate(pipeline,function(error,data){
        if(error){
            if(response!=null){
                response.data = {};
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json array
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;                  
            }        
        }else{
            if(data){
                response.data = {};
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json array
                response.data.log = "Success";//log message for client
                response.data.data = data;
                response.data.success = 1;
                response.end(JSON.stringify(response.data));
                return;                  
            }else{
                response.data = {};
                response.writeHead(200,{'Content-Type':'application/json'});//set response type to json array
                response.data.log = "No Data";//log message for client
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;                              
            }
        }
    });
}

exports.remove_watchlist_item = function(requestBody,response){
    WatchList.findOne({$and: [{user_id: requestBody.user_id},{id:requestBody.watch_id}]},function(error,data){
       if(error){
           if(response!=null){
                response.data = {};
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json array
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;                  
           }
       }else{
           if(data){
               data.remove(function(error){
                    if(error){
                       if(response!=null){
                            response.data = {};
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type to json array
                            response.data.log = "Internal server error";//log message for client
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            return;                  
                       }                    
                    }else{
                        response.data = {};
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json array
                        response.data.log = "Item removed";//log message for client
                        response.data.success = 1;
                        response.end(JSON.stringify(response.data));
                        return;                     
                    }
               });
           }else{
               response.data = {};
               response.writeHead(500,{'Content-Type':'application/json'});//set response type to json array
               response.data.log = "Internal server error";//log message for client
               response.data.success = 0;
               response.end(JSON.stringify(response.data));
               return;            
           }
       } 
    });
}

function toWatchListItem(data){
    return new WatchList({
        capsule_id : data.capsule_id,
        user_id : data.user_id
    });
}