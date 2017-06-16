var mongoose = require('mongoose');
var countriesSchema = new mongoose.Schema({
    id: {type: Number, index: {unique: true}},
    country: Number,
    continent_id: Number,
});

var Countries = mongoose.model('Countries',countriesSchema);

var exports = module.exports;

exports.create = function(requestBody,response){
    console.log("Creating New Country");
    
    var country = toCountry(requestBody);//create data instance
    
    country.save(function(error){
        if(error){//catch error
            console.log(error);//log error
            return false;//return false
        }else{
            console.log("Country "+requestBody.country+" created");//log error
            return true;//return true
        }    
    });
}

exports.list = function(requestBody,response){
    
    console.log("Listing available categories");
    
    Countries.find({},function(error,data){
        if(error){//if error
            console.log(error);//log error
            if(response!=null){//if error 500 
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//response output for client 
                return;
            }
        }else{
            if(data){
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "Countries Fetched";//log message for client
                response.data.success = 1; //success variable for client
                response.data.data = data; //send data to client
                response.end(JSON.stringify(response.data));// output response to client 
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "No Countries";//log message for client
                response.data.success = 0; //success variable for client
                response.end(JSON.stringify(response.data));// output response to client            
            }            
            return;
        }
    });
}

exports.fetch_one_id = function(requestBody,response){
    var country_id = requestBody.country_id;
    
    Countries.findOne({id:country_id},function(error,data){
        if(error){
            console.log(error);//log error
            if(response!=null){//check error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "Internal server errror";//log error to user
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
            }
            return;
        }else{
            if(!data){//if no data is returned
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "No Such Country";//log error to user
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));                
            }else{
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "Country Fetched";//log message for client
                response.data.success = 1;//success variable for client
                response.data.data = data;//data
                response.end(JSON.stringify(response.data));
            }
            return;
        }
    });
}

exports.fetch_one_name = function(requestBody,response){
    var country = requestBody.country;
    
    Countries.findOne({country:country},function(error,data){
        if(error){
            console.log(error);//log error
            if(response!=null){//check error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "Internal server errror";//log error to user
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
            }
            return;
        }else{
            if(!data){//if no data is returned
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "No Such Country";//log error to user
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));                
            }else{
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "Country Fetched";//log message for client
                response.data.success = 1;//success variable for client
                response.data.data = data;//data
                response.end(JSON.stringify(response.data));
            }
            return;
        }
    });
}

exports.update = function(requestBody,response){
    var country_id = requestBody.country_id;
    
    Countries.findOne({id:country_id},function(error,data){
        if(error){
            console.log(error);//log error
            if(response!=null){//check error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "Internal server errror";//log error to user
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
            }
            return;
        }else{
            if(!data){//if no data is returned
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "No Such Country";//log error to user
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));                
            }else{
                
                data.country = requestBody.country;
                data.continent_id = requestBody.continent_id;
                
                data.save(function(error){
                    
                    if(error){
                        cosole.log(error);
                        response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                        response.data.log = "Update Failed";//log message for client
                        response.data.success = 0;//success variable for client
                        response.end(JSON.stringify(response.data));                   
                    }else{
                        response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                        response.data.log = "Updated";//log message for client
                        response.data.success = 1;//success variable for client
                        response.end(JSON.stringify(response.data));
                    }
                });

            }
            return;
        }
    });
}

exports.delete = function(requestBody,response){
    var country_id = requestBody.country_id;
    
    Countries.findOne({id:country_id},function(error,data){
        if(error){
            console.log(error);//log error
            if(response!=null){//check error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "Internal server errror";//log error to user
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));
            }
            return;
        }else{
            if(!data){//if no data is returned
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "No Such Country";//log error to user
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));                
            }else{
                
                data.remove(function(error){
                    
                    if(error){
                        cosole.log(error);
                        response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                        response.data.log = "Deleting Failed";//log message for client
                        response.data.success = 0;//success variable for client
                        response.end(JSON.stringify(response.data));                   
                    }else{
                        response.writeHead(500,{'Content-Type':'application/json'});//set response type to json encoded string
                        response.data.log = "Deleted";//log message for client
                        response.data.success = 1;//success variable for client
                        response.end(JSON.stringify(response.data));
                    }
                });

            }
            return;
        }
    });
}

function toCountry(data){
    return new Countries({
        country : data.country,
        continent_id : data.continent_id
    });
}