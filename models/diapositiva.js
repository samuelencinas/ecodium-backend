/**
 * ECODIUM - TFG Samuel Encinas
 * MODELO: Diapositivas
 */

 var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SlideSchema = new Schema({
    titulo: String,
    subtitulo: String,
    imagen: String
})

module.exports = Diapositiva = mongoose.model('diapositivas', SlideSchema);
