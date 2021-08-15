const express = require("express");
const router = express.Router();
const Evento = require ('../models/eventos');

// FUNCIONALIDAD: PRESENTAR CANDIDATURA A EVENTO
router.put('/nueva-candidatura/:id', async (req, res) => {
    const body = req.body;
    if (!!req.body.titulo && !!req.body.autor && !!req.body.descripcion && !!req.body.repositorio){
        try {
            const eventoActualizado = await Evento.findOneAndUpdate({"id": req.params.id}, {"$push": {"candidaturas" : {"titulo" : req.body.titulo, "autor": req.body.autor, "descripcion": req.body.descripcion, "repositorio": req.body.repositorio}}});
            return res.status(200).json(eventoActualizado);
        } catch (error) {
            return res.status(500).json({mensaje: "error"}, error);
        }
    } else {
        return res.status(500).json({mensaje: "error"});
    }
});

// PERSISTENCIA: Obtener todos los retos
router.get('/eventos/', function(req, res) {
    Evento.find({}, function(err, eventos){
        var eventosMap = [];

        eventos.forEach(evento => {
            var candidaturas = [];
            evento.candidaturas.forEach(candidatura => {
                pruebas.push({titulo: candidatura.titulo, descripcion: candidatura.descripcion, autor: candidatura.descripcion});
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

// PERSISTENCIA: Obtener la info de un reto
router.get("/evento/:id", async (req, res) => {
    try {
        const evento = await Evento.findOne({id: req.params.id});
        var candidaturas = [];
        // Devolvemos solo los datos públicos de las candidaturas
        evento.candidaturas && evento.candidaturas.length > 0 
            ? evento.candidaturas.forEach(candidatura => {
                candidaturas.push({titulo: candidatura.titulo, descripcion: candidatura.descripcion, repositorio: candidatura.repositorio});
            })
            : [];
        res.status(200).json({
            estado: evento.estado,
            nombre: evento.nombre,
            descripcion: evento.descripcion,
            limite: evento.limite,
            precio: evento.precio,
            premios: evento.premios,
            visible: evento.visible,
            fecha: evento.fecha,
            candidaturas,
            candidaturaGanadora: evento.candidaturaGanadora,
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
        const eventoBorrado = await Reto.findOneAndDelete({"id": req.params.id});
        res.status(200).json(retoBorrado);
    } catch (error) {
        return res.status(500).json({mensaje: "error", error});
    }
})

module.exports = router;
