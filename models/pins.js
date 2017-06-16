var mongoose = require('mongoose'),
    shortid = require('shortid'),
    //multer = require('multer'),
    Locations = require('./locations'),
    Likes = require('./likes'),
    DisLikes = require('./dislikes'),
    PinPals = require('./pinpals'),
    Points = require('./points'),
    Capsule = require('./timecapsule');
    

var pinsSchema = new mongoose.Schema({
    id: {type: String, unique: true, 'default': shortid.generate},
    aws_details: {
        bucket: String,
        object_key: String
    },
    caption: String,
    category_id:String,
    type_id: Number,
    location_id: String,
    user_id:  String,
    story_id: String,
    textBody: String,
    capsule_id: String,
    private : {type: Number, 'default': 0},
    created_at: {type: Date},
    updated_at: {type: Date,'default': Date.now}
});

var Pins = mongoose.model("Pins",pinsSchema);

var exports = module.exports;

exports.PinsModel = Pins;

exports.create = function(request,response,callbackFn){
    response.data = {};//define client response array

    var longitude = request.body.longitude,
        latitude = request.body.latitude,
        town = request.body.town,
        country = request.body.country,
        story_id = request.body.story_id;            

        Locations.create(longitude,latitude,town,country,function(location_id){
            if(location_id!=false){
                    //upload pin data
                    var Pin = toPins(location_id,story_id,request.body);

                    Pin.save(function(error){//save pin
                        if(!error){
                            Points.create(request.body.user_id,5,1,function(notified){//notify user of points and award points
                                if(notified){//if user is notified
                                    callbackFn(true);//return true 
                                }else{//if notification fails
                                    callbackFn(true)//return true anyways
                                }
                            });
                        }else{
                            callbackFn(false);
                        }
                    }); 
            }else{
                callbackFn(false);//return false    
            }
        });    
}

exports.validate = function(pin_id,callback){
    
    var status = false; //set flag as false
    
    Pins.findOne({id:pin_id},function(error,data){
        if(error){
            if(error!=null){
                status = false;
                callback(status);
            }
        }else{
            if(!data){
                status = false;
                callback(status);
            }else{
                status = true;
                callback(status);
            }
        }
        console.log(status);
        
    });
}

exports.fetch_one = function(requestBody,response){
    var pin_id = requestBody.pin_id;
    response.data = {};//define client response array
    Pins.findOne({id:pin_id},function(error,data){
        if(error){//check for error
            console.log(error);
            if(error!=null){//check for error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
            }
            return;
        }else{
            if(data){
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Pin Fetched";//log error for client
                response.data.success = 1;//success variable for client
                response.data.data = data;//data
                response.end(JSON.stringify(response.data));//send json response to client                  
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "No Data";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client                                
            }
            
            return;
        }
    });
}

exports.find_story_pins = function(requestBody,response){//use pagination asap and time filters
    var story_id = requestBody.story_id;
    response.data = {};//define client response array
    Pins.findOne({story_id:story_id},function(error,data){
        if(error){//check for error
            console.log(error);
            if(error!=null){//check for error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
            }
            return;
        }else{
            if(data){
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Pins Fetched";//log error for client
                response.data.success = 1;//success variable for client
                response.data.data = data;//data
                response.end(JSON.stringify(response.data));//send json response to client                  
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "No Data";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client                                
            }
            
            return;
        }
    });
}

