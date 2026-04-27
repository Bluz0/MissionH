import mongoose from 'mongoose';

const DialogueTreeSchema = new mongoose.Schema({
  scenarioName: { type: String, required: true },
  contenu: { type: String, required: true },
  locuteur: { type: String, required: true },
  type: { type: String, enum: ['npc', 'player'], default: 'npc' },
  // Pour le whiteboard
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  // Tableau d'ID des dialogues suivants
  nextDialogues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dialogue' }],
  isCorrect: { type: Boolean, default: false }
});

const DialogueTree = mongoose.model('DialogueTree', DialogueTreeSchema);
export default DialogueTree;