/**
 * ECODIUM - TFG Samuel Encinas
 * MODELO: Retos
 */

 var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);


const ChallengeSchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    nombre: String,
    descripcion: String,
    dificultad: Number,
    recompensa: Number,
    pruebas: [{
        id: Number,
        entrada: String,
        salida: String,
        tipo: String,
    }],
    etiquetas: [String],
    conquistador: String,
});
ChallengeSchema.plugin(AutoIncrement, {id:'order_seq',inc_field: 'id'});
module.exports = Reto = mongoose.model('retos', ChallengeSchema);