exports.fetch_spotpins = function(location_id,user_id,page_length,page_num,response){ //use pagination asap & possible filtering by category and time
    var pipeline = [{
        $match : {location_id:location_id}
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
        $project: {
            id: 1,
            caption: 1,
            category_id: 1,
            type_id: 1,
            location_id: 1,
            user_id: 1,
            story_id: 1,
            capsule_id: 1,
            updated_at: 1,
            created_at: 1,
            private: 1,
            aws_details: 1,
            user_data: {
                username: 1,
                id: 1,
                dp: 1
            },
            location_data: {
                location: 1
            },
            likes: {$size: "$likes"},
            dislikes: {$size: "$dislikes"}
            
        }
    },{
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)
    },{
        $limit: parseInt(page_length)
    }];
    response.data = {};//define client response array
    Pins.aggregate(pipeline,function(error,data){
        if(error){//check for error
            console.log(error);
            if(error!=null){//check for error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
            }
            return;
        }else{
            
            if(data && Object.keys(data).length!=0){            
                
                var i=0; //set up counter
                data.forEach(function(element){//async for loop
                    
                    Capsule.CapsuleModel.findOne({id:element.capsule_id},function(data_fetched,error){//check whether capsule is locked;//move to better place
                        
                        if(data_fetched){
                            if(Date.parse(data_fetched.expires_at)>Date.parse(Date.now())){
                                element.capsule_locked = true;
                            }else{
                                element.capsule_locked = false;
                            }
                        }else{
                            element.capsule_locked = false;
                        }
                        
                        Likes.LikesModel.findOne({$and:[{user_id:user_id},{pin_id:element.id}]},function(error,data_exists){//check user like status
                            if(data_exists){
                                element.liked = true;
                            }else{
                                element.liked = false;
                            }

                            DisLikes.DislikesModel.findOne({$and: [{user_id:user_id},{pin_id:element.id}]},function(error,data_exists){//check if user dislike exists
                                if(data_exists){
                                    element.disliked = true;
                                }else{
                                    element.disliked = false;
                                }

                                if(element.private==1 && element.user_id != user_id){//if data is locked by user and session user isnt owner 
                                    element.locked = true;//lock pin
                                    element.file_address = null;//nullify file address
                                    i++;//increment counter
                                }else if(element.private==2 && element.user_id!=user_id){//if data is locked to user & pinpals and session user isnt owner
                                    PinPals.PinPalsModel.findOne({$and: [{$or: [{$and: [{initator_id : requestBody.user_id},{pal_id : requestBody.pal_id}]}
                                ,{$and: [{initator_id : requestBody.pal_id},{pal_id : requestBody.user_id}]}]},{status: true}]},function(error,data_exists){//check pinpal status

                                        if(data_exists){//if user is friend of session user
                                            element.locked = false;//file is not locked
                                        }else{//if user isnt permitted
                                            element.locked = true; //lock pin
                                            element.file_address = null;//hide file
                                        }

                                        //terminate if at the end of loop
                                        if(i==data.length-1){
                                            response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                                            response.data.log = "Pins Fetched";//log error for client
                                            response.data.success = 1;//success variable for client
                                            response.data.data = data;//data
                                            response.end(JSON.stringify(response.data));//send json response to client
                                            return;
                                        }

                                        i++;//increment counter

                                    });
                                }else{
                                    element.locked = false;//pin not locked
                                    //terminate if at the end of loop
                                    if(i==data.length-1){
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                                        response.data.log = "Pins Fetched";//log error for client
                                        response.data.success = 1;//success variable for client
                                        response.data.data = data;//data
                                        response.end(JSON.stringify(response.data));//send json response to client
                                        return;
                                    }

                                    i++;//increment counter

                                }
                            });
                        });
                    
                    });
             
                })
                
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "No Data";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client   
                return;
            }
        }
    });
}

