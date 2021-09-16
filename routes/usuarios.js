const express = require("express");
const router = express.Router();
const passport = require("passport");

// FUNCIONALIDAD: Iniciar sesión con Google
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }), 
);

// Callback 
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
    const user = req.user;
    return res.status(200);
    
});

// FUNCIONALIDAD: Iniciar sesión con GitHub
router.get("/github", passport.authenticate("github", {
    scope: ["profile", "email"]
}),
);

// Callback
router.get("/github/redirect", passport.authenticate("github"), (req, res) => {
    const user = req.user;
    return res.status(200).send('<script>window.opener.location="https://api.ecodium.dev"; self.close();</script>');
});

// FUNCIONALIDAD: Registro local
router.post("/register", (req, res, next) => {

    passport.authenticate("registro_local", function(err, user, info) {
        if (err || !user) {
            return res.status(400).json({ estado: "error", mensaje: info});
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(400).json({ estado: "error", mensaje: info});
            }
            return res.status(200).json({ estado: "ok", mensaje: `Registrado ${user.id}` });
        });
    })(req, res, next);
});

// FUNCIONALIDAD: Inicio de sesión local
router.post("/login", (req, res, next) => {
    passport.authenticate("login_local", function(err, user, info) {
        if (err || !user) {
            return res.status(400).json({ estado: "error", mensaje: info});
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(400).json({ estado: "error", mensaje: info});
            } else {
            return res.status(200).json({ estado: "ok", mensaje: `Sesión iniciada con id ${user.id}` });
        }});
    })(req, res, next);
});

// FUNCIONALIDAD: Cerrar sesión
router.get('/cerrarsesion', function(req, res){
  req.logout();
  req.session.destroy(function (err) {
        return res.send({ authenticated: req.isAuthenticated() });
    });
});

// FUNCIÓN AUXILIAR: Sumar propiedad de array
function sumarDeArray(array, propiedad) {
    return array.reduce(function (r, a) {
    return r + a[propiedad];
    }, 0);
}

// FUNCIÓN AUXILIAR: Comprobar nivel
function comprobarNivel(usuario){
  const data = require('../json/leveling.json');
  const xp = sumarDeArray(usuario.movimientosExp, "cantidad");
  let flag = true;
  let iterador = 0;
  let nv = 0;
  while (flag) {
      if (xp < data[iterador].XP){
          console.log(xp + "-" + data[iterador].XP);
          nv = data[iterador].nivel;
          flag = false;
      } else {
          if (iterador < data.length-1){
              iterador++;
          } else {
              flag = false;
          }
      }
  }
  return nv;
}

// FUNCIÓN AUXILIAR: Comprobar rango
function comprobarRango(nivel){
    const data = require('../json/leveling.json');
    const rango = data[Number(nivel-1)].rango;
    return rango;
}

// FUNCIONALIDAD: Descargar las notificaciones enviadas mientras el usuario estaba offline
router.get("/notificaciones", (req, res, next) => {
    if (req.isAuthenticated()){
       const notifications = req.user.notificacionesPendientes;
       const datosSet = {"notificacionesPendientes": []};
       Usuario.findOneAndUpdate(
           {"_id": req.user.id},
           {"$set": datosSet},
           {new: true}
       ).then(response => {
           return res.status(200).json({estado: "ok", notificaciones: notifications});
       })
    } else {
                   return res.status(500).json({estado: 'error', error: 'Sesión no iniciada'})

    }
});
// FUNCIONALIDAD: Comprobar si el usuario ha iniciado sesión y actualizar los datos de inicio de sesión
router.get("/user", (req, res, next) => {
    if (req.isAuthenticated()){
        const nivel = comprobarNivel(req.user);
        const notifications = req.user.notificacionesPendientes;
        console.log(req.user);
        // Comprobamos el nivel y rango del usuario
        const datosSet = {"nivel": nivel, "rank": comprobarRango(nivel)}
        Usuario.findOneAndUpdate(
            {"_id": req.user.id},
            {"$set": datosSet},
            {new: true}
        ).then(response => {
        return res.status(200).json({estado: "ok", usuario: response});

        });
    } else {
        return res.status(400).json({estado: "error", mensaje: "Sesión no iniciada"});
    }
});

// FUNCIONALIDAD: Actualizar un usuario 
router.put("/actualizar/:id", async (req, res) => {
    const _id = req.params.id;
    const body = req.body;
    try {
        const actualizarUsuario = await Usuario.findOneAndUpdate(
            {"_id": _id},
            {"$set": req.body },
            {new: true}
        );
        return res.status(200).json({estado: "ok", usuario: actualizarUsuario});
    } catch (error) {
        return res.status(400).json({estado: "error", error: error});

    }
});



// FUNCIONALIDAD: Obtener todos los usuarios
router.get("/usuarios", async (req, res) => {
    try {
        const usuarioDb = await Usuario.find();
        res.json(usuarioDb);
    } catch (error) {
        return res.status(400).json({
        mensaje: 'Ocurrio un error',
        error
        })
    }
});
// FUNCIONALIDAD: Comprobar si existe el nombre de usuario
router.get("/existe/:nombre", async (req, res) => {
    const nick = req.params.nombre;
    try {
        const existe = await Usuario.find({"nombreUsuario": nick}).count() > 0;
        console.log(existe);
        return res.status(200).json(existe);
    } catch (e){
        return res.status(500).json(e);
    }
})
// FUNCIONALIDAD: Obtener perfil público por nombre de usuario
router.get("/perfil/:nombre", async (req, res) => {
    const nick = req.params.nombre;
    try {
        const usuario = await Usuario.findOne({"nombreUsuario" : nick});
        const perfil = {
            nombreUsuario: usuario.nombreUsuario,
            nivel: usuario.nivel,
            rango: usuario.rank,
            xp: sumarDeArray(usuario.movimientosExp, "cantidad"),
            retos: usuario.retos.length,
            logros: usuario.logros.length,
            talleres: usuario.talleres.length,
            fotoPerfil: usuario.fotoPerfil
        }
        return res.status(200).json(perfil);
    } catch (e) {
        return res.status(500).json(e);
    }
})


// FUNCIONALIDAD: Añadir usuario a favoritos (Solo Ojeadores)
router.put("/nuevoFavorito/:id", async (req, res) => {
    const _id = req.params.id;

      try {
    const usuarioActualizado = await Usuario.findOneAndUpdate(            {"_id": _id}, {
      "$push": {
        'favoritos': req.body.favorito
      }
    }, {
      new: true
    });
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    return res.status(500).json({mensaje: 'error', error});
  }
});

// FUNCIONALIDAD: Obtener email por nombre de usuario
router.get("/email/:nombre", async (req, res) => {
    const nick = req.params.nombre;
    try {
        const usuario = await Usuario.findOne({"nombreUsuario" : nick});
        const email = usuario.email;
        return res.status(200).json(email);
    } catch (e) {
        return res.status(500).json(e);
    }
})

module.exports = router;
