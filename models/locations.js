var mongoose = require('mongoose'),
    shortid = require('shortid');
var locationsSchema = new mongoose.Schema({
    id: {type: String, unique: true},
    location: {
        type: [Number],
        index: '2dsphere'
    },
    town: String,
    country: String,
    created_at: {type:Date, 'default': Date.now}
});

var Locations = mongoose.model('Locations',locationsSchema);//create model

var exports = module.exports;//define module exports

exports.create = function(longitude,latitude,town,country,callback){
    Locations.findOne({location: [longitude,latitude]},function(error,data){//check if location already exists
        if(error){//if error is fired
            callback(false);//return false
        }else{
            if(data){//if location exists
                callback(data.id);//return location id
            }else{//if location doesnt exist
                var location_id = shortid.generate();//generate location_id
                
                Location = toLocations(location_id,longitude,latitude,town,country);//create new location instance
                Location.save(function(error){//save location instance
                    if(error){//if error in saving
                        callback(false);//return false
                    }else{//else
                        callback(location_id);//return location_id
                    }
                });
            }
        }
    });
}

exports.fetch_nearby = function(longitude,latitude,radius,page_num,page_length,response){
        
    var pipeline = [{
        $geoNear : {
            near:{
                type: "Point",
                coordinates : [parseFloat(longitude),parseFloat(latitude)]
            },
            distanceField: "distance",
            maxDistance: parseInt(radius),
            spherical: true
        },
    },
    {
        $skip: (parseInt(page_num) - 1) * parseInt(page_length)
    },                    
    {
        $limit: parseInt(page_length)
    },
    {
        $sort: {"distance": 1}
    }];
    
    Locations.aggregate(pipeline,function(error,data){
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
                response.data.log = "Successfully fetched spots";
                response.data.data = data;
                response.data.success = 1;
                response.end(JSON.stringify(response.data));
            }else{
                response.data = {};
                response.writeHead(200,{'Content-Type':'application/json'});
                response.data.log = "No Spots within range";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));
            }
        }
    });
}


function toLocations(id,longitude,latitude,town,country){
    return new Locations({
        id : id,
        location: [longitude,latitude],
        town: town,
        country: country
    });
}