exports.fetch_capsule_pins = function(capsule_id,user_id,page_length,page_num,response){ //use pagination asap & possible filtering by category and time
    var pipeline = [{
        $match : {capsule_id:capsule_id}
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
        $project: {
            id: 1,
            caption: 1,
            category_id: 1,
            type_id: 1,
            location_id: 1,
            user_id: 1,
            story_id: 1,
            capsule_id: 1,
            updated_at: 1,
            created_at: 1,
            private: 1,
            aws_details: 1,
            user_data: {
                username: 1,
                id: 1,
                dp: 1
            },
            location_data: {
                location: 1
            },
            likes: {$size: "$likes"},
            dislikes: {$size: "$dislikes"}
            
        }
    },{
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)
    },{
        $limit: parseInt(page_length)
    }];

    response.data = {};//define client response array
    Pins.aggregate(pipeline,function(error,data){
        if(error){//check for error
            console.log(error);
            if(error!=null){//check for error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
            }
            return;
        }else{
            
            if(data && Object.keys(data).length!=0){            
                
                var i=0; //set up counter
                data.forEach(function(element){//async for loop
                    
                    Capsule.CapsuleModel.findOne({id:element.capsule_id},function(data_fetched,error){//check whether capsule is locked;//move to better place
                        
                        if(data_fetched){
                            if(Date.parse(data_fetched.expires_at)>Date.parse(Date.now())){
                                element.capsule_locked = true;
                            }else{
                                element.capsule_locked = false;
                            }
                        }else{
                            element.capsule_locked = false;
                        }
                        
                        Likes.LikesModel.findOne({$and:[{user_id:user_id},{pin_id:element.id}]},function(error,data_exists){//check user like status
                            if(data_exists){
                                element.liked = true;
                            }else{
                                element.liked = false;
                            }

                            DisLikes.DislikesModel.findOne({$and: [{user_id:user_id},{pin_id:element.id}]},function(error,data_exists){//check if user dislike exists
                                if(data_exists){
                                    element.disliked = true;
                                }else{
                                    element.disliked = false;
                                }

                                if(element.private==1 && element.user_id != user_id){//if data is locked by user and session user isnt owner 
                                    element.locked = true;//lock pin
                                    element.file_address = null;//nullify file address
                                    i++;//increment counter
                                }else if(element.private==2 && element.user_id!=user_id){//if data is locked to user & pinpals and session user isnt owner
                                    PinPals.PinPalsModel.findOne({$and: [{$or: [{$and: [{initator_id : requestBody.user_id},{pal_id : requestBody.pal_id}]}
                                ,{$and: [{initator_id : requestBody.pal_id},{pal_id : requestBody.user_id}]}]},{status: true}]},function(error,data_exists){//check pinpal status

                                        if(data_exists){//if user is friend of session user
                                            element.locked = false;//file is not locked
                                        }else{//if user isnt permitted
                                            element.locked = true; //lock pin
                                            element.file_address = null;//hide file
                                        }

                                        //terminate if at the end of loop
                                        if(i==data.length-1){
                                            response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                                            response.data.log = "Pins Fetched";//log error for client
                                            response.data.success = 1;//success variable for client
                                            response.data.data = data;//data
                                            response.end(JSON.stringify(response.data));//send json response to client
                                            return;
                                        }

                                        i++;//increment counter

                                    });
                                }else{
                                    element.locked = false;//pin not locked
                                    //terminate if at the end of loop
                                    if(i==data.length-1){
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                                        response.data.log = "Pins Fetched";//log error for client
                                        response.data.success = 1;//success variable for client
                                        response.data.data = data;//data
                                        response.end(JSON.stringify(response.data));//send json response to client
                                        return;
                                    }

                                    i++;//increment counter

                                }
                            });
                        });
                    
                    });
             
                })
                
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "No Data";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client   
                return;
            }
        }
    });
}

exports.fetch_yesterday_pins = function(user_id,page_length,page_num,response){ //use pagination asap & possible filtering by category and time
    
    //set up yesterday morning
    var yesterdayMorning = (function(){this.setDate(this.getDate()-2);return this}).call(new Date);
    
    yesterdayMorning.setHours(24);
    yesterdayMorning.setMinutes(59);
    yesterdayMorning.setSeconds(59,999);
    
    console.log(yesterdayMorning);
    
    //set up yesterday night
    var yesterdayNight = (function(){this.setDate(this.getDate()-1);return this}).call(new Date);
    
    yesterdayNight.setHours(24);
    yesterdayNight.setMinutes(59);
    yesterdayNight.setSeconds(59,999);

    console.log(yesterdayNight);
    
    var pipeline = [{
        $match : {
            created_at:{
                $gt: yesterdayMorning,
                $lt: yesterdayNight
            }
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
        $project: {
            id: 1,
            caption: 1,
            category_id: 1,
            type_id: 1,
            location_id: 1,
            user_id: 1,
            story_id: 1,
            capsule_id: 1,
            updated_at: 1,
            created_at: 1,
            private: 1,
            aws_details: 1,
            user_data: {
                username: 1,
                id: 1,
                dp: 1
            },
            location_data: {
                location: 1,
                town: 1,
                country: 1
            },
            likes: {$size: "$likes"},
            dislikes: {$size: "$dislikes"}
            
        }
    },{
        $sort: {"created_at":1}
    },{
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)
    },{
        $limit: parseInt(page_length)
    }];
    response.data = {};//define client response array
    Pins.aggregate(pipeline,function(error,data){
        if(error){//check for error
            console.log(error);
            if(error!=null){//check for error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
            }
            return;
        }else{
            
            if(data && Object.keys(data).length!=0){            
                
                var i=0; //set up counter
                data.forEach(function(element){//async for loop
                    
                    Capsule.CapsuleModel.findOne({id:element.capsule_id},function(data_fetched,error){//check whether capsule is locked;//move to better place
                        
                        if(data_fetched){
                            if(Date.parse(data_fetched.expires_at)>Date.parse(Date.now())){
                                element.capsule_locked = true;
                            }else{
                                element.capsule_locked = false;
                            }
                        }else{
                            element.capsule_locked = false;
                        }
                        
                        Likes.LikesModel.findOne({$and:[{user_id:user_id},{pin_id:element.id}]},function(error,data_exists){//check user like status
                            if(data_exists){
                                element.liked = true;
                            }else{
                                element.liked = false;
                            }

                            DisLikes.DislikesModel.findOne({$and: [{user_id:user_id},{pin_id:element.id}]},function(error,data_exists){//check if user dislike exists
                                if(data_exists){
                                    element.disliked = true;
                                }else{
                                    element.disliked = false;
                                }

                                if(element.private==1 && element.user_id != user_id){//if data is locked by user and session user isnt owner 
                                    element.locked = true;//lock pin
                                    element.file_address = null;//nullify file address
                                    i++;//increment counter
                                }else if(element.private==2 && element.user_id!=user_id){//if data is locked to user & pinpals and session user isnt owner
                                    PinPals.PinPalsModel.findOne({$and: [{$or: [{$and: [{initator_id : requestBody.user_id},{pal_id : requestBody.pal_id}]}
                                ,{$and: [{initator_id : requestBody.pal_id},{pal_id : requestBody.user_id}]}]},{status: true}]},function(error,data_exists){//check pinpal status

                                        if(data_exists){//if user is friend of session user
                                            element.locked = false;//file is not locked
                                        }else{//if user isnt permitted
                                            element.locked = true; //lock pin
                                            element.file_address = null;//hide file
                                        }

                                        //terminate if at the end of loop
                                        if(i==data.length-1){
                                            response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                                            response.data.log = "Pins Fetched";//log error for client
                                            response.data.success = 1;//success variable for client
                                            response.data.data = data;//data
                                            response.end(JSON.stringify(response.data));//send json response to client
                                            return;
                                        }

                                        i++;//increment counter

                                    });
                                }else{
                                    element.locked = false;//pin not locked
                                    //terminate if at the end of loop
                                    if(i==data.length-1){
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                                        response.data.log = "Pins Fetched";//log error for client
                                        response.data.success = 1;//success variable for client
                                        response.data.data = data;//data
                                        response.end(JSON.stringify(response.data));//send json response to client
                                        return;
                                    }

                                    i++;//increment counter

                                }
                            });
                        });
                    
                    });
             
                })
                
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "No Data";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client   
                return;
            }
        }
    });
}

