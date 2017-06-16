var mongoose = require('mongoose');
var statesSchema = new mongoose.Schema({
id: {type: integer, index: {unique: true}},
state: String,
country_id : integer
});
