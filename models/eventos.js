/**
 * ECODIUM - TFG Samuel Encinas
 * MODELO DE LA API: Eventos
 */

 var mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ParticipationSchema = new Schema({
    titulo: String,
    autor: String,
    descripcion: String,
    repositorio: String,
    archivos: [String],
});

const EventSchema = new Schema({
    id: {
        type: Number,
        unique: true
    },
    estado: String,
    nombre: String,
    descripcion: String,
    limite: Number,
    precio: Number,
    premios: [{
        puesto: Number,
        recompensa: Number,
    }],
    visible: Boolean,
    fechaInicio: Date,
    fechaFin: Date,
    organizador: String,
    candidaturas: [ParticipationSchema],
    candidaturaGanadora: ParticipationSchema,
    etiquetas: [String],
});

EventSchema.plugin(AutoIncrement, {id:'order_seq_2',inc_field: 'id'});
module.exports = Evento = mongoose.model('eventos', EventSchema);