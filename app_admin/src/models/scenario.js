import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  name: String,
  value: Number
});
const Counter = mongoose.model('Counter', counterSchema);

const scenarioSchema = new mongoose.Schema({
  scenarioId: {
    type: Number,
    unique: true
  },
  scenarioName: {
    type: String,
    required: true
  },
  // --- AJOUT : Champ pour la fiche récapitulative ---
  recap: {
    type: String,
    default: ""
  }
});

scenarioSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Cherche le max des scenarioId existants au lieu d'utiliser un compteur
    const dernierScenario = await mongoose.model('Scenario')
      .findOne()
      .sort({ scenarioId: -1 })
      .select('scenarioId');

    this.scenarioId = dernierScenario ? dernierScenario.scenarioId + 1 : 1;
  }
  next();
});

export default mongoose.model('Scenario', scenarioSchema);