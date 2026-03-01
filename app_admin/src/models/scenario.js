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
  name: {
    type: String,
    required: true
  }
});

// pour auto-increment
scenarioSchema.pre('save', async function (next) {
  const doc = this;

  if (doc.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: 'scenarioId' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    doc.scenarioId = counter.value;
  }

  next();
});

export default mongoose.model('Scenario', scenarioSchema);