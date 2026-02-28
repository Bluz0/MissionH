import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Dialogue from './models/dialogue.js';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

// --- CONFIGURATION EXPRESS ---
const app = express();
app.use(express.json());
app.use(cors());

// 1. ON DÉFINIT D'ABORD LES OPTIONS (Ordre crucial !)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mission H - API Dialogue',
      version: '1.0.0',
      description: 'Documentation Swagger interactive des dialogues du jeu',
    },
    servers: [{ url: 'http://51.38.222.173:3001' }],
  },
  apis: ['./src/server.js'],
};

// 2. ENSUITE ON INITIALISE SWAGGER AVEC CES OPTIONS
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// --- CONFIGURATION MONGODB ---
const dbUser = process.env.DB_USER || 'admin';
const dbPass = process.env.DB_PASSWORD || 'password';
const dbHost = process.env.DB_HOST || 'mongodb';
const dbName = process.env.DB_NAME || 'gameDB';

const uri = `mongodb://${dbUser}:${dbPass}@${dbHost}:27017/${dbName}?authSource=admin`;

mongoose.connect(uri)
  .then(() => console.log('✅ Connecté à MongoDB avec succès'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

// --- ROUTES ---

app.get('/', (req, res) => {
  res.send('L\'API Dialogue est en ligne !');
});

/**
 * @openapi
 * /api/scenarios/{scenarioId}/dialogues:
 * get:
 * summary: Récupérer tous les dialogues d'un scénario
 * parameters:
 * - in: path
 * name: scenarioId
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Liste des dialogues
 */
app.get('/api/scenarios/:scenarioId/dialogues', async (req, res) => {
  try {
    const dialogues = await Dialogue.find({ scenarioId: req.params.scenarioId }).sort('ordre');
    res.json(dialogues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /api/dialogues:
 * post:
 * summary: Créer un nouveau dialogue
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * scenarioId:
 * type: string
 * locuteur:
 * type: string
 * contenu:
 * type: string
 * responses:
 * 201:
 * description: Dialogue enregistré !
 */
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