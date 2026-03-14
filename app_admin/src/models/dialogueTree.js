import mongoose from 'mongoose';

const DialogueTreeSchema = new mongoose.Schema({
  scenarioName: { type: String, required: true, unique: true },
  // Stockage des bulles (nodes)
  nodes: [{
    id: { type: Number, required: true },
    text: { type: String, required: true },
    type: { type: String, enum: ['npc', 'player'], required: true },
    x: { type: Number, required: true }, // Position pour le Whiteboard
    y: { type: Number, required: true }
  }],
  // Stockage des flèches (connections)
  connections: [{
    fromId: { type: Number, required: true },
    toId: { type: Number, required: true }
  }],
  lastUpdate: { type: Date, default: Date.now }
});

const DialogueTree = mongoose.model('DialogueTree', DialogueTreeSchema);
export default DialogueTree;