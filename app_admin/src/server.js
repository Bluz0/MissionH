import express from 'express';
import path from "path";
import { fileURLToPath } from "url";

import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import Dialogue from './models/dialogueTree.js';
import Scenario from './models/scenario.js';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

// --- CONFIGURATION EXPRESS ---
const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

app.listen(3001, "0.0.0.0", () => {
  console.log(`Serveur lancé sur le port 3001`);
});

// --- SWAGGER ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mission H - API Dialogue',
      version: '1.0.0',
      description: 'Documentation Swagger interactive des scenarios et dialogues du jeu',
    },
    servers: [{ url: 'http://51.38.222.173' }],
  },
  apis: ['./src/server.js'],
};

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


// ============================================================
// ROUTES SCENARIOS
// ============================================================

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
 */
app.delete('/api/scenarios/:scenarioName', async (req, res) => {
  try {
    const { scenarioName } = req.params;

    const scenarioSupprime = await Scenario.findOneAndDelete({ scenarioName });

    if (!scenarioSupprime) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }

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


// ============================================================
// ROUTES ARBRE (WHITEBOARD) — NOUVELLES ROUTES CLÉS
// ============================================================

/**
 * @swagger
 * /api/scenarios/{scenarioName}/tree:
 *   get:
 *     summary: Récupérer l'arbre complet d'un scénario (dialogues + connexions)
 *     tags: [Scenarios]
 *     parameters:
 *       - in: path
 *         name: scenarioName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: >
 *           Retourne { dialogues, connections } où connections est reconstruit
 *           depuis les nextDialogues de chaque nœud.
 *       404:
 *         description: Scénario non trouvé
 */
app.get('/api/scenarios/:scenarioName/tree', async (req, res) => {
  try {
    const { scenarioName } = req.params;

    const scenario = await Scenario.findOne({ scenarioName });
    if (!scenario) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }

    const dialogues = await Dialogue.find({ scenarioName });

    // Reconstituer les connexions { fromId, toId } depuis nextDialogues
    const connections = [];
    dialogues.forEach(d => {
      d.nextDialogues.forEach(childId => {
        connections.push({
          fromId: d._id.toString(),
          toId: childId.toString()
        });
      });
    });

    // Mapper les dialogues au format attendu par le frontend
    const nodes = dialogues.map(d => ({
      id: d._id.toString(),       // ← string, pas ObjectId brut
      _id: d._id.toString(),
      text: d.contenu,            // ← "text" utilisé côté frontend
      contenu: d.contenu,
      type: d.type,
      locuteur: d.locuteur,
      scenarioName: d.scenarioName,
      x: d.position?.x ?? 100,
      y: d.position?.y ?? 100,
    }));

    res.json({ dialogues: nodes, connections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/scenarios/tree/save:
 *   post:
 *     summary: >
 *       Sauvegarder l'état complet du whiteboard d'un scénario
 *       (positions, connexions). Crée les nouveaux nœuds, met à jour
 *       les existants, nettoie les supprimés.
 *     tags: [Scenarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scenarioName:
 *                 type: string
 *               nodes:
 *                 type: array
 *               connections:
 *                 type: array
 *     responses:
 *       200:
 *         description: Arbre sauvegardé
 */
// IMPORTANT : cette route DOIT être définie avant /api/scenarios/:scenarioName
// pour éviter que "tree" soit interprété comme un scenarioName.
app.post('/api/scenarios/tree/save', async (req, res) => {
  try {
    const { scenarioName, nodes, connections } = req.body;

    if (!scenarioName) {
      return res.status(400).json({ error: "scenarioName est obligatoire" });
    }

    // Vérifier que le scénario existe
    const scenario = await Scenario.findOne({ scenarioName });
    if (!scenario) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }

    // IDs des nœuds envoyés par le frontend qui sont déjà en base (vrais ObjectId)
    const existingIds = nodes
      .filter(n => mongoose.Types.ObjectId.isValid(n.id))
      .map(n => n.id);

    // Supprimer les dialogues du scénario qui ne sont plus dans le whiteboard
    await Dialogue.deleteMany({
      scenarioName,
      _id: { $nin: existingIds }
    });

    // Upsert chaque nœud
    const idMap = {}; // tempId (Date.now) → _id MongoDB réel

    for (const node of nodes) {
      const isNew = !mongoose.Types.ObjectId.isValid(node.id);

      if (isNew) {
        // Créer un nouveau document
        const created = await Dialogue.create({
          scenarioName,
          contenu: node.text || node.contenu || '',
          locuteur: node.locuteur || (node.type === 'npc' ? 'NPC' : 'Joueur'),
          type: node.type || 'npc',
          position: { x: node.x ?? 100, y: node.y ?? 100 },
          nextDialogues: []
        });
        idMap[node.id] = created._id.toString();
      } else {
        // Mettre à jour la position et le contenu
        await Dialogue.findByIdAndUpdate(node.id, {
          $set: {
            contenu: node.text || node.contenu,
            type: node.type,
            locuteur: node.locuteur || (node.type === 'npc' ? 'NPC' : 'Joueur'),
            position: { x: node.x ?? 100, y: node.y ?? 100 },
            nextDialogues: [] // reset, on remet depuis connections ci-dessous
          }
        });
        idMap[node.id] = node.id;
      }
    }

    // Reconstruire les nextDialogues depuis connections
    for (const conn of connections) {
      const fromId = idMap[conn.fromId] || conn.fromId;
      const toId   = idMap[conn.toId]   || conn.toId;

      if (mongoose.Types.ObjectId.isValid(fromId) && mongoose.Types.ObjectId.isValid(toId)) {
        await Dialogue.findByIdAndUpdate(fromId, {
          $addToSet: { nextDialogues: toId }
        });
      }
    }

    res.json({ message: "Arbre sauvegardé avec succès", idMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================================================
// ROUTES DIALOGUES (CRUD individuel)
// ============================================================

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
 *     summary: Récupérer tous les dialogues d'un scénario (liste ordonnée)
 *     tags: [Dialogues]
 */
app.get('/api/scenarios/:scenarioName/dialogues', async (req, res) => {
  try {
    const scenario = await Scenario.findOne({ scenarioName: req.params.scenarioName });
    if (!scenario) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }
    const dialogues = await Dialogue.find({ scenarioName: req.params.scenarioName });
    res.json(dialogues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/dialogue/{id}:
 *  get:
 *   summary: Récupérer un dialogue par son ID
 *   tags: [Dialogues]
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
 * /api/dialogues:
 *   post:
 *     summary: Créer un nouveau dialogue
 *     tags: [Dialogues]
 */
app.post('/api/dialogues', async (req, res) => {
  try {
    const nouveauDialogue = new Dialogue({
      ...req.body,
      nextDialogues: [],
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
 *     summary: Mettre à jour un dialogue
 *     tags: [Dialogues]
 */
app.put('/api/dialogues/:id', async (req, res) => {
  try {
    const misAJour = await Dialogue.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
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
 * /api/dialogues/{id}/link:
 *   patch:
 *     summary: Lier un dialogue parent à un enfant
 *     tags: [Dialogues]
 */
app.patch('/api/dialogues/:id/link', async (req, res) => {
  try {
    const { childId } = req.body;
    const parent = await Dialogue.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { nextDialogues: childId } },
      { new: true }
    );
    res.json(parent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/dialogues/{id}/unlink:
 *   patch:
 *     summary: Supprimer le lien entre un dialogue parent et un enfant
 *     tags: [Dialogues]
 */
app.patch('/api/dialogues/:id/unlink', async (req, res) => {
  try {
    const { childId } = req.body;
    const parent = await Dialogue.findByIdAndUpdate(
      req.params.id,
      { $pull: { nextDialogues: childId } },
      { new: true }
    );
    if (!parent) {
      return res.status(404).json({ error: "Dialogue non trouvé" });
    }
    res.json(parent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/dialogues/{id}:
 *   delete:
 *     summary: Supprimer un dialogue et nettoyer ses liens
 *     tags: [Dialogues]
 */
app.delete('/api/dialogues/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Dialogue.findByIdAndDelete(id);

    // Nettoyer les références dans les autres dialogues
    await Dialogue.updateMany(
      { nextDialogues: id },
      { $pull: { nextDialogues: id } }
    );

    res.json({ message: "Dialogue et liens supprimés" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================================================
// SWAGGER SCHEMAS
// ============================================================

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
 *         scenarioId:
 *          type: integer
 *     Dialogue:
 *       type: object
 *       required:
 *         - scenarioName
 *         - contenu
 *         - locuteur
 *       properties:
 *         scenarioName:
 *           type: string
 *         contenu:
 *           type: string
 *         locuteur:
 *           type: string
 *         type:
 *           type: string
 *           enum: [npc, player]
 *         position:
 *           type: object
 *           properties:
 *             x: { type: number }
 *             y: { type: number }
 *         nextDialogues:
 *           type: array
 *           items:
 *             type: string
 */