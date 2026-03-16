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



/**
 * @swagger
 * tags:
 *   - name: Scenarios
 *     description: Opérations CRUD sur les scénarios
 *   - name: Dialogues
 *     description: Opérations CRUD sur les dialogues
 */

/**
 * @swagger
 * /api/scenarios:
 *   get:
 *     summary: Récupérer tous les scénarios
 *     tags: [Scenarios]
 *     responses:
 *       200:
 *         description: Liste de tous les scénarios triés par ID
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
 *             type: object
 *             required:
 *               - scenarioName
 *             properties:
 *               scenarioName:
 *                 type: string
 *                 example: "Mission Alpha"
 *     responses:
 *       201:
 *         description: Scénario créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scenario'
 *       400:
 *         description: scenarioName manquant ou erreur de validation
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
 * /api/scenarios/tree/save:
 *   post:
 *     summary: Sauvegarder l'état complet du whiteboard d'un scénario
 *     description: >
 *       Crée les nouveaux nœuds (id préfixé tmp_), met à jour les existants,
 *       supprime les nœuds retirés du whiteboard, et reconstruit toutes les
 *       connexions (nextDialogues). Retourne un idMap { tempId → realMongoId }
 *       pour que le frontend remplace ses IDs temporaires.
 *     tags: [Scenarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scenarioName
 *               - nodes
 *               - connections
 *             properties:
 *               scenarioName:
 *                 type: string
 *                 example: "Mission Alpha"
 *               nodes:
 *                 type: array
 *                 description: Tous les nœuds présents sur le whiteboard
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID MongoDB existant, ou ID temporaire (préfixe tmp_)
 *                       example: "tmp_1718000000000"
 *                     text:
 *                       type: string
 *                       example: "Bonjour !"
 *                     type:
 *                       type: string
 *                       enum: [npc, player]
 *                     locuteur:
 *                       type: string
 *                       example: "Professeur Dupont"
 *                     x:
 *                       type: number
 *                       example: 320
 *                     y:
 *                       type: number
 *                       example: 150
 *               connections:
 *                 type: array
 *                 description: Toutes les flèches entre nœuds
 *                 items:
 *                   type: object
 *                   properties:
 *                     fromId:
 *                       type: string
 *                       example: "tmp_1718000000000"
 *                     toId:
 *                       type: string
 *                       example: "664f1a2b3c4d5e6f7a8b9c1e"
 *     responses:
 *       200:
 *         description: Arbre sauvegardé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 idMap:
 *                   type: object
 *                   description: Correspondance tempId → _id MongoDB réel
 *                   additionalProperties:
 *                     type: string
 *       400:
 *         description: scenarioName manquant
 *       404:
 *         description: Scénario non trouvé
 *       500:
 *         description: Erreur serveur
 */
app.post('/api/scenarios/tree/save', async (req, res) => {
  try {
    const { scenarioName, nodes, connections } = req.body;
    if (!scenarioName) {
      return res.status(400).json({ error: "scenarioName est obligatoire" });
    }
    const scenario = await Scenario.findOne({ scenarioName });
    if (!scenario) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }
    const existingIds = nodes
      .filter(n => mongoose.Types.ObjectId.isValid(n.id))
      .map(n => n.id);
    await Dialogue.deleteMany({ scenarioName, _id: { $nin: existingIds } });

    const idMap = {};
    for (const node of nodes) {
      const isNew = !mongoose.Types.ObjectId.isValid(node.id);
      if (isNew) {
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
        await Dialogue.findByIdAndUpdate(node.id, {
          $set: {
            contenu: node.text || node.contenu,
            type: node.type,
            locuteur: node.locuteur || (node.type === 'npc' ? 'NPC' : 'Joueur'),
            position: { x: node.x ?? 100, y: node.y ?? 100 },
            nextDialogues: []
          }
        });
        idMap[node.id] = node.id;
      }
    }
    for (const conn of connections) {
      const fromId = idMap[conn.fromId] || conn.fromId;
      const toId   = idMap[conn.toId]   || conn.toId;
      if (mongoose.Types.ObjectId.isValid(fromId) && mongoose.Types.ObjectId.isValid(toId)) {
        await Dialogue.findByIdAndUpdate(fromId, { $addToSet: { nextDialogues: toId } });
      }
    }
    res.json({ message: "Arbre sauvegardé avec succès", idMap });
  } catch (err) {
    console.error('ERREUR tree/save :', err);
    res.status(500).json({ error: err.message });
  }
});



