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
    estado: String,
    contenidos: [{
        identificador: String,
        descripcion: String,
        peso: Number
    }],
    organizador: String,
    precio: Number,
    certificable: Boolean,
    plazas: Number,
    alumnos: [String],
    etiquetas: [String],
});
WorkshopSchema.plugin(AutoIncrement, {id:'order_seq',inc_field: 'id'});
module.exports = Taller = mongoose.model('retos', WorkshopSchema);