var mongoose = require('mongoose'),//declare external dependencies
    shortid = require("shortid");

var notificationsSchema = new mongoose.Schema({//define notifications schema
    id: {type: String,unique: true,'default': shortid.generate},
    user_id: String,
    type_id: String,
    points: Number,
    created_at: {type: Date, 'default': Date.now},
    seen: {type: Boolean, 'default':false}
});

var Notifications = mongoose.model('Notifications',notificationsSchema);//create notifcations model


exports.create = function(user_id,type_id,points,callback){//model for creating notifications
    
    var notification = toNotification(user_id,type_id,parseInt(points));//create data instance
    
    
    notification.save(function(error){//save instance to mongo server
        if(error){//if error occurs in saving 
            console.log(error);//log error
            callback(false);
        }else{
            callback(true);
        }
    });
}

exports.fetch_user_notifications = function(user_id,page_length,page_num,response){
    var pipeline = [{
        $match: {$and: [{user_id: user_id},{seen: {$eq:false}}]}
    },{
        $sort: {created_at: -1}
    },
    {
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)
    },                    
    {
        $limit: parseInt(page_length)
    }];
    
    Notifications.aggregate(pipeline,function(error,data){//fetch aggregated data
        if(error){//if error
            console.log(error);//log error
            if(response!=null){//check for error 500
                response.data = {};//define response data array
                response.writeHead(500,{'Content-Type':'application/json'});//define response type
                response.data.log = "Internal server error";//log response
                response.data.success = 0;//response flag variable
                response.end(JSON.stringify(response.data));//return data
                return;
            }
        }else{//else
            if(data && Object.keys(data).length!=0){//if data was found
                
                /**var query = Notifications.updateMany({$and: [{user_id: user_id},{seen:false}]},{$set: {seen: true}})
                    .sort({created_at: -1})
                    .skip((parseInt(page_num) - 1) * parseInt(page_length))
                    .limit(parseInt(page_length));
                
                query.exec(function(error){
                    if(error){//if error
                        console.log(error);//log error
                    }**/
                    response.data = {};//define data array
                    response.writeHead(201,{'Content-Type':'application/json'});//define response type
                    response.data.log = "Data Fetched";//log response
                    response.data.success = 1;//flag variable for client
                    response.data.data = data;//data array for client
                    response.end(JSON.stringify(response.data));//return data   
                    return;                
                
                //});
            }else{//if data was not found
                response.data = {};//define data array
                response.writeHead(200,{'Content-Type':'application/json'});//define response type 
                response.data.log = "No Data";//log response
                response.data.success = 0;//flag variable for client
                response.end(JSON.stringify(response.data));//return data
                return;
            }
        }
    });
};

function toNotification(user_id,type_id,points){
    return new Notifications({
        user_id: user_id,
        type_id: type_id,
        points: points
    });
}

