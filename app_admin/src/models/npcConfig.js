import mongoose from 'mongoose';

// On extrait Schema de mongoose
const { Schema } = mongoose;

const npcConfigSchema = new Schema({
  npcId: { type: String, unique: true, required: true },
  scenarioName: { type: String, default: null }
});

const NPCConfig = mongoose.model('NPCConfig', npcConfigSchema);

export default NPCConfig;