const mongoose = require('mongoose');

const RealStateSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
},
  description: {
    type: String,
    required: true
},
  price: {
    type: Number,
    required: true
},
  income: {
    type: Number,
    required: true
    
},
  });

const RealState = mongoose.model("realState", RealStateSchema)
  
  module.exports = RealState;