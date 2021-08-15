/**
 * ECODIUM - TFG Samuel Encinas
 * MODELO: Usuarios
 */

 var mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema de modelado de datos de la autenticación por ThirdParty
const ThirdPartySchema = new Schema({
    google: String,
    github: String,
    wallet: String
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
    direccionEth: {
        type: String,
        unique: true
    },
    rol: ['admin', 'player', 'mentor', 'master'],
    totalExp: Number,
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
    cursos: [{
        idCurso: Number,
        fecha: Date,
        aprobado: Boolean,
    }],
    fotoPerfil: String,
    rank: String,
    categoria: Number,
    pasesEvento: Number,
    pasesTaller: Number,
    third_party_link: ThirdPartySchema
});

module.exports = Usuario = mongoose.model('usuarios', UserSchema);
