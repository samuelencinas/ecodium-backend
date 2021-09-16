/**
 * ECODIUM - TFG Samuel Encinas
 * MODELO: Usuarios
 */

 var mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema de modelado de datos de la autenticación por ThirdParty
const ThirdPartySchema = new Schema({
    google: String,
    github: {
        id: String,
        token: String
    },
});

// Esquema de modelado de datos del usuario.
const UserSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    nombreUsuario: String,
    nivel: Number,
    rol: ['admin', 'player', 'organizador', 'ojeador'],
    movimientosExp: [{
        cantidad: Number,
        fecha: Date,
        concepto: String
    }],
    transaccionesTal: [{
        exp: Number,
        tal: Number,
        fecha: Date
    }],
    pases: Number,
    logros: [{
        idLogro: Number,
        fecha: Date,
    }],
    retos: [{
        idReto: Number,
        fecha: Date,
    }],
    talleres: [{
        idTaller: Number,
        fecha: Date,
    }],
    fotoPerfil: String,
    rank: String,
    favoritos: [String],
    third_party_link: ThirdPartySchema,
    notificacionesPendientes: [{
        notification: String,
        time: Date
    }],
});

module.exports = Usuario = mongoose.model('usuarios', UserSchema);
