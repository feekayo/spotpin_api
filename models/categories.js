var mongoose = require('mongoose');
var categorySchema = new mongoose.Schema({
    id: {type: integer, index: {unique: true}},
    category: String
});

var Category = mongoose.model('RecordingType',categorySchema);

var exports = module.exports;

exports.create = function(requestBody,response){
    console.log("Creating new category");//log message
    
    var category = toCategory(requestBody);//create category instance
    
    category.save(function(error){//save 
        if(error){//catch error
            console.log(error);//log error
            return false;//return false
        }else{
            console.log("Category "+requestBody.category+" created");//log error
            return true;//return true
        }
    });
}

exports.list = function(response){
    
    console.log("Listing available categories");
    
    Category.find({},function(error,data){
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
                response.data.log = "Categories Fetched";//log message for client
                response.data.success = 1; //success variable for client
                response.data.data = data; //send data to client
                response.end(JSON.stringify(response.data));// output response to client 
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json encoded string
                response.data.log = "No Categories";//log message for client
                response.data.success = 0; //success variable for client
                response.end(JSON.stringify(response.data));// output response to client            
            }
            
            return;
        }
    });
}

exports.rename = function(requestBody,response){
    console.log("Rename category where id = "+requestBody.category_id);
    
    Category.findOne({id:requestBody.category_id},function(error,data){
        if(error){//check internal server error
            console.log("error: "+error);
            if(response!=null){//catch error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }            
        }else{
            if(!data){//check if data doesnt exist
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Category doesnt exist";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }else{
                data.category = requestBody.category;
                
                data.save(function(error){//save data
                    if(!error){
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Updated";//log error for client
                        response.data.success = 1;//success variable for client
                        response.end(JSON.stringify(response.data));//send json response to client
                        return;
                    }else{
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Update Failed";//log error for client
                        response.data.success = 0;//success variable for client
                        response.end(JSON.stringify(response.data));//send json response to client                    
                        return;
                    }
                });
            }
        }        
    });
    
}

exports.delete = function(requestBody,response){
    Category.findOne({id:requestBody.category_id},function(error,data){
        if(error){//check internal server error
            console.log("error: "+error);
            if(response!=null){//catch error 500
                response.writeHead(500,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Internal Server Error";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }            
        }else{
            if(!data){//check if data doesnt exist
                response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                response.data.log = "Category doesnt exist";//log error for client
                response.data.success = 0;//success variable for client
                response.end(JSON.stringify(response.data));//send json response to client
                return;
            }else{
                data.remove(function(error){//delete data
                    if(!error){
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Deleted";//log error for client
                        response.data.success = 1;//success variable for client
                        response.end(JSON.stringify(response.data));//send json response to client
                        return;
                    }else{
                        response.writeHead(201,{'Content-Type':'application/json'});//set response type to json
                        response.data.log = "Deletion Failed";//log error for client
                        response.data.success = 0;//success variable for client
                        response.end(JSON.stringify(response.data));//send json response to client                    
                        return;
                    }
                });
            }
        }    
    });
}
    

function toCategory(data){
    return new Category({
        category : data.category;
    });
}