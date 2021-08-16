/**
 * ECODIUM - TFG Samuel Encinas
 * RUTAS DE LA API: Retos
 */

const express = require("express");
const router = express.Router();
const {NodeVM} = require('vm2');
const retos = require("../models/retos");
const Reto = require('../models/retos');

// FUNCIONALIDAD: Intentar resolver un reto
router.post("/resolver/", async (req, res) => {
    const request = req.body;
    console.log(request);
    let mensaje, respuesta;
        const reto = await Reto.findOne({id: request.id});
        const nPrueba = Number(request.pruebaSeleccionada);
        const prueba = reto.pruebas.filter((item) => item.id === nPrueba)[0];
        console.log(reto.pruebas);
        // Creamos la nueva máquina virtual donde se ejecutará el código en modo "sandbox"
        const vm = new NodeVM({
            console: 'redirect',
            sandbox: {
                // Definimos la función de entrada de valores
                input(){
                    return prueba.entrada;
                }
            },
            // Admitimos la importación de módulos externos seguros
            require: {
                external: true
            }
        })
        // Almacenamos la salida de la máquina virtual en una variable
        vm.on('console.log', (data) => {
            if (!data || data == undefined || data == "undefined"){
                data = "";
            }
            if (!respuesta || respuesta == ""){
                respuesta = data;
            } else {
                respuesta += "\n" + data;

            }
        });
        // Esperamos a que la máquina virtual ejecute el código del usuario
        try {
            var resultado = vm.run(request.codigo, 'ecodium.js');
        } catch (err){
            mensaje = "error";
            respuesta = err.stack;
            if (respuesta.includes('SyntaxError')){
                respuesta = respuesta.substring(0, respuesta.indexOf('\n    at new Script') + 1);
            } else {
            respuesta = respuesta.substring(0, respuesta.indexOf('\n    at NodeVM.') + 1);
            }
        }
        // Devolvemos un mensaje indicando si la solución al reto ha sido correcta o incorrecta
        mensaje = (mensaje === "error") ? "error" : (respuesta == prueba.salida) ? "correcto" : "incorrecto";
        if (!respuesta || respuesta === undefined || respuesta === null){
            respuesta = "La consola no devuelve nada";
        }
        if (respuesta.includes("undefined")){
            respuesta = respuesta.substring(respuesta.indexOf('\n') + 1, respuesta.length);
        }
        return res.status(200).json({mensaje, respuesta});
});

// FUNCIONALIDAD: Comprobar si un usuario ha resuelto un reto
router.get("/resuelto/:id", async (req, res) => {
    const retos = req.user.retos.map(r => r.idReto);
    return res.status(200).json(retos.includes(req.params.id));
});

// FUNCIONALIDAD: Obtener la lista de etiquetas (tags)
router.get("/etiquetas/", async (req, res) => {
    let etiquetas = [];
    Reto.find({}, function(err, retos) {
        retos.forEach(reto => {
            reto.etiquetas.forEach(etiqueta => {
                if (!etiquetas.includes(etiqueta)){
                    etiquetas.push(etiqueta);
                }
            });
        });
    if (etiquetas !== []){
        res.status(200).json(etiquetas);
    } else {
        res.status(500).json("error");
    }
    });
});

// PERMISOS: Comprobar si se tienen permisos para editar cierto reto
router.get("/tienePermisos/:id", async (req, res) => {
    try {
        const reto = await Reto.findOne({id: req.params.id});
        const autorizado = req.user.rol.includes('organizador') || req.user.rol.includes('ojeador');
        const resultado = 
        req.user.rol.includes('admin')
        ? true
        : !!reto.organizador
            ? reto.organizador === req.session.user.nombreUsuario 
                ? true
                : false
            : false;
            console.log(resultado);
        return res.status(200).json(autorizado && resultado);
    } catch (e) {
        return res.status(500).json(false);
    }
})

// PERSISTENCIA: Obtener la info de un reto
router.get("/reto/:id", async (req, res) => {
    console.log(req.params.id);
    try {
        const reto = await Reto.findOne({id: req.params.id});
        var pruebas = [];
        // Devolvemos solo los datos públicos de las pruebas
        reto.pruebas.forEach(prueba => {
            if (prueba.tipo == "publica"){
                pruebas.push({id: prueba.id, entrada: prueba.entrada, salida: prueba.salida});
            } else if (prueba.tipo == "oculta"){
                pruebas.push({id: prueba.id, entrada: prueba.entrada});
            } else {
                pruebas.push({id: prueba.id});
            }
        });
        res.status(200).json({
            nombre: reto.nombre,
            descripcion: reto.descripcion,
            dificultad: reto.dificultad,
            etiquetas: reto.etiquetas,
            recompensa: reto.recompensa,
            conquistador: reto.conquistador,
            pruebas: pruebas
        });
    } catch (e) {
        return res.status(500).json({mensaje: "error", e});
    }
});

// PERSISTENCIA: Obtener todos los retos
router.get('/retos/', function(req, res) {
  Reto.find({}, function(err, retos) {
    var retosMap = [];

    retos.forEach(reto => {
        var pruebas = []
        reto.pruebas.forEach(prueba => {
            if (prueba.tipo == "publica"){
                pruebas.push({id: prueba.id, entrada: prueba.entrada, salida: prueba.salida});
            } else if (prueba.tipo == "oculta"){
                pruebas.push({id: prueba.id, entrada: prueba.entrada});
            } else {
                pruebas.push({id: prueba.id});
            }
        });
        const r = {
            id: reto.id,
            nombre: reto.nombre,
            descripcion: reto.descripcion,
            dificultad: reto.dificultad,
            etiquetas: reto.etiquetas,
            recompensa: reto.recompensa,
            conquistador: reto.conquistador,
            pruebas: pruebas
        }
      retosMap.push(r);
    });

    res.status(200).json(retosMap); 
  });
});
// PERSISTENCIA: Añadir un nuevo reto
router.post('/nuevo-reto', async (req, res) => {
    const body = {id: 112, ...req.body};
    console.log(body);
    try {
        const nuevoReto = await Reto.create(body);
        console.log(nuevoReto);
        res.status(200).json(nuevoReto);
    } catch (error) {
        return res.status(500).json({mensaje: "error", error});
    }
});
// PERSISTENCIA: Actualizar un reto
router.put('/actualizar/:id', async (req, res) => {
    try {
        const retoActualizado = await Reto.findOneAndUpdate({"id": req.params.id}, {"$set": req.body }, {new: true});
        res.status(200).json(retoActualizado);
    } catch (error) {
        return res.status(500).json({mensaje: "error", error});
    }
});
// PERSISTENCIA: Eliminar un reto
router.delete('/eliminar/:id', async (req, res) => {
    try {
        const retoBorrado = await Reto.findOneAndDelete({"id": req.params.id});
        res.status(200).json(retoBorrado);
    } catch (error) {
        return res.status(500).json({mensaje: "error", error});
    }
})

module.exports = router;