/**
 * @swagger
 * /api/scenarios/{scenarioName}/tree:
 *   get:
 *     summary: Récupérer l'arbre complet d'un scénario (nœuds + connexions)
 *     tags: [Scenarios]
 *     parameters:
 *       - in: path
 *         name: scenarioName
 *         required: true
 *         schema:
 *           type: string
 *         description: Le nom du scénario dont on veut récupérer l'arbre
 *         example: "Mission Alpha"
 *     responses:
 *       200:
 *         description: Arbre complet avec dialogues et connexions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dialogues:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: _id MongoDB (string)
 *                         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *                       text:
 *                         type: string
 *                         description: Alias de contenu, utilisé côté frontend
 *                         example: "Bonjour !"
 *                       contenu:
 *                         type: string
 *                         example: "Bonjour !"
 *                       type:
 *                         type: string
 *                         enum: [npc, player]
 *                       locuteur:
 *                         type: string
 *                         example: "Professeur Dupont"
 *                       scenarioName:
 *                         type: string
 *                       x:
 *                         type: number
 *                         example: 320
 *                       y:
 *                         type: number
 *                         example: 150
 *                 connections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fromId:
 *                         type: string
 *                         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *                       toId:
 *                         type: string
 *                         example: "664f1a2b3c4d5e6f7a8b9c1e"
 *       404:
 *         description: Scénario non trouvé
 *       500:
 *         description: Erreur serveur
 */
