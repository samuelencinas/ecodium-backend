/**
 * ECODIUM - TFG Samuel Encinas
 * RUTAS DE LA API: Logros
 */

const express = require("express");
const router = express.Router();
const Logro = require('../models/logros');

// CREAR UN LOGRO
router.post('/nuevo-logro', async (req, res) => {
    const body = req.body;
    try {
        const nuevoLogro = await Logro.create(body);
        res.status(200).json(nuevoLogro);
    } catch (error) {
        return res.status(500).json({mensaje: "error", error});
    }
})
// OBTENER TODOS LOS LOGROS
router.get('/logros/', function(req, res) {
  Logro.find({}, function(err, logros) {
    res.status(200).json(logros); 
  });
});

// OBTENER INFO DE RETOS

module.exports = router;