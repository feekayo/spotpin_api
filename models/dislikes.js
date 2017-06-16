var mongoose = require('mongoose'),
    shortid = require('shortid'),
    Favorites = require('./likes'),
    Points = require('./points');

var dislikesSchema = new mongoose.Schema({
    id: {type: String, unique: true, 'default': shortid.generate},
    pin_id: String,
    user_id: String
}); 

var Dislike = mongoose.model('Dislikes',dislikesSchema);


var exports = module.exports;

exports.DislikesModel = Dislike;
exports.create = function(requestBody,response){
    
    var pin_id = requestBody.pin_id;
    console.log("Dislike Pin where pin_id = "+pin_id);
    response.data = {};
    var dislike = toDislike(requestBody);//create 

    //check if user exists
    Dislike.findOne({$and: [{pin_id:pin_id},{user_id:requestBody.user_id}]},function(error,data){
        if(error){
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
                response.data.log = "Priorly Disliked";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;
            }else{
                dislike.save(function(error){//save instance
                    if(error){//if error
                        console.log("error : "+error);
                        if(response!=null){
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type
                            response.data.log = "Internal server error";
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            return;
                        }
                    }else{
                        
                        //delete like first
                        Favorites.delete_callback(requestBody,function(deleted){
                            if(deleted){
                                Points.create(requestBody.pin_user_id,-1,4,function(notified){//notify user of points and award points
                                    if(notified){//if user is notified give response 
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.log = "Disliked";
                                        response.data.success = 1;
                                        response.end(JSON.stringify(response.data));   
                                        return;
                                    }else{//if user is not notified still give user positive response
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.log = "Disiked";
                                        response.data.success = 1;
                                        response.end(JSON.stringify(response.data));   
                                        return;                                    
                                    }
                                });                            
                            }else{
                                Points.create(requestBody.pin_user_id,-1,4,function(notified){//notify user of points and award points
                                    if(notified){//if user is notified give response 
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.log = "Incomplete Dislike";
                                        response.data.success = 1;
                                        response.end(JSON.stringify(response.data));   
                                        return;
                                    }else{//if user is not notified still give user positive response
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type
                                        response.data.log = "Incomplete Disike";
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


exports.delete = function(requestBody,response){
    response.data = {};//set server response to array
    
    Dislike.findOne({$and: [{id: requestBody.dislike_id},{user_id: requestBody.user_id}]},function(error,data){
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
                        response.data.log = "Un-disliked";
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
    
    Dislike.findOne({$and: [{pin_id: requestBody.pin_id},{user_id: requestBody.user_id}]},function(error,data){
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

function toDislike(data){//function to parse request body in update and delete queries into a mongodb collection
    return new Dislike({
        pin_id : data.pin_id,
        user_id : data.user_id
    });
}