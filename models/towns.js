var mongoose = require('mongoose');
var statesSchema = new mongoose.Schema({
id: {type: integer, index: {unique: true}},
town: String,
state_id : integer
});
