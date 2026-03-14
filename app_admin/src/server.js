import express from 'express';
import path from "path";
import { fileURLToPath } from "url";
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import des modèles
import DialogueTree from './models/dialogueTree.js';
import Scenario from './models/scenario.js';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossier public pour le front
app.use(express.static(path.join(__dirname, "../public")));

// --- CONFIGURATION MONGODB ---
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:27017/${process.env.DB_NAME}?authSource=admin`;

mongoose.connect(uri)
  .then(() => console.log('Connecté à MongoDB (Système Arborescent)'))
  .catch(err => console.error('Erreur MongoDB :', err));

// --- SWAGGER CONFIG ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Mission H - API Dialogue V2', version: '2.0.0' },
    servers: [{ url: 'http://51.38.222.173' }],
  },
  apis: ['./src/server.js'],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-dialogue', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// --- ROUTES SCÉNARIOS (Utilisées par l'index.html) ---

/**
 * @swagger
 * /api/scenarios:
 * get:
 * summary: Liste tous les scénarios pour l'index
 * tags: [Scenarios]
 */
app.get('/api/scenarios', async (req, res) => {
  try {
    const scenarios = await Scenario.find().sort('scenarioId');
    res.json(scenarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/scenarios:
 * post:
 * summary: Créer un nouveau scénario vide
 * tags: [Scenarios]
 */
app.post('/api/scenarios', async (req, res) => {
  try {
    const newScenario = new Scenario({ scenarioName: req.body.scenarioName });
    await newScenario.save();
    res.status(201).json(newScenario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- ROUTES TREE (Le coeur de l'éditeur et d'Unity) ---

/**
 * @swagger
 * /api/scenarios/{scenarioName}/tree:
 * get:
 * summary: Récupère l'arbre complet (Nodes + Liens) pour l'éditeur ou Unity
 * tags: [Tree]
 */
app.get('/api/scenarios/:scenarioName/tree', async (req, res) => {
  try {
    const tree = await DialogueTree.findOne({ scenarioName: req.params.scenarioName });
    if (!tree) return res.status(404).json({ message: "Arbre non trouvé" });
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/scenarios/tree/save:
 * post:
 * summary: Sauvegarde l'état complet du Whiteboard
 * tags: [Tree]
 */
app.post('/api/scenarios/tree/save', async (req, res) => {
  try {
    const { scenarioName, nodes, connections } = req.body;

    // Met à jour si existe, sinon crée (upsert)
    const updatedTree = await DialogueTree.findOneAndUpdate(
      { scenarioName },
      { nodes, connections, lastUpdate: Date.now() },
      { new: true, upsert: true }
    );

    res.status(200).json(updatedTree);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/scenarios/{scenarioName}:
 * delete:
 * summary: Supprime un scénario et son arbre de dialogue
 * tags: [Scenarios]
 */
app.delete('/api/scenarios/:scenarioName', async (req, res) => {
  try {
    await Scenario.findOneAndDelete({ scenarioName: req.params.scenarioName });
    await DialogueTree.findOneAndDelete({ scenarioName: req.params.scenarioName });
    res.json({ message: "Scénario et arbre supprimés" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, "0.0.0.0", () => {
  console.log(`Serveur ADMIN lancé sur le port 3001`);
});