// models/Dialogue.js
const mongoose = require('mongoose');

const DialogueSchema = new mongoose.Schema({
  scenarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario', required: true },
  locuteur: { type: String, required: true }, // Ex: "Eleve", "Prof"
  contenu: { type: String, required: true },
  ordre: { type: Number, default: 0 }, // Pour trier les dialogues dans Unity
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dialogue', DialogueSchema);