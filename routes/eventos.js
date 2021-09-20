/**
 * ECODIUM - TFG Samuel Encinas
 * RUTAS DE LA API: Eventos
 */

const express = require("express");
const router = express.Router();
const Evento = require ('../models/eventos');

// FUNCIONALIDAD: PRESENTAR CANDIDATURA A EVENTO
router.put('/nueva-candidatura/:id', async (req, res) => {
    if (!!req.user){
    const body = req.body;
    if (!!req.body.candidatura){
        try {
            const eventoActualizado = await Evento.findOneAndUpdate({"id": req.params.id}, {"$push": {"candidaturas" : req.body.candidatura}});
            return res.status(200).json(eventoActualizado);
        } catch (error) {
            return res.status(500).json({mensaje: "error"}, error);
        }
    } else {
        return res.status(500).json({mensaje: "error"});
    }
}
});

// FUNCIONALIDAD: Comprobar si el usuario tiene el nivel mínimo del evento
router.get("/tieneAcceso/:id", async (req, res) => {
    try {
        const evento = await Evento.findOne({id: req.params.id});
        const autorizado = req.user.nivel >= evento.limite;
        return res.status(200).json(autorizado);
    } catch (e) {
        return res.status(500).json(false);
    }
});

// PERMISOS: Comprobar si se tienen permisos para editar cierto evento
router.get("/tienePermisos/:id", async (req, res) => {
    try {
        const evento = await Evento.findOne({id: req.params.id});
        const autorizado = req.user.rol.includes('organizador') || req.user.rol.includes('ojeador');
        const resultado = 
        req.user.rol.includes('admin')
        ? true
        : !!evento.organizador
            ? !!req.user.nombreUsuario && evento.organizador === req.session.user.nombreUsuario 
                ? true
                : true
            : true;
        return res.status(200).json(autorizado && resultado);
    } catch (e) {
        return res.status(500).json(false);
    }
})

// PERSISTENCIA: Obtener todos los retos
router.get('/eventos/', function(req, res) {
    Evento.find({}, function(err, eventos){
        var eventosMap = [];

        eventos.forEach(evento => {
            var candidaturas = [];
            evento.candidaturas.forEach(candidatura => {
                candidaturas.push({titulo: candidatura.titulo, descripcion: candidatura.descripcion, autor: candidatura.descripcion});
            });
            const e = {
                ...evento,
                candidaturas: candidaturas
            }
            eventosMap.push(e);
        });
        res.status(200).json(eventosMap);
    });
});

// FUNCIONALIDAD: Obtener todos los eventos activos
router.get('/eventosActivos', function(req, res) {
     Evento.find({}, function(err, eventos){
        var eventosMap = [];

        eventos.forEach(evento => {
            const hoy = Date.now();
            const inicio = new Date(evento.fechaInicio).setHours(0,0,0,0);
            const fin = new Date(evento.fechaFin).setHours(0,0,0,0);
            if (!hoy <= fin && hoy >= inicio) {
                var candidaturas = [];
                evento.candidaturas.forEach(candidatura => {
                    candidaturas.push({titulo: candidatura.titulo, descripcion: candidatura.descripcion, autor: candidatura.descripcion});
                });
                evento.candidaturas = candidaturas;
                eventosMap.push(evento);
            }
        });
        res.status(200).json(eventosMap);
    });   
})

// FUNCIONALIDAD: Obtener todos los eventos propios
router.get('/eventosPropios', function(req, res) {
     Evento.find({}, function(err, eventos){
        var eventosMap = [];

        eventos.forEach(evento => {
            if (evento.organizador === req.user.nombreUsuario) {
                var candidaturas = [];
                evento.candidaturas.forEach(candidatura => {
                    candidaturas.push({titulo: candidatura.titulo, descripcion: candidatura.descripcion, autor: candidatura.descripcion});
                });
                evento.candidaturas = candidaturas;
                eventosMap.push(evento);
            }
        });
        res.status(200).json(eventosMap);
    });   
})
// PERSISTENCIA: DAR DE ALTA UN EVENTO
router.post('/nuevo-evento', async (req, res) => {
    const body = req.body;
    try {
        const nuevoEvento = await Evento.create(body);
        res.status(200).json(nuevoEvento);
    } catch (error) {
        return res.status(500).json({mensaje: "error", error});
    }
});


// PERSISTENCIA: Obtener la info de un evento
router.get("/evento/:id", async (req, res) => {
    try {
        const evento = await Evento.findOne({id: req.params.id});
        const esSoloJugador = req.user.rol === ['player'];
        var candidaturas = [];
        // Devolvemos solo los datos públicos de las candidaturas
        if (esSoloJugador && evento.candidaturas && evento.candidaturas.length > 0) {
            evento.candidaturas.forEach(candidatura => {
                candidaturas.push({titulo: candidatura.titulo, descripcion: candidatura.descripcion, repositorio: candidatura.repositorio});
            })
        }
        res.status(200).json({
            estado: evento.estado,
            nombre: evento.nombre,
            descripcion: evento.descripcion,
            limite: evento.limite,
            precio: evento.precio,
            premios: evento.premios,
            visible: evento.visible,
            fecha: evento.fecha,
            candidaturas: esSoloJugador ? candidaturas : evento.candidaturas,
            candidaturasGanadoras: evento.candidaturasGanadoras,
            etiqueta: evento.etiqueta
        });
    } catch (e) {
        return res.status(500).json({mensaje: "error", e});
    }
});


// PERSISTENCIA: Actualizar un evento
router.put('/actualizar/:id', async (req, res) => {
    try {
        const eventoActualizado = await Evento.findOneAndUpdate({"id": req.params.id}, {"$set": req.body }, {new: true});
        res.status(200).json(eventoActualizado);
    } catch (error) {
        return res.status(500).json({mensaje: "error", error});
    }
})

// PERSISTENCIA: Eliminar un evento
router.delete('/eliminar/:id', async (req, res) => {
    try {
        const eventoBorrado = await Evento.findOneAndDelete({"id": req.params.id});
        res.status(200).json(retoBorrado);
    } catch (error) {
        return res.status(500).json({mensaje: "error", error});
    }
})

module.exports = router;
