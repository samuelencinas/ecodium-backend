/**
 * ECodium - TFG Samuel Encinas
 * Fichero de configuración del manejo de usuarios
 */
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
        Usuario.findOne({ email: email })
            .then(user => {
                // REGISTRO DE USUARIOS
                    if (!user) {
                        return done(null, false, { error: "El usuario no existe" })
                } else {
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
    callbackURL: "https://api.ecodium.dev/api/auth/google/redirect"
  }, (accessToken, refreshToken, googleUser, done) => {
      Usuario.findOne({"third_party_link.google": googleUser.id}).then(async (usuarioActual)=>{
        if(usuarioActual){
          done(null, usuarioActual);
        } else{
            try {
                const actualizarUsuario = await Usuario.findOneAndUpdate(
                    {"email": googleUser.email},
                    {
                        "$set": {"thirdParty.google": googleUser.id},
                        "$setOnInsert": { email: googleUser.email, nombreUsuario: googleUser.name.givenName, nivel: 1, rol: "player", exp: 0, logros: [], rank: "Sin rango"}
                    },
                    {new: true, upsert: true}
                );
            } catch (error) {
                console.warn(error);
            }
         } 
      })
    })
);

// ACCESO UNIFICADO / Estrategia con GitHub (3)
passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://api.ecodium.dev/api/auth/github/redirect"
}, (accessToken, refreshToken, githubUser, done) => {
    Usuario.findOne({"third_party_link.github.id": githubUser.id}).then(async (usuarioActual)=>{
        if(usuarioActual){
            done(null, usuarioActual);
        } else {
            try {
            const actualizarUsuario = await Usuario.findOneAndUpdate(
            {"email": githubUser._json.email},
            {
                "$set" : {"third_party_link.github.id": githubUser.id, "third_party_link.github.token": accessToken},
                "$setOnInsert": { email: githubUser._json.email, nombreUsuario: githubUser._json.login, nivel: 17, rol: "player", exp: 0, logros: [], rank: "Sin rango"}
            },
            {new: true, upsert: true},
        );
            } catch (error){
                console.warn(error);
            }
            
        } 
    })
})
);


module.exports = passport;
