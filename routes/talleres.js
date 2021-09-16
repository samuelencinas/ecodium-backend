/**
 * ECODIUM - TFG Samuel Encinas
 * RUTA DE LA API: Talleres
 */
const express = require("express");
const router = express.Router();
const Taller = require ('../models/talleres');

// PERSISTENCIA: Obtener todos los talleres
router.get('/talleres/', function (req, res) {
      var talleresMap = [];

  Taller.find({}, function (err, talleres) {
    talleres.forEach(taller => {
      talleresMap.push({id: taller.id, plazas: taller.plazas, nombre: taller.nombre, descripcion: taller.descripcion, nivel: taller.nivel, precio: taller.precio, dificultad: taller.dificultad, organizador: taller.organizador, etiquetas: taller.etiquetas})
      });
          console.log(talleresMap);

              res.status(200).json(talleresMap);
    });
  });

// FUNCIONALIDAD: Obtener todos los talleres recientes (creados hace menos de 7 días)
router.get('/talleresRecientes/', function (req, res) {
      var talleresMap = [];

  Taller.find({}, function (err, talleres) {
    talleres.forEach(taller => {
      const limite = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const fecha = new Date(taller.fecha).setHours(0,0,0,0);
         if (fecha <= limite){
      talleresMap.push({id: taller.id, plazas: taller.plazas, nombre: taller.nombre, descripcion: taller.descripcion, nivel: taller.nivel, precio: taller.precio, dificultad: taller.dificultad, organizador: taller.organizador, fecha: taller.fecha, etiquetas: taller.etiquetas})
  }});
              res.status(200).json(talleresMap);
    });
    
});


// FUNCIONALIDAD: Obtener todos los talleres propios (creados por el usuario)
router.get('/talleresPropios/', function (req, res) {
      var talleresMap = [];

  Taller.find({}, function (err, talleres) {
    talleres.forEach(taller => {
         if (req.user.nombreUsuario === taller.organizador){
      talleresMap.push({id: taller.id, plazas: taller.plazas, nombre: taller.nombre, descripcion: taller.descripcion, nivel: taller.nivel, precio: taller.precio, dificultad: taller.dificultad, organizador: taller.organizador, fecha: taller.fecha, etiquetas: taller.etiquetas})
  }});
              res.status(200).json(talleresMap);
    });
    
});

// PERSISTENCIA: Obtener la info de un taller
router.get("/taller/:id", async (req, res) => {
    try {
        const taller = await Taller.findOne({id: req.params.id});
        // Validación de permisos, lado servidor
        const esOrganizador = !!req.user ? req.user.rol.includes('organizador') : false;
        const talleresUsuario = !!req.user ? req.user.talleres : [];
        const tienePermisos = esOrganizador
          ? true
          : talleresUsuario.length === 0
        ? false
        : talleresUsuario.filter(t => t.idTaller === taller.id).length !== 0
          ? true
          : false;
        console.log(tienePermisos);
        if (tienePermisos){
          return res.status(200).json(taller);
        } else {
          return res.status(403).json({mensaje: "permiso denegado"});
        }
    } catch (e) {
        return res.status(500).json({mensaje: "error", e});
    }
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
      taller.organizador === req.user.nombreUsuario ?
      true :
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

// FUNCIONALIDAD: Añadir un contenido a un taller
router.put('/nuevoContenido/:id', async (req, res) => {
  try {
    const tallerActualizado = await Taller.findOneAndUpdate({
      "id": req.params.id
    }, {
      "$push": {
        'contenidos': req.body.contenido
      }
    }, {
      new: true
    });
    res.status(200).json(tallerActualizado);
  } catch (error) {
    return res.status(500).json({mensaje: 'error', error});
  }
});

// FUNCIONALIDAD: Añadir un alumno a un taller
router.put('/matricular/:id', async (req, res) => {
  try {
    const tallerActualizado = await Taller.findOneAndUpdate({
      "id": req.params.id
    }, {
      "$push": {
        'alumnos': req.body.alumno
      },
      "$inc": {
        plazas: -1
      }
    }, {
      new: true
    });
    res.status(200).json(tallerActualizado);
  } catch (error) {
    return res.status(500).json({mensaje: 'error', error});
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

// FUNCIONALIDAD: Obtener lista de Talleres creados por mí
/** router.get('/propios/:organizador', async (req, res) => {
  try {
    const taller = await Taller.find({
      id: req.params.id
    });
  }
})**/

module.exports = router;
