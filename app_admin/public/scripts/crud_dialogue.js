const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Dialogue = require('./models/Dialogue');

const app = express();
app.use(express.json());
app.use(cors());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/gameDB');



// Récupérer tous les dialogues d'un scénario spécifique
app.get('/api/scenarios/:scenarioId/dialogues', async (req, res) => {
  const dialogues = await Dialogue.find({ scenarioId: req.params.scenarioId }).sort('ordre');
  res.json(dialogues);
});

// Créer un nouveau dialogue
app.post('/api/dialogues', async (req, res) => {
  const nouveauDialogue = new Dialogue(req.body);
  await nouveauDialogue.save();
  res.status(201).json(nouveauDialogue);
});

// Modifier un dialogue
app.put('/api/dialogues/:id', async (req, res) => {
  const misAJour = await Dialogue.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(misAJour);
});

// Supprimer un dialogue
app.delete('/api/dialogues/:id', async (req, res) => {
  await Dialogue.findByIdAndDelete(req.params.id);
  res.json({ message: "Dialogue supprimé avec succès" });
});

app.listen(3000, () => console.log('Serveur lancé sur le port 3000'));