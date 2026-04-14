import express from 'express';
import path from "path";
import { fileURLToPath } from "url";

import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import Dialogue from './models/dialogueTree.js';
import Scenario from './models/scenario.js';
import NPCConfig from './models/npcConfig.js';

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
    servers: [{ url: 'http://82.165.32.184:3001', // Le serveur + port
    description: "Serveur de production (accès depuis l'admin et Unity)"
    
  }], 
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

// Route de login simple
app.post('/api/login', (req, res) => {
    const { password } = req.body;

    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true, token: "authorized_access_key" });
    } else {
        res.status(401).json({ success: false, message: "Mot de passe incorrect" });
    }
});

/**
 * @swagger
 * tags:
 *   - name: Scenarios
 *     description: Opérations CRUD sur les scénarios
 *   - name: Dialogues
 *     description: Opérations CRUD sur les dialogues
 *   - name: NPCs
 *     description: Association entre un NPC Unity et un scénario
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
 *               recap:
 *                 type: string
 *                 example: "Texte pédagogique récapitulatif à afficher dans l'éditeur"
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
    const { scenarioName, recap } = req.body;
    if (!scenarioName) {
      return res.status(400).json({ error: "Le nom du scénario est obligatoire" });
    }
    
    // On crée le scénario avec le recap s'il est fourni (sinon "" par défaut)
    const newScenario = new Scenario({ 
        scenarioName, 
        recap: recap || "" 
    });
    
    await newScenario.save();
    res.status(201).json(newScenario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



/**
 * @swagger
 * /api/scenarios/:oldName:
 *   put:
 *     summary: Renommer un scénario existant
 *     tags: [Scenarios]
 *     parameters:
 *       - name: oldName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newName
 *             properties:
 *               newName:
 *                 type: string
 *                 example: "Mission Beta"
 *     responses:
 *       200:
 *         description: Scénario renommé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scenario'
 *       404:
 *         description: Scénario non trouvé
 */
