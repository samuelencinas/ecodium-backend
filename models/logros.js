/**
 * ECODIUM - TFG Samuel Encinas
 * MODELO: Logros
 */

 var mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    nombre: String,
    descripcion: String,
    imagen: String,
    categoria: {
        type: String,
        enum: ['comun', 'infrecuente', 'raro', 'mitico'],
        default: 'comun'
    },
    recompensa: Number,
    
})

module.exports = Logro = mongoose.model('logros', AchievementSchema);
