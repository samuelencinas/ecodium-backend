/**
 * ECODIUM - TFG Samuel Encinas
 * RUTA DE LA API: Talleres
 */
const express = require("express");
const router = express.Router();
const Taller = require ('../models/talleres');

// PERSISTENCIA: Obtener todos los talleres
router.get('/talleres/', function (req, res) {
  Taller.find({}, function (err, talleres) {
    var talleresMap = [];
    const autorizado = req.user.rol.includes('organizador') || req.user.rol.includes('ojeador');

    talleres.forEach(taller => {
      var contenidos = [];
      taller.contenidos.forEach(contenido => {
        autorizado
          ?
          contenidos.push(contenido) :
          contenidos.push({
            identificador: contenido.identificador
          });
      });
      const t = {
        ...taller,
        contenidos,
      }
      talleresMap.push(t);
    });
    res.status(200).json(talleresMap);
  });
});

// PERSISTENCIA: DAR DE ALTA UN TALLER
router.post('/nuevo-taller', async (req, res) => {
  const body = req.body;
  try {
    const nuevoTaller = await Taller.create(body);
    res.status(200).json(nuevoTaller);
  } catch (error) {
    return res.status(500).json({
      mensaje: "error",
      error
    });
  }
});

// PERMISOS: Comprobar si se tienen permisos para editar cierto taller
router.get("/tienePermisos/:id", async (req, res) => {
  try {
    const taller = await Taller.findOne({
      id: req.params.id
    });
    const autorizado = req.user.rol.includes('organizador') || req.user.rol.includes('ojeador');
    const resultado =
      req.user.rol.includes('admin') ?
      true :
      !!taller.organizador ?
      taller.organizador === req.session.user.nombreUsuario ?
      true :
      false :
      false;
    return res.status(200).json(autorizado && resultado);
  } catch (e) {
    return res.status(500).json(false);
  }
})

// PERSISTENCIA: Obtener la info de un taller
router.get("/taller/:id", async (req, res) => {
  try {
    const taller = await Taller.findOne({
      id: req.params.id
    });
    const autorizado = req.user.rol.includes('organizador') || req.user.rol.includes('ojeador');
    var contenidos = [];
    // Devolvemos solo los datos públicos de los contenidos
    if (esSoloJugador && taller.contenidos && taller.contenidos.length > 0) {
      taller.contenidos.forEach(contenido => autorizado ? contenidos.push(contenido) : contenidos.push({
        identificador: contenido.identificador
      }));
    }
    res.status(200).json({
      nombre: taller.nombre,
      descripcion: taller.descripcion,
      estado: taller.estado,
      contenidos: contenidos,
      organizador: taller.organizador,
      precio: taller.precio,
      certificable: taller.certificable,
      plazas: taller.plazas,
      alumnos: taller.alumnos,
      etiquetas: taller.etiquetas,
    });
  } catch (e) {
    return res.status(500).json({
      mensaje: "error",
      e
    });
  }
});


// PERSISTENCIA: Actualizar un taller
router.put('/actualizar/:id', async (req, res) => {
  try {
    const tallerActualizado = await Taller.findOneAndUpdate({
      "id": req.params.id
    }, {
      "$set": req.body
    }, {
      new: true
    });
    res.status(200).json(tallerActualizado);
  } catch (error) {
    return res.status(500).json({
      mensaje: "error",
      error
    });
  }
})

// PERSISTENCIA: Eliminar un taller
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const tallerBorrado = await Taller.findOneAndDelete({
      "id": req.params.id
    });
    res.status(200).json(tallerBorrado);
  } catch (error) {
    return res.status(500).json({
      mensaje: "error",
      error
    });
  }
})

module.exports = router;