app.put('/api/scenarios/:oldName', async (req, res) => {
  try {
    const { newName } = req.body;
    const { oldName } = req.params;

    const scenario = await Scenario.findOneAndUpdate(
      { scenarioName: oldName },
      { scenarioName: newName },
      { new: true }
    );

    if (!scenario) return res.status(404).json({ error: "Scénario non trouvé" });

    await Dialogue.updateMany(
      { scenarioName: oldName },
      { $set: { scenarioName: newName } }
    );

    res.json({ message: "Scénario et dialogues renommés", scenario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /api/scenarios/tree/save:
 *   post:
 *     summary: Sauvegarder l'arbre complet d'un scénario (dialogues + connexions + recap)
 *     description:
 *       Sauvegarde l'état complet du whiteboard d'un scénario. Les nœuds (dialogues) peuvent être nouveaux (id temporaire avec préfixe tmp_) ou existants (MongoDB _id). Les connexions sont mises à jour automatiquement. Le texte récapitulatif est stocké dans le modèle Scenario.
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
 *                 description: Nom unique du scénario à mettre à jour
 *                 example: "Mission Alpha"
 *               nodes:
 *                 type: array
 *                 description: Liste des dialogues (nœuds) du whiteboard
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - text
 *                     - type
 *                     - locuteur
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID MongoDB (ObjectId string) pour dialogues existants, ou ID temporaire (tmp_*) pour nouveaux
 *                       example: "664f1a2b3c4d5e6f7a8b9c0d"
 *                     text:
 *                       type: string
 *                       description: Contenu du dialogue
 *                       example: "Bonjour !"
 *                     type:
 *                       type: string
 *                       enum: [npc, player]
 *                       description: Type de locuteur
 *                     locuteur:
 *                       type: string
 *                       description: Nom du personnage
 *                       example: "Professeur Dupont"
 *                     x:
 *                       type: number
 *                       description: Position horizontale sur le whiteboard
 *                       example: 320
 *                     y:
 *                       type: number
 *                       description: Position verticale sur le whiteboard
 *                       example: 150
 *               connections:
 *                 type: array
 *                 description: Liste des flèches entre dialogues (parent → enfant)
 *                 items:
 *                   type: object
 *                   required:
 *                     - fromId
 *                     - toId
 *                   properties:
 *                     fromId:
 *                       type: string
 *                       description: ID du dialogue parent
 *                       example: "664f1a2b3c4d5e6f7a8b9c0d"
 *                     toId:
 *                       type: string
 *                       description: ID du dialogue enfant
 *                       example: "664f1a2b3c4d5e6f7a8b9c1e"
 *               recap:
 *                 type: string
 *                 description: Texte récapitulatif pédagogique (stocké dans Scenario)
 *                 example: "Voici les points clés à retenir..."
 *     responses:
 *       200:
 *         description: Arbre et informations sauvegardés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Arbre et récapitulatif sauvegardés avec succès"
 *                 idMap:
 *                   type: object
 *                   description: Mapping des IDs temporaires (tmp_*) vers les vrais MongoDB ObjectId
 *                   additionalProperties:
 *                     type: string
 *                   example: { "tmp_1718000000000": "664f1a2b3c4d5e6f7a8b9c0d" }
 *       400:
 *         description: scenarioName manquant ou données invalides
 *       404:
 *         description: Scénario non trouvé
 *       500:
 *         description: Erreur serveur
 */
app.post('/api/scenarios/tree/save', async (req, res) => {
  try {
    const { scenarioName, nodes, connections, recap } = req.body;

    if (!scenarioName) {
      return res.status(400).json({ error: "scenarioName est obligatoire" });
    }

    const scenario = await Scenario.findOneAndUpdate(
      { scenarioName },
      { $set: { recap: recap || "" } },
      { new: true }
    );

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

    res.json({ message: "Arbre et récapitulatif sauvegardés avec succès", idMap });
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
 *                 recap:
 *                   type: string
 *                   description: Texte récapitulatif pédagogique du scénario
 *                   example: "Voici ce qu'il fallait retenir..."
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
    res.json({ 
      dialogues: nodes, 
      connections: connections,
      recap: scenario.recap || "" 
    });
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
  * /api/npc:
  *   get:
  *     summary: Récupérer toutes les associations NPC -> scénario
  *     tags: [NPCs]
  *     description: Retourne la liste de toutes les configurations NPC enregistrées (npcId défini manuellement, non auto-incrémenté).
  *     responses:
  *       200:
  *         description: Liste des configurations NPC
  *         content:
  *           application/json:
  *             schema:
  *               type: array
  *               items:
  *                 $ref: '#/components/schemas/NPCConfig'
  *             example:
  *               - npcId: "12"
  *                 scenarioName: "Mission Alpha"
  *               - npcId: "13"
  *                 scenarioName: "Mission Beta"
  *       500:
  *         description: Erreur serveur
  */
app.get('/api/npc', async (req, res) => {
  try {
    const configs = await NPCConfig.find(); // Récupère tous les NPCs en base
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /api/npc/{npcId}/config:
 *   get:
 *     summary: Récupérer la configuration d'un NPC par son ID
 *     tags: [NPCs]
 *     parameters:
 *       - in: path
 *         name: npcId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du NPC côté Unity (champ npcId). Cet ID n'est pas auto-incrémenté et doit être défini manuellement.
 *         example: "12"
 *     responses:
 *       200:
 *         description: Configuration trouvée, ou objet avec scenarioName = null si aucune association n'existe
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/NPCConfig'
 *                 - type: object
 *                   properties:
 *                     scenarioName:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       500:
 *         description: Erreur serveur
 */
app.get('/api/npc/:npcId/config', async (req, res) => {
  try {
    const { npcId } = req.params;
    const { name } = req.query; 

    // On cherche si le PNJ existe déjà
    let config = await NPCConfig.findOne({ npcId });

    // S'il n'existe pas, on le crée
    if (!config) {
      config = await NPCConfig.create({ 
        npcId, 
        npcName: name || "Nouveau PNJ", 
        scenarioName: null 
      });
      console.log(`Nouveau PNJ enregistré : ${config.npcName}`);
    }

    // On renvoie la config
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/npc/{npcId}/scenario:
 *   put:
 *     summary: Associer (ou mettre à jour) le scénario d'un NPC
 *     tags: [NPCs]
 *     parameters:
 *       - in: path
 *         name: npcId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du NPC côté Unity (champ npcId). Cet ID n'est pas auto-incrémenté et doit être défini manuellement.
 *         example: "12"
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
 *                 description: Nom du scénario à associer à ce NPC
 *                 example: "Mission Alpha"
 *     responses:
 *       200:
 *         description: Association NPC -> scénario créée ou mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NPCConfig'
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
app.put('/api/npc/:npcId/scenario', async (req, res) => {
  const { scenarioName } = req.body;
  const config = await NPCConfig.findOneAndUpdate(
    { npcId: req.params.npcId },
    { scenarioName },
    { upsert: true, new: true }
  );
  res.json(config);
});



/**
 * @swagger
 * /api/npc/{npcId}/name:
 *   put:
 *     summary: Mettre à jour le nom d'un NPC
 *     tags: [NPCs]
 *     parameters:
 *       - in: path
 *         name: npcId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du NPC côté Unity (champ npcId)
 *         example: "12"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - npcName
 *             properties:
 *               npcName:
 *                 type: string
 *                 description: Nouveau nom du NPC à enregistrer
 *                 example: "Professeur Dupont"
 *     responses:
 *       200:
 *         description: Nom du NPC mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NPCConfig'
 *       500:
 *         description: Erreur serveur
 */
app.put('/api/npc/:npcId/name', async (req, res) => {
  try {
    const { npcName } = req.body;
    const config = await NPCConfig.findOneAndUpdate(
      { npcId: req.params.npcId },
      { npcName },
      { new: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * components:
 *   schemas:
 *     NPCConfig:
 *       type: object
 *       required:
 *         - npcId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID MongoDB auto-généré
 *           example: "6650ab12c3d4e5f678901234"
 *         npcId:
 *           type: string
 *           description: ID du NPC côté Unity (champ npcId), défini manuellement dans l'Inspector (non auto-incrémenté)
 *           example: "12"
 *         npcName:
 *           type: string
 *           description: Nom du NPC
 *           example: "Professeur Dupont"
 *         scenarioName:
 *           type: string
 *           nullable: true
 *           description: Nom du scénario associé au NPC, ou null si non assigné
 *           example: "Mission Alpha"
 *         __v:
 *           type: integer
 *           description: Version interne MongoDB
 *           example: 0
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
 *         recap:
 *           type: string
 *           description: Texte récapitulatif pédagogique associé au scénario
 *           example: "Résumé des points clés à retenir pour cette mission"
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