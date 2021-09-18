/**
 * ECODIUM v1 - Backend
 */

// Variables de middleware y servicios usados 

// Express - Middleware 
const express = require('express'); 
const app = express();
const session = require("express-session");

// Mongoose - Middleware de persistencia en la base de datos
const MongoStore = require("connect-mongo");
const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const bodyParser = require('body-parser');

// PassportJS - Middleware de autenticación
const passport = require("./api/auth");
const cors = require("cors");

// DotENV - Middleware para la seguridad en producción
const dotenv = require('dotenv');
dotenv.config(); 

// Validación de datos
const Joi = require('@hapi/joi'); 
Joi.objectId = require('joi-objectid')(Joi); 


// Secretos
const secretMongoDB = process.env.MONGODB_URI;

// Middlewares
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: 'http://localhost:8080'}))
app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use('/subidas', express.static('uploads'));

// Configuración de Mongoose y Multer
mongoose.connect(secretMongoDB, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(() => console.log("Conectado a la base de datos"))
.catch(err => console.log('Something went wrong' + err))

// Express Session
app.use(
  session({
      secret: "very secret this is",
      resave: true,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl: secretMongoDB}),
      cookie: { secure: false, } // Set to false
  })
);
app.use(passport.initialize());
app.use(passport.session());


const auth = require("./routes/usuarios");
app.use('/api/auth', auth);
const retos = require("./routes/retos");
app.use('/api/retos', retos);
const logros = require("./routes/logros");
app.use('/api/logros', logros);
const eventos = require("./routes/eventos");
app.use('/api/eventos', eventos);
const talleres = require("./routes/talleres");
app.use('/api/talleres', talleres);
const herramientas = require("./routes/herramientas");
app.use('/api/herramientas', herramientas);

app.set('puerto', process.env.PORT || 3000);
app.listen(app.get('puerto'), err => {
  if(err) throw err;
  console.log("Servidor ejecutándose");
});
