import mongoose from 'mongoose';

// On extrait Schema de mongoose
const { Schema } = mongoose;

const npcConfigSchema = new mongoose.Schema({
  npcId: { type: String, unique: true, required: true },
  npcName: { type: String, default: "Professeur Inconnu" }, // Nouveau champ
  scenarioName: { type: String, default: null }
});

const NPCConfig = mongoose.model('NPCConfig', npcConfigSchema);

export default NPCConfig;