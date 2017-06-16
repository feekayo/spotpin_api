var express = require('express'),
    config = require('./server/configure'),
    app = express();
    mongoose = require('mongoose');
    app.set('port',process.env.PORT||3300);
    app.set('views',__dirname+'/views');
    app = config(app);


console.log(__dirname);
mongoose.connect('mongodb://admin:spotpinadmin@ds139288.mlab.com:39288/heroku_9f8083p7');
//mongoose.connect('mongodb://localhost/spotpin');
mongoose.connection.on('open',function(){
   console.log('Mongoose Connected.');
});

/**app.get('/hello',function(request,response){
    response.send("Hello node");
});**/

app.listen(app.get('port'),function(){
    console.log (app.get('port'));
});
