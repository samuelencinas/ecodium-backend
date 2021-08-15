/**
 * ECODIUM - TFG Samuel Encinas
 * MODELO: Imágenes
 */

 var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    tipo: ['avatar', 'reto', 'logro', 'resto', 'documento'],
    archivo:
    {
        data: Buffer,
        contentType: String
    }
})

module.exports = Archivo = mongoose.model('archivos', FileSchema);
