console.log("Starting the server...");
var http = require('http');
var express = require('express');
const dotenv = require('dotenv')
const cors = require('cors')
const session = require('express-session')
dotenv.config({ path: './config.env' })
require('./dbConnect')
const tokenModel = require("./schema")
const signUpsc= require('./signupSchema')
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const { Server } = require("socket.io")
const path= require("path");
const io = new Server(server)
//(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     transports: ["websocket", "polling"],
//     credentials: true,

//   allowEIO3: true,
// }});  // server per socket ko chalane ke liye use pass karre.

var bodyParser = require("body-parser");
//middleware
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, keepExtensions: true, uploadDir: "uploads" }));
// parse application/json
app.use(bodyParser.json());
// login

app.use(session({
    secret: 'your_secret_key', // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.get('/chat', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.sendFile(path.join(__dirname, "public", "index.html"));
})
app.get('/login', (req,res) => {
  console.log("root path")
  res.sendFile(path.resolve("signUpandSignIn/index.html"));
})

app.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        req.session.username = username; // Store username in session
        res.redirect('/chat');
    } catch (err) {
        res.status(400).send(err);
    }
});








const { v4: uuidv4 } = require('uuid')//unique id generate karne keliye (for security)
app.post('/session', (req, res) => {
  let data = {
    username: req.body.username,
    userID: uuidv4()
  }
  res.send(data)
})

const postMethods= require("./controller");
app.get('/api/signin',postMethods.signIn).post('/api/signin',postMethods.signIn);
app.get('/api/signup',postMethods.signUp ).post('/api/signup',postMethods.signUp );

// app.get('/login',postMethods.fetchusers ).post('/login',postMethods.fetchusers);


//socket middleware
io.use((socket, next) => {
  const username = socket.handshake.auth.username
  const userID = socket.handshake.auth.userID
  if (!username) {
    return next(new Error('invalid username'))
  }
  socket.username = username
  socket.id = userID
  next()
})
let users = []
 io.on('connection', async (socket) => {
  //socket methods
  const methods={
    getToken:(sender,receiver)=>{
      let key=[sender,receiver].sort().join("_")
      return key;
    },
    fetchMesages: async (sender,receiver)=>{
      let token=methods.getToken(sender,receiver)
     console.log(token)
      const findToken=await tokenModel.findOne
      ({userToken:token})
      console.log(findToken, "findToken")
      if(findToken){
        io.to(sender).emit('stored-messages',
        {messages: findToken.messages})
      }else{
        let data={
          userToken: token,
          messages:[]

        }
        const saveToken=new tokenModel(data) 
        const createToken=await saveToken.save()
        if(createToken)
        {
          console.log('token created in fetchMesages')
        }
        else{
          console.log('error in creatting token')
        }

      }
      
       },
      saveMessages: async (payload)=>{
           //console.log(payload, "payload")
          let token = methods.getToken(payload.from, payload.to);
          //console.log("token", token)
          let data={
          //  username: socket.username,
            from: payload.from,
            message: payload.message,
            time : payload.time
          }
            
              tokenModel.updateOne({userToken: token},
        {
          $push:{messages:data}
        },(err,res)=>{
          if(err) throw err
          console.log('Message saved',res)
        })
                },
                
  
              }
  //get all users
  let userData = {
    username: socket.username,
    userID: socket.id
  }
  //when data enters at that time we need to push into users
  users.push(userData)
  io.emit('users', { users })//through users event it will show in frontend
  socket.on('disconnect', () => {
    users = users.filter(user => user.userID != socket.id)
    io.emit('users', { users })

  })
  socket.on('message-to-server', payload => {
    //console.log(payload)
    io.to(payload.to).emit('message-to-user', payload)
   methods.saveMessages(payload)
  })
  // fetch previous messages
  socket.on('fetch-messages', ({ receiver }) => {
   // console.log(receiver)
    methods.fetchMesages(socket.id, receiver)
  })

})

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