app.get('/api/scenarios/:scenarioName/tree', async (req, res) => {
  try {
    const { scenarioName } = req.params;
    const scenario = await Scenario.findOne({ scenarioName });
    if (!scenario) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }
    const dialogues = await Dialogue.find({ scenarioName });
    const connections = [];
    dialogues.forEach(d => {
      d.nextDialogues.forEach(childId => {
        connections.push({ fromId: d._id.toString(), toId: childId.toString() });
      });
    });
    const nodes = dialogues.map(d => ({
      id: d._id.toString(),
      _id: d._id.toString(),
      text: d.contenu,
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
 * /api/scenarios/{scenarioName}/dialogues:
 *   get:
 *     summary: Récupérer tous les dialogues d'un scénario
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: scenarioName
 *         required: true
 *         schema:
 *           type: string
 *         description: Le nom du scénario
 *         example: "Mission Alpha"
 *     responses:
 *       200:
 *         description: Liste des dialogues du scénario
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
    const dialogues = await Dialogue.find({ scenarioName: req.params.scenarioName });
    res.json(dialogues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/scenarios/{scenarioName}:
 *   delete:
 *     summary: Supprimer un scénario et tous ses dialogues associés
 *     tags: [Scenarios]
 *     parameters:
 *       - in: path
 *         name: scenarioName
 *         required: true
 *         schema:
 *           type: string
 *         description: Le nom exact du scénario à supprimer
 *         example: "Mission Alpha"
 *     responses:
 *       200:
 *         description: Scénario et dialogues supprimés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 scenario:
 *                   type: string
 *                 dialoguesSupprimes:
 *                   type: integer
 *       404:
 *         description: Scénario non trouvé
 *       500:
 *         description: Erreur serveur
 */
app.delete('/api/scenarios/:scenarioName', async (req, res) => {
  try {
    const { scenarioName } = req.params;
    const scenarioSupprime = await Scenario.findOneAndDelete({ scenarioName });

    if (!scenarioSupprime) {
      return res.status(404).json({ error: "Scénario non trouvé" });
    }

    const resultDialogues = await Dialogue.deleteMany({ scenarioName });

    // Renuméroter tous les scénarios restants par ordre alphabétique ou d'insertion
    const scenariosRestants = await Scenario.find().sort({ scenarioId: 1 });
    for (let i = 0; i < scenariosRestants.length; i++) {
      await Scenario.findByIdAndUpdate(scenariosRestants[i]._id, { scenarioId: i + 1 });
    }

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
 * /api/dialogue/{id}:
 *   get:
 *     summary: Récupérer un dialogue par son ID MongoDB
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID MongoDB du dialogue
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Dialogue trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialogue'
 *       404:
 *         description: Dialogue non trouvé
 *       500:
 *         description: Erreur serveur
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scenarioName
 *               - contenu
 *               - locuteur
 *             properties:
 *               scenarioName:
 *                 type: string
 *                 example: "Mission Alpha"
 *               contenu:
 *                 type: string
 *                 example: "Bonjour, comment vas-tu ?"
 *               locuteur:
 *                 type: string
 *                 example: "Professeur Dupont"
 *               type:
 *                 type: string
 *                 enum: [npc, player]
 *                 default: npc
 *               position:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                     example: 150
 *                   y:
 *                     type: number
 *                     example: 200
 *     responses:
 *       201:
 *         description: Dialogue créé avec succès
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
 *     summary: Mettre à jour un dialogue (tous les champs envoyés)
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID MongoDB du dialogue à mettre à jour
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contenu:
 *                 type: string
 *                 example: "Texte modifié"
 *               locuteur:
 *                 type: string
 *                 example: "Professeur Dupont"
 *               type:
 *                 type: string
 *                 enum: [npc, player]
 *               position:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *               nextDialogues:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Dialogue mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialogue'
 *       404:
 *         description: Dialogue non trouvé
 *       400:
 *         description: Erreur de validation
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
 *     summary: Mettre à jour uniquement la position d'un dialogue sur le whiteboard
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID MongoDB du dialogue
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
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
 *                 description: Position horizontale en pixels
 *                 example: 320
 *               y:
 *                 type: number
 *                 description: Position verticale en pixels
 *                 example: 150
 *     responses:
 *       200:
 *         description: Position mise à jour
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
 * /api/dialogues/{id}/link:
 *   patch:
 *     summary: Ajouter un lien vers un dialogue enfant (relation parent → enfant)
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID MongoDB du dialogue parent
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *             properties:
 *               childId:
 *                 type: string
 *                 description: L'ID MongoDB du dialogue enfant à lier
 *                 example: "664f1a2b3c4d5e6f7a8b9c1e"
 *     responses:
 *       200:
 *         description: Lien ajouté, dialogue parent retourné
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialogue'
 *       400:
 *         description: Erreur de validation
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID MongoDB du dialogue parent
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *             properties:
 *               childId:
 *                 type: string
 *                 description: L'ID MongoDB du dialogue enfant à délier
 *                 example: "664f1a2b3c4d5e6f7a8b9c1e"
 *     responses:
 *       200:
 *         description: Lien supprimé, dialogue parent retourné
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dialogue'
 *       404:
 *         description: Dialogue non trouvé
 *       400:
 *         description: Erreur de validation
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
 *     summary: Supprimer un dialogue et nettoyer tous ses liens entrants
 *     tags: [Dialogues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: L'ID MongoDB du dialogue à supprimer
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Dialogue et liens supprimés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 */
app.delete('/api/dialogues/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Dialogue.findByIdAndDelete(id);
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
 *         scenarioId:
 *           type: integer
 *           description: ID auto-incrémenté
 *           example: 1
 *         scenarioName:
 *           type: string
 *           description: Nom unique du scénario
 *           example: "Mission Alpha"
 *     Dialogue:
 *       type: object
 *       required:
 *         - scenarioName
 *         - contenu
 *         - locuteur
 *       properties:
 *         _id:
 *           type: string
 *           description: ID MongoDB auto-généré
 *           example: "664f1a2b3c4d5e6f7a8b9c0d"
 *         scenarioName:
 *           type: string
 *           description: Nom du scénario auquel ce dialogue appartient
 *           example: "Mission Alpha"
 *         contenu:
 *           type: string
 *           description: Texte du dialogue
 *           example: "Bonjour, comment vas-tu ?"
 *         locuteur:
 *           type: string
 *           description: Nom du personnage qui parle
 *           example: "Professeur Dupont"
 *         type:
 *           type: string
 *           enum: [npc, player]
 *           default: npc
 *           description: Type de personnage (npc = vert, player = bleu)
 *         position:
 *           type: object
 *           description: Position du nœud sur le whiteboard
 *           properties:
 *             x:
 *               type: number
 *               example: 320
 *             y:
 *               type: number
 *               example: 150
 *         nextDialogues:
 *           type: array
 *           description: IDs des dialogues suivants (enfants dans l'arbre)
 *           items:
 *             type: string
 *             example: "664f1a2b3c4d5e6f7a8b9c1e"
 */