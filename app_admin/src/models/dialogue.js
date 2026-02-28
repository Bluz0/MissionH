import mongoose from 'mongoose';

const DialogueSchema = new mongoose.Schema({
  scenarioId: { type: String, required: true },
  locuteur: { type: String, required: true },
  contenu: { type: String, required: true },
  ordre: { type: Number, default: 0 },
  dateCreation: { type: Date, default: Date.now }
});

const Dialogue = mongoose.model('Dialogue', DialogueSchema);
export default Dialogue;