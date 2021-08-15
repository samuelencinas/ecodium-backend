const express = require("express");
const router = express.Router();
const passport = require("passport");

// GOOGLE
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }), 
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
    const user = req.user;
    return res.status(200).send('<script>window.opener.location="http://localhost:8080"; self.close();</script>');
    
});
// GITHUB
router.get("/github", passport.authenticate("github", {
    scope: ["profile", "email"]
}),
);

router.get("/github/redirect", passport.authenticate("github"), (req, res) => {
    const user = req.user;
    return res.status(200).send('<script>window.opener.location="http://localhost:8080"; self.close();</script>');
});

// ACCESO DESCENTRALIZADO
router.get("/metamask",   passport.authenticate('metamask', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
// REGISTRO - LOCAL
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

// INICIO DE SESIÓN - LOCAL
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
// CIERRE DE SESIÓN - LOCAL
router.get('/cerrarsesion', function(req, res){
  req.logout();
  req.session.destroy(function (err) {
        return res.send({ authenticated: req.isAuthenticated() });
    });
});

    function sumarDeArray(array, propiedad) {
      return array.reduce(function (r, a) {
        return r + a[propiedad];
      }, 0);
    }


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

// COMPROBAR SI LA SESIÓN SE HA INICIADO
router.get("/user", (req, res, next) => {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated()){
        // Comprobamos el nivel del usuario
        const nivel = {"nivel": comprobarNivel(req.user)}
        Usuario.findOneAndUpdate(
            {"_id": req.user.id},
            {"$set": nivel},
            {new: true}
        ).then(response => {
        return res.status(200).json({estado: "ok", usuario: response});

        });
    } else {
        return res.status(400).json({estado: "error", mensaje: "Sesión no iniciada"});
    }
});

// ACTUALIZAR UN USUARIO
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

// Obtener todos los usuarios
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

// Obtener un usuario por ID
router.get("/info/:id", async (req, res) => {
    try {
        const usuarioDb = await Usuario.find
    } catch {
        
    }
})
module.exports = router;
