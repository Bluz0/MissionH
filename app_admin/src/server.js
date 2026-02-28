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

// 1. ON DÉFINIT D'ABORD LES OPTIONS
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
app.use('/api-dialogue', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// --- CONFIGURATION MONGODB ---
const dbUser = process.env.DB_USER || 'admin';
const dbPass = process.env.DB_PASSWORD || 'password';
const dbHost = process.env.DB_HOST || 'mongodb';
const dbName = process.env.DB_NAME || 'gameDB';

const uri = `mongodb://${dbUser}:${dbPass}@${dbHost}:27017/${dbName}?authSource=admin`;

mongoose.connect(uri)
  .then(() => console.log('✅ Connecté à MongoDB avec succès'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));

/**
 * @swagger
 * tags:
 *  name: Dialogues
 *  description: Opérations CRUD sur les dialogues
 */

// --- ROUTES ---


app.get('/', (req, res) => {
  res.send('L\'API Dialogue est en ligne !');
});

/**
 * @swagger
 * /api/scenarios/{scenarioId}/dialogues:
 *   get:
 *     summary: Récupérer tous les dialogues d'un scénario
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: scenarioId
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID du scénario
 *     responses:
 *       200:
 *         description: Liste des dialogues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dialogue'
 *       500:
 *         description: Erreur serveur
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
 * @swagger
 * /api/dialogues:
 *   post:
 *     summary: Créer un nouveau dialogue
 *     tags: [Dialogues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dialogue'
 *     responses:
 *       201:
 *         description: Dialogue créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialogue'
 *       400:
 *         description: Erreur de validation
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


/**
 * @swagger
 * /api/dialogues/{id}:
 *   put:
 *     summary: Mettre à jour un dialogue existant
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du dialogue à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Dialogue'
 *     responses:
 *       200:
 *         description: Dialogue mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialogue'
 *       400:
 *         description: Erreur de validation
 */
app.put('/api/dialogues/:id', async (req, res) => {
  try {
    const misAJour = await Dialogue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(misAJour);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/dialogues/{id}:
 *   delete:
 *     summary: Supprimer un dialogue
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du dialogue à supprimer
 *     responses:
 *       200:
 *         description: Dialogue supprimé avec succès
 *       500:
 *         description: Erreur serveur
 */
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Dialogue:
 *       type: object
 *       required:
 *         - scenarioId
 *         - ordre
 *         - contenu
 *         - locuteur
 *       properties:
 *         scenarioId:
 *           type: string
 *           description: ID du scénario
 *         ordre:
 *           type: integer
 *           autoIncrement: true
 *           description: Ordre du dialogue dans le scénario
 *         contenu:
 *           type: string
 *           description: Contenu du dialogue
 *         locuteur:
 *           type: string
 *           description: Personnage qui parle
 */