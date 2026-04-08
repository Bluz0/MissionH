import mongoose from 'mongoose';

const NPCConfig = mongoose.model('NPCConfig', new Schema({
  npcId: { type: String, unique: true },
  scenarioName: String
}));

export default NPCConfig;