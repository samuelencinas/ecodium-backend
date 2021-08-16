const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuarios");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const dotenv = require('dotenv').config({path: "./.env"});

// SERIALIZACIÓN DE USUARIOS 
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// DESERIALIZACIÓN DE USUARIOS
passport.deserializeUser((id, done) => {
    Usuario.findById(id, (err, user) => {
        done(err, user);
    });
});

// REGISTRO / Estrategia Local (1.1)
passport.use('registro_local', 
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        Usuario.findOne({ email: email })
            .then(user => {
                // Si el usuario no existe, lo creamos
                if (!user) {
                    const nuevoUsuario = new Usuario({ email, password, nivel: 1, rol: "player", exp: 0, logros: [], rank: "Sin rango" });
                    // Ciframos la contraseña con bcrypt para favorecer la seguridad
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(nuevoUsuario.password, salt, (err, hash) => {
                            if (err) throw err;
                            nuevoUsuario.password = hash;
                            // Guardamos el usuario con la contraseña cifrada
                            nuevoUsuario
                                .save()
                                .then(user => {
                                    return done(null, user);
                                })
                                .catch(err => {
                                    return done(null, false, { error: err });
                                });
                        });
                    });
                // Si el usuario existe, emitimos error
                } else {
                    return done(null, false, { error: "El usuario ya existe" });
                }
            })
            // Ante cualquier imprevisto, emitimos error
            .catch(err => {
                return done(null, false, { error: err});
            });
    })
);
// INICIO DE SESIÓN / Estrategia Local (1.2)
passport.use('login_local',
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        // Match User
        Usuario.findOne({ email: email })
            .then(user => {
                // REGISTRO DE USUARIOS
                    if (!user) {
                        return done(null, false, { error: "El usuario no existe" })
                    // Return other user
                } else {
                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { error: "Contraseña incorrecta" });
                        }
                    });
                }
            })
            .catch(err => {
                return done(null, false, { error: err });
            });
    })
);

// ACCESO UNIFICADO / Estrategia con Google (2)
passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/google/redirect"
  }, (accessToken, refreshToken, googleUser, done) => {
      // passport callback function
      //check if user already exists in our db with the given profile ID
      Usuario.findOne({"third_party_link.google": googleUser.id}).then((usuarioActual)=>{
        if(usuarioActual){
          //if we already have a record with the given profile ID
          done(null, usuarioActual);
        } else{
            const thirdParty = {google: googleUser.id};
            const nuevoUsuario = new Usuario({ email: googleUser.email, nombreUsuario: googleUser.name.givenName, nivel: 1, rol: "player", exp: 0, logros: [], rank: "Sin rango", third_party_link: thirdParty });
             //if not, create a new user 
            nuevoUsuario.save().then((usuarioCreado) =>{
              done(null, usuarioCreado);
            });
         } 
      })
    })
);

// ACCESO UNIFICADO / Estrategia con GitHub (3)
passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/github/redirect"
}, (accessToken, refreshToken, githubUser, done) => {
      // passport callback function
      //check if user already exists in our db with the given profile ID
      Usuario.findOne({"third_party_link.github": githubUser.id}).then((usuarioActual)=>{
        if(usuarioActual){
          //if we already have a record with the given profile ID
          done(null, usuarioActual);
        } else{
            const thirdParty = {github: githubUser.id};
            const nuevoUsuario = new Usuario({ email: githubUser.email, nombreUsuario: githubUser.login, nivel: 1, rol: "player", exp: 0, logros: [], rank: "Sin rango", third_party_link: thirdParty });
             //if not, create a new user 
            nuevoUsuario.save().then((usuarioCreado) =>{
              done(null, usuarioCreado);
            });
         } 
      })
    })
);


module.exports = passport;
