/**
 * ECODIUM - TFG Samuel Encinas
 * MODELO: Talleres
 */

 var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const WorkshopSchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    nombre: String,
    descripcion: String,
    contenidos: [{
        titulo: String,
        descripcion: String,
        archivo: String,
    }],
    organizador: String,
    nivel: Number,
    precio: Number,
    dificultad: Number,
    certificable: Boolean,
    fecha: Date,
    plazas: Number,
    alumnos: [String],
    etiquetas: [String],
});
WorkshopSchema.plugin(AutoIncrement, {id:'order_seq_3',inc_field: 'id'});
module.exports = Taller = mongoose.model('talleres', WorkshopSchema);