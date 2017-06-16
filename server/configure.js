var path = require('path'),
    exphbs = require('express-handlebars'),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    methodOverride = require('method-override'),
    //errorHandler = require('errorHandler'),
    routes = require('./routes');

module.exports = function(app){
    app.use(morgan('dev'));
    /**app.use(bodyParser.urlencoded({'extended:true'}));
    
    app.use(bodyParser({
        uploadDir:path.join(__dirname,'public/upload/temp');   
    }));**/
    //app.use(bodyParser.json());
    //app.use(methodOverride());
    //app.use(cookieParser('09178'));
    app.use(bodyParser.urlencoded({'extended':'true'}));
    app.use(methodOverride());
    //routes(app);
    app.use('/public/',express.static(path.join(__dirname,'../public')));
    
    /**if('development' === app.get('env')){
        app.use(errorHandler());
    }**/
    
    routes(app);
    return app;
};