exports.fetch_user_pins = function(user_id,page_length,page_num,response){ //use pagination asap & possible filtering by category and time
    var pipeline = [{
        $match : {user_id:user_id}
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
        $project: {
            id: 1,
            caption: 1,
            category_id: 1,
            type_id: 1,
            location_id: 1,
            user_id: 1,
            story_id: 1,
            capsule_id: 1,
            updated_at: 1,
            created_at: 1,
            private: 1,
            aws_details: 1,
            user_data: {
                username: 1,
                id: 1,
                dp: 1
            },
            location_data: {
                location: 1
            },
            likes: {$size: "$likes"},
            dislikes: {$size: "$dislikes"}
            
        }
    },{
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)
    },{
        $limit: parseInt(page_length)
    }];
    response.data = {};//define client response array
    Pins.aggregate(pipeline,function(error,data){
        if(error){//check for error
            console.log(error);
            if(error!=null){//check for error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
            }
            return;
        }else{
            
            if(data && Object.keys(data).length!=0){            
                
                var i=0; //set up counter
                data.forEach(function(element){//async for loop
                    
                    Capsule.CapsuleModel.findOne({id:element.capsule_id},function(data_fetched,error){//check whether capsule is locked;//move to better place
                        
                        if(data_fetched){
                            if(Date.parse(data_fetched.expires_at)>Date.parse(Date.now())){
                                element.capsule_locked = true;
                            }else{
                                element.capsule_locked = false;
                            }
                        }else{
                            element.capsule_locked = false;
                        }
                        
                        Likes.LikesModel.findOne({$and:[{user_id:user_id},{pin_id:element.id}]},function(error,data_exists){//check user like status
                            if(data_exists){
                                element.liked = true;
                            }else{
                                element.liked = false;
                            }

                            DisLikes.DislikesModel.findOne({$and: [{user_id:user_id},{pin_id:element.id}]},function(error,data_exists){//check if user dislike exists
                                if(data_exists){
                                    element.disliked = true;
                                }else{
                                    element.disliked = false;
                                }

                                if(element.private==1 && element.user_id != user_id){//if data is locked by user and session user isnt owner 
                                    element.locked = true;//lock pin
                                    element.file_address = null;//nullify file address
                                    i++;//increment counter
                                }else if(element.private==2 && element.user_id!=user_id){//if data is locked to user & pinpals and session user isnt owner
                                    PinPals.PinPalsModel.findOne({$and: [{$or: [{$and: [{initator_id : requestBody.user_id},{pal_id : requestBody.pal_id}]}
                                ,{$and: [{initator_id : requestBody.pal_id},{pal_id : requestBody.user_id}]}]},{status: true}]},function(error,data_exists){//check pinpal status

                                        if(data_exists){//if user is friend of session user
                                            element.locked = false;//file is not locked
                                        }else{//if user isnt permitted
                                            element.locked = true; //lock pin
                                            element.file_address = null;//hide file
                                        }

                                        //terminate if at the end of loop
                                        if(i==data.length-1){
                                            response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                                            response.data.log = "Pins Fetched";//log error for client
                                            response.data.success = 1;//success variable for client
                                            response.data.data = data;//data
                                            response.end(JSON.stringify(response.data));//send json response to client
                                            return;
                                        }

                                        i++;//increment counter

                                    });
                                }else{
                                    element.locked = false;//pin not locked
                                    //terminate if at the end of loop
                                    if(i==data.length-1){
                                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                                        response.data.log = "Pins Fetched";//log error for client
                                        response.data.success = 1;//success variable for client
                                        response.data.data = data;//data
                                        response.end(JSON.stringify(response.data));//send json response to client
                                        return;
                                    }

                                    i++;//increment counter

                                }
                            });
                        });
                    
                    });
             
                })
                
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "No Data";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client   
                return;
            }
        }
    });
}


