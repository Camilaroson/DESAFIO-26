
import express from 'express';
const app = express()
import session from 'express-session';
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// ---------------------------------//

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'))

//------------------------------------//
import {NuevoProducto} from './public/service/producto.service'
const chatModel = require('./models/chatModel')
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

declare module "express-session" {
    interface Session {
      user: string;
    }
  }

  // ----------------PASSPORT MODULOS-------------------- // 

const passport = require('passport');
const bCrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());


// ----------------------INICIACION SESSION--------------------- //

app.use(session({
  store: MongoStore.create({ 
    mongoUrl: 'mongodb://localhost/sesions',
    ttl: 10 * 60, 
}),
    secret:'secreto',
    resave:true,
    saveUninitialized : true,
    cookie: {
      maxAge : 6000
    }
}))

     // ------------------CONFIGURACION DEL LOGIN -----------------------//
  
const validatePassword = (user:any ,  password:any) => {
  return bCrypt.compareSync(password, user.password);
};

  passport.use ('login' , new LocalStrategy({
    passReqToCallback : true
  }, 
  (req:any, nombre:any, password:any , done:any) =>{
    chatModel.findOne({nombre:nombre}, (err:any, user:any) =>{
      if(err) return done (err)
      if (!user){
        console.log( ` Usuario no encontrado ${nombre}`)
        return done (null, false)
      }

      if(!validatePassword(user, password)){
        console.log('Contraseña invalida')
        return done (null, false)
      }
        return done(null, user)
    })
  }
))

// --------------------- CONFIGURACIÓN DE REGISTRO --------------------------// 

passport.use('registro', new LocalStrategy({
  passReqToCallBack:true,
},
(req:any,nombre:any,password:any,done:any) => {
  const findOrCreateUser = function() {
    chatModel.findOne ({'nombre':nombre} , function (err:any,user:any){
      if (err) { 
        console.log ('Error al registrarse');
        return done(err)
      }
      if (user){
        console.log ("El usuario ya existe")
        return done (err)
      } else {
        var newUser = new chatModel();
        newUser.nombre = nombre;
        newUser.password = createHash(password)
        newUser.save((err:any) =>{
          if(err){
            console.log('Error al guardar usuario')
            throw err;
          }
          console.log('Usuario registrado exitosamente')
          return done (null , newUser)
        })
      }
    })
  }
  process.nextTick(findOrCreateUser)
}))

  // ---------------HASHEAR CONTRASEÑA--------------------// 

  let createHash = function (password:any) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

// --------------SERIALIZAR Y DESERIALIZAR --------------//

passport.serializeUser((user:any, done:any) => {
  done(null, user._id);
});

passport.deserializeUser((id:any, done:any) => {
  chatModel.findById(id, function (err:any, user:any) {
    done(err, user);
  });
});


//RUTAS //

app.post('/login',passport.authenticate('login',
{ failureRedirect: 'faillogin' }),(req,res) => {
    res.redirect('/')
});

app.get('/faillogin', (req,res) => {
  res.sendFile(__dirname+'/public/loginerror.html')
});

app.get('/registro',(req,res) => {
  res.sendFile(__dirname+'/public/registro.html')
  })
  
  app.post("/registro",passport.authenticate("registro", { failureRedirect: "/failregister" }),(req, res) => {
    res.redirect("/");
});

app.get("/failregister", (req, res) => {
  res.sendFile(__dirname+'/public/fail.html')
});


const checkIsAuthenticated = (req:any, res:any, next:any) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendFile(__dirname+'/public/login.html')
  }
};

app.get("/login", checkIsAuthenticated, (req, res) => {
  res.sendFile(__dirname+'/public/login.html')
});






/*

//endpoints 

app.get('/login-form',(req,res) => {
res.sendFile(__dirname+'/public/login.html')
})


app.post('/login',(req,res)=>{
 req.session.user = req.body.nombre
    res.redirect('/formulario')

   
})

app.get('/formulario',(req,res)=>{
    res.sendFile(__dirname+'/public/formulario.html');
    const user = req.session.user
    console.log(`Hola ${user}`)
    
})

app.get('/logout',(req,res) => {
    res.sendFile(__dirname+'/public/chau.html')
    })
    

app.get('/logout',(req,res)=>{
    req.session.destroy(function (err) {
      res.redirect('/'); 
     });
  })

  */



//socket 
io.on('connection', (socket:any) => {
    //recibe lo que viene del script formulario
    socket.on('producto nuevo', (message:any)=>{
       console.log(message) //el  mensaje me traeria los datos del input
        io.emit('producto nuevo', message); //muestra a todoslos usuarios en tiempo rea
    })
      // GUARDAR DATOS DEL CHAT 
    socket.on('mensaje del chat', (data:any) =>{
      console.log(data)
      io.emit('mensaje del chat',data);
      const saveChat = new chatModel(data)
      saveChat.save()
     
})
})

//conexión
app.listen(6666 , () =>{
  mongoose.connect('mongodb://localhost:27017/desafios',
  {
   useNewUrlParser: true, 
   useUnifiedTopology: true
  }
 )

 .then( () => console.log('Conexión establecida'))
 .catch((err:any) => console.log(err))
})
function isValidPassword(user: any) {
  throw new Error('Function not implemented.');
}

