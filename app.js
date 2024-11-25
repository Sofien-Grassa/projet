//1. importations
const express = require('express')
const mongoose = require('mongoose')
const cors = require("cors");
const path = require("path");

require('dotenv').config()
//2. initialisations
const server = express()
server.use(cors()); // Active le CORS pour toutes les routes

//Activer JSON dans les requetes
server.use(express.json())

mongoose.connect(process.env.DB)
.then(()=> console.log('Mongodb connected'))
.catch((err)=>console.log(err))
server.use("/uploads", express.static(path.join(__dirname, "./uploads")));

//3.traitements

server.get('/' , (req , res)=>{
    res.send({message : 'Hello'})
})
require('./routes')(server)

//4.lancement du serveur
server.listen(3001)

