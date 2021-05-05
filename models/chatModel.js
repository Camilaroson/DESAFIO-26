const mongoose = require('mongoose')

const chatCollection = 'mensajes-23'

const chatSchema = new mongoose.Schema({
nombre: {type:String , require:true , max:150},
password: {type:String, require:true},
})

module.exports = mongoose.model(chatCollection , chatSchema)

