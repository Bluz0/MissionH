import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import Dialogue from './models/dialogue.js';
import Scenario from './models/scenario.js';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

// --- CONFIGURATION EXPRESS ---
const app = express();
app.use(express.json());
app.use(cors());

// ON DÉFINIT D'ABORD LES OPTIONS
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

// ENSUITE ON INITIALISE SWAGGER AVEC CES OPTIONS
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-dialogue', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// --- CONFIGURATION MONGODB ---
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;

const uri = `mongodb://${dbUser}:${dbPass}@${dbHost}:27017/${dbName}?authSource=admin`;

mongoose.connect(uri)
  .then(() => console.log('✅ Connecté à MongoDB avec succès'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));

// --- ROUTES ---


app.get('/', (req, res) => {
  res.send('L\'API Dialogue est en ligne !');
});

/**
 * @swagger
 * tags:
 *  name: Scenarios
 *  description: Opérations CRUD sur les scénarios
 */

/**
 * @swagger
 * /api/scenarios/:
 *   get:
 *     summary: Récupérer tous les scénarios
 *     tags: [Scenarios]
 *     responses:
 *       200:
 *         description: Liste des scénarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Scenario'
 *       500:
 *         description: Erreur serveur
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
 *   post:
 *     summary: Créer un nouveau scénario
 *     tags: [Scenarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Scenario'
 *     responses:
 *       201:
 *         description: Scénario créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scenario'
 *       400:
 *         description: Erreur de validation
 */
app.post('/api/scenarios', async (req, res) => {
  try {
    const { scenarioName } = req.body;

    if (!scenarioName) {
      return res.status(400).json({ error: "Le nom du scénario est obligatoire" });
    }

    const newScenario = new Scenario({ scenarioName });
    await newScenario.save();

    res.status(201).json(newScenario);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/scenarios/{scenarioName}:
 *  delete:
 *    summary: Supprimer un scénario et tous ses dialogues associés
 *    tags: [Scenarios]
 *    parameters: 
 *      - in: path
 *        name: scenarioName
 *        schema:
 *          type: string
 *        required: true
 *        description: Le nom du scénario à supprimer
 *    responses:
 *      200:
 *        description: Scénario et dialogues supprimés avec succès
 *      404:
 *        description: Scénario non trouvé
 */
app.delete('/api/scenarios/:scenarioName', async (req, res) => {
  try {
    const { scenarioName } = req.params;

    // Supprimer le scénario
    const scenarioSupprime = await Scenario.findOneAndDelete({ scenarioName });

    if (!scenarioSupprime) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }

    // Supprimer tous les dialogues liés à ce scénario
    const resultDialogues = await Dialogue.deleteMany({ scenarioName });

    res.json({ 
      message: "Suppression réussie", 
      scenario: scenarioSupprime.scenarioName,
      dialoguesSupprimes: resultDialogues.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * tags:
 *  name: Dialogues
 *  description: Opérations CRUD sur les dialogues
 */

/**
 * @swagger
 * /api/scenarios/{scenarioName}/dialogues:
 *   get:
 *     summary: Récupérer tous les dialogues d'un scénario
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: scenarioName
 *         schema:
 *           type: string
 *         required: true
 *         description: Le nom du scénario
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
app.get('/api/scenarios/:scenarioName/dialogues', async (req, res) => {
  try {
    const scenario = await Scenario.findOne({ scenarioName: req.params.scenarioName });
    if (!scenario) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }
    const dialogues = await Dialogue.find({ scenarioName: req.params.scenarioName }).sort('ordre');
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
    const { scenarioName } = req.body;

    if (!scenarioName) {
      return res.status(400).json({ error: "scenarioName est requis." });
    }

    // Trouver le scénario correspondant au nom fourni
    const scenario = await Scenario.findOne({ scenarioName });
    if (!scenario) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }
    const scenarioId = scenario._id;
    // Trouver le dernier dialogue pour ce scénario spécifique
    // On trie par 'ordre' descendant (-ordre) et on en prend 1 seul
    const dernierDialogue = await Dialogue.findOne({ scenarioName }).sort('-ordre');

    // Calculer le nouvel ordre
    // Si un dialogue existe, on fait +1, sinon on commence à 1

    const nouvelOrdre = dernierDialogue ? dernierDialogue.ordre + 1 : 1;

    // Créer le dialogue avec l'ordre calculé
    const nouveauDialogue = new Dialogue({
      ...req.body,
      ordre: nouvelOrdre
    });

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
    // On récupère les infos du dialogue AVANT de le supprimer
    const dialogueASupprimer = await Dialogue.findById(req.params.id);
    
    if (!dialogueASupprimer) {
      return res.status(404).json({ error: "Dialogue non trouvé" });
    }

    const { scenarioName, ordre } = dialogueASupprimer;

    // Suppression du dialogue
    await Dialogue.findByIdAndDelete(req.params.id);

    // Décrémentation de tous les dialogues qui étaient APRÈS lui
    // On cherche les dialogues du même scénario dont l'ordre est strictement supérieur ($gt)
    // On utilise $inc avec -1 pour soustraire 1 à chaque champ 'ordre'
    await Dialogue.updateMany(
      { scenarioName, ordre: { $gt: ordre } },
      { $inc: { ordre: -1 } }
    );

    res.json({ 
      message: "Dialogue supprimé et ordres suivants mis à jour",
      details: `Les dialogues du scénario ${scenarioName} après le rang ${ordre} ont été décalés.`
    });
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
 *     Scenario:
 *       type: object
 *       required:
 *         - scenarioName
 *       properties:
 *         scenarioName:
 *          type: string
 *          description: Nom du scénario
 *         scenarioId:
 *          type: integer
 *          description: ID auto-incrémenté du scénario
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Dialogue:
 *       type: object
 *       required:
 *         - scenarioName
 *         - contenu
 *         - locuteur
 *       properties:
 *         scenarioName:
 *           type: string
 *           description: Nom du scénario
 *         ordre:
 *           type: integer
 *           description: Ordre auto-incrémenté par scénario
 *         contenu:
 *           type: string
 *           description: Contenu du dialogue
 *         locuteur:
 *           type: string
 *           description: Personnage qui parle
 */