import express from 'express';
import path from "path";
import { fileURLToPath } from "url";

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

// hack ES module (obligatoire avec "type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// FRONT STATIQUE
app.use(express.static(path.join(__dirname, "../public")));

app.listen(3001, "0.0.0.0", () => {
  console.log(`Serveur lancé sur le port 3001`);
});


// ON DÉFINIT D'ABORD LES OPTIONS
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mission H - API Dialogue',
      version: '1.0.0',
      description: 'Documentation Swagger interactive des dialogues du jeu',
    },
    servers: [{ url: 'http://51.38.222.173' }],
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

/*
app.get('/', (req, res) => {
  res.send('L\'API Dialogue est en ligne !');
});
*/
/**
 * @swagger
 * tags:
 *  name: Scenarios
 *  description: Opérations CRUD sur les scénarios
 */

/**
 * @swagger
 * /api/scenarios:
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
 * /api/dialogue/{id}:
 *  get:
 *   summary: Récupérer un dialogue par son ID
 *   tags: [Dialogues]
 *   parameters:
 *     - in: path
 *       name: id
 *       schema:
 *         type: string
 *       required: true
 *       description: L'ID du dialogue à récupérer
 *   responses:
 *    200:
 *     description: Dialogue trouvé
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/Dialogue'
 *    404:
 *      description: Dialogue non trouvé
 *    500:
 *      description: Erreur serveur
 */
app.get('/api/dialogue/:id', async (req, res) => {
  try {
    const dialogue = await Dialogue.findById(req.params.id);
    if (!dialogue) {
      return res.status(404).json({ error: "Dialogue non trouvé" });
    }
    res.json(dialogue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } 
});

/**
 * @swagger
 * /api/dialogues/{id}/link:
 *   patch:
 *     summary: Lier un dialogue à un autre (ajouter une relation parent-enfant)
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID du dialogue parent auquel on veut ajouter un lien vers un dialogue enfant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               childId:
 *                 type: string
 *             required:
 *               - childId
 *     responses:
 *       200:
 *         description: Dialogue parent mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialogue'
 *       400:
 *         description: Erreur de validation ou de mise à jour
 */


app.patch('/api/dialogues/:id/link', async (req, res) => {
  try {
    const { childId } = req.body; // L'ID du dialogue vers lequel on pointe
    const parent = await Dialogue.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { nextDialogues: childId } }, // $addToSet évite les doublons
      { new: true }
    );
    res.json(parent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



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
 *       404:
 *         description: Scénario non trouvé
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
    const nouveauDialogue = new Dialogue({
      ...req.body,
      nextDialogues: [], // Vide par défaut
      position: req.body.position || { x: 100, y: 100 }
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
 *     summary: Mettre à jour un dialogue (champs envoyés)
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scenarioName:
 *                 type: string
 *               ordre:
 *                 type: integer
 *               contenu:
 *                 type: string
 *               locuteur:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [npc, player]
 *               nextDialogues:
 *                 type: array
 *                 items:
 *                   type: string
 *               position:
 *                 type: object
 *                 properties:
 *                   x: { type: number }
 *                   y: { type: number }
 *     responses:
 *       200:
 *         description: Succès
 *       400:
 *         description: Erreur de validation ou données invalides
 *       404:
 *         description: Dialogue non trouvé
 */
app.put('/api/dialogues/:id', async (req, res) => {
  try {
    // On récupère tout ce qui est envoyé dans le body
    const donneesAMettreAJour = req.body;

    const misAJour = await Dialogue.findByIdAndUpdate(
      req.params.id,
      { $set: donneesAMettreAJour }, // Met à jour uniquement les champs envoyés
      { new: true, runValidators: true }
    );

    if (!misAJour) {
      return res.status(404).json({ error: "Dialogue non trouvé" });
    }

    res.json(misAJour);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/dialogues/{id}/position:
 *   put:
 *     summary: Mettre à jour la position d'un dialogue
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du dialogue dont on veut mettre à jour la position
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - x
 *               - y
 *             properties:
 *               x:
 *                 type: number
 *                 description: Position horizontale
 *               y:
 *                 type: number
 *                 description: Position verticale
 *     responses:
 *       200:
 *         description: Position mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialogue'
 *       400:
 *         description: Erreur de validation
 */
app.put('/api/dialogues/:id/position', async (req, res) => {
  try {
    const { x, y } = req.body;
    const misAJour = await Dialogue.findByIdAndUpdate(
      req.params.id,
      { position: { x, y } },
      { new: true }
    );
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
    const id = req.params.id;
    await Dialogue.findByIdAndDelete(id);
    
    // Nettoyage des liens : on retire cet ID de tous les "nextDialogues" existants
    await Dialogue.updateMany(
      { nextDialogues: id },
      { $pull: { nextDialogues: id } }
    );

    res.json({ message: "Dialogue et liens supprimés" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


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
