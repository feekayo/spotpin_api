var mongoose = require('mongoose'),
    shortid = require('shortid'),
    DisLikes = require('./dislikes'),
    Points = require('./points');

var likesSchema = new mongoose.Schema({
    id: {type: String, unique: true, 'default': shortid.generate},
    pin_id: String,
    user_id: String
}); 

var Likes = mongoose.model('Likes',likesSchema);

var exports = module.exports;


exports.LikesModel = Likes;
exports.create = function(requestBody,response){
    
    var pin_id = requestBody.pin_id;
    console.log("Like Pin where pin_id = "+pin_id);
    response.data = {};
    var like = toLike(requestBody);//create 

    //check if user exists
    Likes.findOne({$and: [{pin_id:pin_id},{user_id:requestBody.user_id}]},function(error,data){
        if(error){
            console.log("line 28: "+error);
            if(response!=null){
                response.writeHead(500,{'Content-Type':'application/json'});//set response type
                response.data.log = "Internal server error";
                response.data.success = 0;
                response.end(JSON.stringify(response.data)); 
                return;
            }
        }else{
            if(data){
                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                response.data.log = "Priorly liked";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;
            }else{
                like.save(function(error){//save instance
                    if(error){//if error
                        console.log("error 47: "+error);
                        if(response!=null){
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type
                            response.data.log = "Internal server error";
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            return;
                        }
                    }else{
                        
                        //delete dislike first
                        DisLikes.delete_callback(requestBody,function(deleted){
                            if(deleted){
                                Points.create(requestBody.pin_user_id,1,3,function(notified){//notify user of points and award points
                                    if(notified){//if user is notified give response 
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.log = "Liked";
                                        response.data.success = 1;
                                        response.end(JSON.stringify(response.data));   
                                        return;
                                    }else{//if user is not notified still give user positive response
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.log = "Liked";
                                        response.data.success = 1;
                                        response.end(JSON.stringify(response.data));   
                                        return;                                    
                                    }
                                });
                            }else{
                                Points.create(requestBody.pin_user_id,1,3,function(notified){//notify user of points and award points
                                    if(notified){//if user is notified give response 
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.log = "Incomplete Like";
                                        response.data.success = 1;
                                        response.end(JSON.stringify(response.data));   
                                        return;
                                    }else{//if user is not notified still give user positive response
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.log = "Incomplete Like";
                                        response.data.success = 1;
                                        response.end(JSON.stringify(response.data));   
                                        return;                                    
                                    }
                                });
                            }
                        });                                    
                    }
                });            
            }
        }
    });
}

exports.fetch_one = function(like_id,response){
    
    //fetch user
    
    Likes.findOne({id:like_id},function(error,data){//fetch data instance
        if(error){//if error
            console.log("error : "+error);
            if(response!=null){
                response.writeHead(500,{'Content-Type':'application/json'});//set response type
                response.data.log = "Internal server error";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }       
        }else{
            if(!data){
                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                response.data.log = "Like doesnt exist";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));            
            }else{//if data exists
                response.writeHead(201,{'Content-Type':'application/json'});//set response type
                response.data.log = "Like Fetched";
                response.data.success = 1;
                
                response.end(JSON.stringify(response.data));           
            }
        
        }
    });

}

exports.fetch_user_likes = function(user_id,page_length,page_num,response){
    /**var pipeline = [{
        $match: {user_id:user_id}
    },{
      $lookup: {
          from: "pins",
          localField: "pin_id",
          foreignField: "id",
          as: "pin_data"
      }  
    },{
        $lookup: {//fetch user data
            from: "users",
            localField: 'user_id',
            foreignField: 'id',
            as: "user_data"
        }
    },{
        $unwind: "$user_data"
    },{
        $lookup: {//fetch likes
            from: "likes",
            localField: "id",
            foreignField: "pin_id",
            as: "likes"
        }
    },{
        $lookup: {//fetch location data
            from: "locations",
            localField: 'location_id',
            foreignField: 'id',
            as: "location_data"
        }
    
    },{
        $lookup: {//lookup dislikes
            from: "dislikes",
            localField: "id",
            foreignField: "pin_id",
            as: "dislikes"
        }              
    },{
        $project:{
            pin_data: 1;
        }
    }];**/
    
    var pipeline = [{}];
    Likes.aggregate(pipeline,function(error,data){
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
            if(data){
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

exports.update = function(like_id,response){

}

exports.delete = function(requestBody,response){
    response.data = {};//set server response to array
    
    Likes.findOne({$and: [{id: requestBody.like_id},{user_id: requestBody.user_id}]},function(error,data){
        if(error){//catch error
            console.log(error);//log error
            if(response!=null){//catch error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type
                response.data.log = "Internal server error";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;
            }        
        }else{//if no error
            if(data){//if data exists
                data.remove(function(error){//remove data set found
                    
                    if(error){//if error
                        console.log("error in unliking: "+error);//log error    
                        if(response!=null){//catch error 500
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type
                            response.data.log = "Internal server error";
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            return;
                        } 
                    }else{
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                        response.data.log = "Unliked";
                        response.data.success = 1;
                        response.end(JSON.stringify(response.data));        
                        return;
                    }
                });
            }else{
                response.writeHead(500,{'Content-Type':'application/json'});//set response type
                response.data.log = "User Unauthorized";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;
            }
        
        }
    });
}


exports.delete_callback = function(requestBody,callback){
    
    Likes.findOne({$and: [{id: requestBody.like_id},{user_id: requestBody.user_id}]},function(error,data){
        if(error){//catch error
            console.log(error);//log error
            callback(false);       
        }else{//if no error
            if(data){//if data exists
                data.remove(function(error){//remove data set found
                    if(error){//if error
                        console.log("error in unliking: "+error);//log error    
                        callback(false);
                    }else{
                        callback(true);
                    }
                });
            }else{
                callback(true);
            }
        
        }
    });    
}


function toLike(data){//function to parse request body in update and delete queries into a mongodb collection
    return new Likes({
        pin_id : data.pin_id,
        user_id : data.user_id
    });
}