//imports
require("dotenv").config(); //get env values
const TelegramBot = require("node-telegram-bot-api"); //manage telegram bot
const net = require("net"); //run tcp socket
const WebSocket = require("ws"); //run websocket
const express =require('express'); //run webserver
const bodyParser = require("body-parser"); //get json data from express webpage
const mongoose = require("mongoose"); //mongodb database
const session = require('express-session'); //manage session
const nodemailer = require('nodemailer'); //email

//values static
const password = process.env.PASSWORD; //admin verification password
const token = process.env.TOKEN; //telegram bot token
const KEY = process.env.KEY; //encrypt&decrypt key
const TCP_PORT = process.env.TCP_PORT; //tcp socket port
const WS_PORT = process.env.WS_PORT; //websocket port
const HTTP_PORT = process.env.HTTP_PORT; //http express port
const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING; // mongodb connection string
const SECRET= process.env.SECRET; //session encryption secret
const EMAIL = process.env.EMAIL; //mail server email
const MAIL_PASSWORD=process.env.MAIL_PASSWORD; // mail server password

//custom imports
const socketFunctions = require("./Sub/ManageSocket"); //manage tcp/ws sockets
const crypto = require("./Sub/Crypto"); //encode decode TOKEN
const manageTelegram = require("./Sub/ManageTelegramBots"); // manage telegram bots
const routes = require("./Sub/Routes"); //custom routes
const userSchema = require("./Sub/UserSchema");//mongoose user schema
const {Middleware} = require('./Sub/MiddleWare'); //login middle ware

//connect mongoose db
mongoose.connect(MONGO_CONNECTION_STRING,{dbName:'controller'});

//express app setup
const app = express();//init express app
app.use(bodyParser.urlencoded({extended:true}));//body parser enable
app.use(bodyParser.json()); //enable json data transfer 
app.use(express.static('Public')); //use static files

//nodemailer init
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: MAIL_PASSWORD
    }
  });

//manage sessions
//session
app.use(session({
    secret: SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }));

//middleware
app.use(Middleware); //session manage middleware

//routes
app.use('/',routes(userSchema,Middleware,transporter));//setting custom routes






//values dynamic
const admins = {}; //store telegram admins
const devices = {}; //store websocket&tcp socket devices


//inititalize & manage telegram bot
const bot = new TelegramBot(token,{polling:true}); //telegram bot
//manage telegram events
bot.onText(/\/start/,(msg)=>{manageTelegram.manageStart(msg,admins,bot)}); //manage /start
bot.onText(/\/status/,(msg)=>{manageTelegram.connectionStatus(msg,admins,bot)}); //manage /status
bot.onText(/\/stop/,(msg)=>{manageTelegram.stopConnection(msg,admins,bot)}); //manage /stop
bot.onText(/\/ping/,(msg)=>{}); //manage /ping
bot.onText(/\/devices/,(msg)=>{manageTelegram.showDevices(msg,admins,bot,devices)}); //manage /devices
bot.onText(/\/selected/,(msg)=>{manageTelegram.selectedClient(msg,admins,bot)}); //manage /devices
bot.on('message',(msg)=>{manageTelegram.manageMessage(msg,admins,bot,KEY,password,devices)}); //manage all messages


//handle socket message
const handleSocketMessage=(data,socket)=>{
    try{socketFunctions.newSocketConnection(JSON.parse(crypto.Decrypt(data.toString(),KEY)),admins,bot,devices,socket)} //manage new connection
    catch(e){
        socketFunctions.forwardMessage(data,admins,bot,socket,devices); //manage message
    }
}

//websocket
const wss = new WebSocket.Server({port:WS_PORT});
wss.on('listening',()=>{console.log(`Websocket server on port : ${WS_PORT}`)})
wss.on('connection',(socket)=>{
    socket.on('message',(data)=>{handleSocketMessage(data.toString(),socket)})
    socket.on('close',()=>socketFunctions.handleSocketClose(devices,socket,admins,bot))
});

//tcp
const tcpServer = net.createServer(socket=>{
    socket.on('data',(data)=>{handleSocketMessage(data,socket)});
    socket.on('error',()=>{socketFunctions.handleSocketClose(devices,socket,admins,bot)})
    socket.on('end',()=>{socketFunctions.handleSocketClose(devices,socket,admins,bot)})
})
tcpServer.listen(TCP_PORT,()=>{console.log(`tcp server on port : ${TCP_PORT}`)});

//express server
app.listen(HTTP_PORT,()=>{console.log(`http server on port : ${HTTP_PORT}`)})