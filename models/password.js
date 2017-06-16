var mongoose = require('mongoose'),
    shortid = require('shortid'),
    nodemailer= require('nodemailer'),
    //SparkPost = require('sparkpost'),
    Users = require('./users');
var passwordChangeSchema = new mongoose.Schema({
    id: {type: String, unique: true, 'default': shortid.generate},
    email: String,
    uniqKey: String,
    created_at : {type: Date, 'default': Date.now}
});

var PasswordChange = mongoose.model('PasswordChange',passwordChangeSchema);

var exports = module.exports;

//set up re-usable smtp server

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'fikayormie@gmail.com',
        pass: 'FIkk**164499'
    }
});

//use sparkpost

//var Sparky = new SparkPost();//uses process.env.SPARPOST_API_KEY

exports.create = function(request,response){
    console.log("Change Password initiation phase");
    response.data = {}; //initialize user response data
    Users.check_user_exists(request.body.email,function(user_exists){
        console.log(user_exists);
        if(user_exists){
            var uniqKey = shortid.generate();//set up uniqid
            var passwordChange = toPasswordChange(request.body.email,uniqKey);//create password change instance
            passwordChange.save(function(error){//save password save instance
                if(error){//if error in saving
                    console.log(error);//log error
                    if(response!=null){//catch error 500
                        response.writeHead(500,{'Content-Type':'application/json'});
                        response.data.log = "Internal Server Error";
                        response.data.success = 0;
                        response.end(JSON.stringify(response.data));                        
                    }                       
                }else{
                    //send mail
                    var mailOptions = {//set up mail options
                        from : 'SpotPin Administrator',
                        to : request.body.email,
                        subject : "Change Spotpin password",
                        html : '<a href="'+request.protocol+'://'+request.get('host')+'/user/update/password/"'+uniqKey+'>click me</a> to change password' 
                    }


                    transporter.sendMail(mailOptions,function(error,info){//uncomment codeblock when smtp is working fine
                        if(error){
                            console.log(error);
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                            response.data.log = "Email Sending Failed";
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            console.log(user_key);
                        }else{
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                            response.data.log = "Check Email for Link to Complete Registration";
                            response.data.success = 1;
                            response.end(JSON.stringify(response.data));
                        }
                        return;
                    });
                    
                    /*var transmission = {
                        transmissionBody: {
                            content: {
                                from: 'spotpinAdmin@'+process.env.SPARKPOST_SANDBOX_DOMAIN,
                                subject: 'Change Spotpin Password',
                                html : '<a href="'+request.protocol+'://'+request.get('host')+'/user/update/password/"'+uniqKey+'>click me</a> to change password' 
                            }
                            
                        },
                        recipients: [
                            {
                                address: request.body.email
                            }
                        ]
                    }
                    
                    Sparky.transmissions.send(transmission,function(error,info){
                        if(error){
                            console.log(error);
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                            response.data.log = "Email sending failed";
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            console.log(user_key);                        
                        }else{
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                            response.data.log = "Check email for link to change password";
                            response.data.success = 1;
                            response.end(JSON.stringify(response.data));                        
                        }
                    });*/
                    
                }
            });
        }else{
            response.writeHead(201,{'Content-Type':'application/json'});//set server response format
            response.data.log = "User does not exist on our database";
            response.data.success = 0;
            response.end(JSON.stringify(response.data));//comment out when working
            return;        
        }
    });
}


//fetch user_id with email in requestBody
    /**Users.check_user_exists(requestBody.email,function(user_exists){
        if(user_exists){
            var uniqKey = shortid.generate();//set up uniqid
            var passwordChange = toPasswordChange(requestBody.email,uniqKey);//create password change instance

            passwordChange.save(function(error){//save password change instance
                if(error){
                    if(response!=null){
                        response.writeHead(500,{'Content-Type':'application/json'});
                        response.data.log = "Internal Server Error";
                        response.data.success = 0;
                        response.end(JSON.stringify(response.data));                        
                    }
                }else{

                    //send mail here
                    /**
                    var mailOptions = {//set up mail options
                        from : 'SpotPin Administrator',
                        to : requestBody.email,
                        subject : "Change Spotpin password",
                        html : '<a href="insert_host_route/user/update/password/"'+uniqKey+'>click me</a> to change password' 
                    }


                    var mail = transporter.sendMail(mailOptions,function(error,info){//uncomment codeblock when smtp is working fine
                        if(error){
                            console.log(error);
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                            response.data.log = "Email Sending Failed";
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));
                            console.log(user_key);
                        }else{
                            response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                            response.data.log = "Check Email for Link to Complete Registration";
                            response.data.success = 1;
                            response.end(JSON.stringify(response.data));
                        }
                        return;
                    });
                    **/

                            //comment out when working
       /**                     response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                            response.data.log = "passwordchange is working tho mailing untested";
                            response.data.success = 0;
                            response.end(JSON.stringify(response.data));//comment out when working
                            return;//comment out when smtp is working
                    }
                });
            }else{
                response.writeHead(201,{'Content-Type':'application/json'});//set server response format
                response.data.log = "User does not exist on our database";
                response.data.success = 0;
                response.end(JSON.stringify(response.data));//comment out when working
                return;
            }
    });**/


exports.validate = function(request,response){

}

function generate_key(){//find a better way to implement this
    var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
        uniqid = '';

    for(var i=0; i<31; i+=1){
        uniqid += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    
    return uniqid;
} 

function toPasswordChange(email,uniqKey){//function to create an instance of data
    return new PasswordChange({
        email : email,
        uniqKey : uniqKey
    });
}