import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Dialogue from './models/dialogue.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURATION MONGODB ---
// On utilise les variables d'environnement passées par Docker
const dbUser = process.env.DB_USER || 'admin';
const dbPass = process.env.DB_PASSWORD || 'password';
const dbHost = process.env.DB_HOST || 'mongodb';
const dbName = process.env.DB_NAME || 'gameDB';

const uri = `mongodb://${dbUser}:${dbPass}@${dbHost}:27017/${dbName}?authSource=admin`;

mongoose.connect(uri)
  .then(() => console.log('Connecté à MongoDB avec succès'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));


// NOS CRUD POUR LES DIALOGUES (crud_dialogue.js)

app.get('/', (req, res) => {
  res.send('L\'API Dialogue est en ligne !');
});

app.get('/api/scenarios/:scenarioId/dialogues', async (req, res) => {
  try {
    const dialogues = await Dialogue.find({ scenarioId: req.params.scenarioId }).sort('ordre');
    res.json(dialogues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dialogues', async (req, res) => {
  try {
    const nouveauDialogue = new Dialogue(req.body);
    await nouveauDialogue.save();
    res.status(201).json(nouveauDialogue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/dialogues/:id', async (req, res) => {
  try {
    const misAJour = await Dialogue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(misAJour);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/dialogues/:id', async (req, res) => {
  try {
    await Dialogue.findByIdAndDelete(req.params.id);
    res.json({ message: "Dialogue supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));