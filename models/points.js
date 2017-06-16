var mongoose = require('mongoose'),
    shortid  = require('shortid'),
    Notifications = require('./notifications');

var pointsSchema = new mongoose.Schema({
    id : {type: String, unique: true, 'default' : shortid.generate},
    user_id : String,//user_id 
    points : Number,
    type_id : String,
    status: {type: Boolean, 'default': false},//seen or unseen
    created_at: {type: Date, 'default': Date.now}
});

var Points = mongoose.model('Points',pointsSchema);//create model

var exports = module.exports;

exports.create = function(user_id,points,type_id,callback){//create point
    
    //create data instance
    var points = toPoints(user_id,points,type_id);
    points.save(function(error){//save instance
        if(error){//catch error
            console.log(error);//log error    
            callback(false);//callback returns false       
        }else{
            Notifications.create(user_id,type_id,points,function(notified){//create notification
                if(notified){//if notification is stored successfully
                    callback(true);//callback points creation was successful
                }else{//if notification was not successfully stored
                    callback(true);//callback points creation was still successful
                }
            });
        }
    });
}

function toPoints(user_id,points,type_id){//function for creating data instance
    return new Points({
        user_id: user_id,
        points: points,
        type_id: type_id
    });
}