exports.fetch_category = function(requestBody,response){

}

exports.update = function(requestBody,response){
   var pin_id = requestBody.pin_id
    response.data = {};//define client response array
    Pins.findOne({id:pin_id},function(error,data){
        if(error){//check for error
            console.log(error);
            if(error!=null){//check for error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
            }
            return;
        }else{
            if(data){
                
                //update data
                data.category_id = requestBody.category_id;
                data.caption = requestBody.caption;
                
                data.save(function(error){
                    if(error){
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Update Failed";//log error for client
                        response.data.success = 0;//log error for client
                        response.end(JSON.stringify(response.data));//send json response to client             
                    }else{
                      response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Deleted";//log error for client
                        response.data.success = 1;//log error for client
                        response.end(JSON.stringify(response.data));//send json response to client                      
                    }
                    return;
                });               
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "No Data";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }
        }
    });
}

exports.delete_one = function(requestBody,response){
    var pin_id = requestBody.pin_id;
    var user_id = requestBody.user_id;
    response.data = {};
    Pins.findOne({$and: [{id:pin_id},{user_id:user_id}]},function(error,data){
        if(error){//check for error
            console.log(error);
            if(error!=null){//check for error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client             
            }
            return;
        }else{
            if(data){
                
                data.remove(function(error){
                    if(error){
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Error in Deleting";//log error for client
                        response.data.success = 0;//log error for client
                        response.end(JSON.stringify(response.data));//send json response to client             
                    }else{
                      response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Deleted";//log error for client
                        response.data.success = 1;//log error for client
                        response.end(JSON.stringify(response.data));//send json response to client                      
                    }
                    return;
                });               
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "User Unauthorized!";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }
        }
    });
}

exports.delete_story_pins = function(requestBody,response){
    response.data = {};//create data response array
    Pins.find({story_id:requestBody.story_id},function(error,data){
        if(error){//check for error
            console.log("Error Finding story pins for delete : "+error);
            if(response!=null){//catch error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json array
                response.data.log = "Internal server error";//log message for client
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;
            }
        }else{
            if(data){//if data was returned
                data.remove(function(error){//delete all pins found
                    if(error){
                        if(response!=null){//catch error 500
                            response.writeHead(500,{'Content-Type':'application/json'});//set response type to json array
                            response.data.log = "Pins dont exist";//log message for client
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            return;                         
                        }
                    }else{
                        response.writeHead(500,{'Content-Type':'application/json'});//set response type to json array
                        response.data.log = "Story and Pins deleted";//log message for client
                        response.data.success = 1;
                        response.end(JSON.stringify(response.data));
                        return;   
                    }
                });
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json array
                response.data.log = "Pins dont exist";//log message for client
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
                return;                
            }
        }                          
    });
} 

function toPins(location_id,story_id,data){
    return new Pins({
        aws_details: {
            bucket: data.aws_bucket,
            object_key: data.aws_object_key
        },
        caption : data.caption,
        category_id : data.category_id,
        type_id : data.type_id,
        location_id : location_id,
        user_id : data.user_id,
        story_id : story_id,
        capsule_id : data.capsule_id,
        privacy : data.privacy,
        created_at: data.captured_at,
        textBody: data.textBody
    });
}
