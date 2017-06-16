var mongoose = require('mongoose');
var platformsSchema = new mongoose.Schema({
id: {type: integer, index: {unique: true}},
platform: String
});