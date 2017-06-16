var mongoose = require('mongoose');
var continentsSchema = new mongoose.Schema({
    id: {type: Number, index: {unique: true}},
    continent: {type: String, index: {unique: true}}
});

var Continents = mongoose.model('Continents',continentsSchema);

var exports = module.exports;

exports.create = function(requestBody,response){
    
}

exports.read = function(requestBody,response){

}

exports.update = function(requestBody,response){

}

exports.delete = function(requestBody,response){

}