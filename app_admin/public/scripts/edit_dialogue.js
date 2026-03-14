// --- CONFIGURATION & ETAT ---
const serveur = "http://51.38.222.173";
let dialogues = []; 
let currentEditId = null;

let isLinking = false;
let firstNodeSelected = null;
let connections = []; // Stocke les liaisons { fromId, toId }

// --- ELEMENTS DOM ---
const modal = document.getElementById('modal-edit-dialogue');
const listContainer = document.getElementById('dialogue-list-container');
const btnAdd = document.getElementById('btn-add-dialogue');
const btnClose = document.getElementById('btn-close-edit');
const btnValidate = document.getElementById('btn-validate-line');

const editText = document.getElementById('edit-text');
const editType = document.getElementById('edit-type');
const previewName = document.getElementById('preview-name');
const previewText = document.getElementById('preview-text');

// --- CHARGEMENT DU SCÉNARIO ---
const urlParams = new URLSearchParams(window.location.search);
const scenarioTitle = urlParams.get('scenario');

if (scenarioTitle) {
    // On affiche uniquement le nom pour que ce soit plus élégant
    document.getElementById('scenario-title').innerText = scenarioTitle;
    loadScenarioData(scenarioTitle);
}

function loadScenarioData(title) {
    // On va chercher si un arbre existe déjà pour ce scénario
    axios.get(`${serveur}/api/scenarios/${title}/tree`)
        .then(response => {
            if (response.data) {
                // Si des données existent, on remplit nos variables locales
                dialogues = response.data.dialogues || [];
                connections = response.data.connections || [];
                
                // On affiche tout sur le whiteboard
                renderList();
                dialogues.forEach(d => {
                    if (d.x !== undefined && d.y !== undefined) {
                        createNodeOnBoard(d, d.x, d.y);
                    }
                });
                updateLines();
            }
        })
        .catch(error => {
            console.log("Nouveau scénario ou erreur de chargement. On part d'une page blanche.");
        });
}

// --- CONFIG PAN & ZOOM ---
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isPanning = false;
let startX, startY;

const canvasArea = document.getElementById('canvas-area');
const zoomIn = document.getElementById('btn-zoom-in');
const zoomOut = document.getElementById('btn-zoom-out');
const recenter = document.getElementById('btn-recenter');

// --- LOGIQUE ÉDITION ---

// Ouvre la vue édition
function openEditor(id = null) {
    currentEditId = id;
    if (id !== null) {
        const d = dialogues.find(item => item.id === id);
        editText.value = d.text;
        editType.value = d.type;
    } else {
        editText.value = "";
        editType.value = "npc";
    }
    updatePreview();
    modal.classList.remove('hidden');
}

// Ferme la vue édition
btnClose.addEventListener('click', () => modal.classList.add('hidden'));

// Mise à jour de l'aperçu Unity en temps réel
function updatePreview() {
    previewText.innerText = editText.value || "Aperçu du texte...";
    const isNPC = editType.value === "npc";
    previewName.innerText = isNPC ? "PROFESSEUR" : "JOUEUR";
    previewName.style.color = isNPC ? "var(--swiss-green)" : "#007bff";
}

editText.addEventListener('input', updatePreview);
editType.addEventListener('change', updatePreview);

// Valide la ligne (Ajout ou Modif)
btnValidate.addEventListener('click', () => {
    if (editText.value.trim() === "") return alert("Le texte ne peut pas être vide");

    if (currentEditId !== null) {
        const index = dialogues.findIndex(d => d.id === currentEditId);
        dialogues[index].text = editText.value;
        dialogues[index].type = editType.value;
    } else {
        dialogues.push({
            id: Date.now(), // ID unique temporaire
            text: editText.value,
            type: editType.value
        });
    }

    modal.classList.add('hidden');
    renderList();
});

// --- AFFICHAGE LISTE ---

function renderList() {
    listContainer.innerHTML = "";
    dialogues.forEach((d, index) => {
        const item = document.createElement('div');
        item.className = `draggable-dialogue ${d.type}`;
        item.draggable = true;

        // Texte tronqué pour la liste
        const maxLength = 35;
        const displayLines = d.text.length > maxLength ? d.text.substring(0, maxLength) + "..." : d.text;

        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span title="${d.text}"><strong>${index + 1}.</strong> ${displayLines}</span>
                <div class="actions">
                    <button onclick="openEditor(${d.id})" style="margin-right:5px; cursor:pointer; background:none; border:none;">✏️</button>
                    <button onclick="deleteLine(${d.id})" style="cursor:pointer; background:none; border:none;">🗑️</button>
                </div>
            </div>
        `;

        // DRAG START : On prépare l'ID pour le lâcher sur le tableau
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData("dialogueId", d.id);
        });

        listContainer.appendChild(item);
    });
}

function refreshNodeNumbers() {
    dialogues.forEach((d, index) => {
        const node = document.getElementById(`node-${d.id}`);
        if (node) {
            // On met à jour le texte du cercle avec son nouvel index + 1
            node.innerText = index + 1;
        }
    });
}

function deleteLine(id) {
    if(confirm("Supprimer cette ligne et toutes ses liaisons ?")) {
        // 1. Supprimer du tableau de données
        dialogues = dialogues.filter(d => d.id !== id);

        // 2. Supprimer les liaisons associées (entrantes ou sortantes)
        connections = connections.filter(c => c.fromId !== id && c.toId !== id);

        // 3. Supprimer l'élément visuel du tableau blanc s'il existe
        const node = document.getElementById(`node-${id}`);
        if(node) node.remove();

        // 4. Rafraîchir tout
        renderList();          // Met à jour la liste de droite
        refreshNodeNumbers();  // Met à jour les cercles à gauche
        updateLines();         // Met à jour les flèches
    }
}

btnAdd.addEventListener('click', () => openEditor());

// --- INITIALISATION ---
// Ici, plus tard, on chargera les dialogues existants depuis l'API scénario
renderList();

// --- GESTION DU TABLEAU BLANC (WHITEBOARD) ---

const whiteboard = document.getElementById('whiteboard');

// Autoriser le drop sur le tableau
whiteboard.addEventListener('dragover', (e) => {
    e.preventDefault(); 
});

whiteboard.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("dialogueId");
    const dialogue = dialogues.find(d => d.id == id);

    if (dialogue) {
        const rect = whiteboard.getBoundingClientRect();
        // On divise par scale pour que la bulle apparaisse là où est la souris peu importe le zoom
        const x = (e.clientX - rect.left) / scale - 30;
        const y = (e.clientY - rect.top) / scale - 30;

        createNodeOnBoard(dialogue, x, y);
    }
});

function createNodeOnBoard(dialogue, x, y) {
    // Vérifier si le cercle existe déjà (on le déplace) ou si on le crée
    let node = document.getElementById(`node-${dialogue.id}`);
    
    if (!node) {
        node = document.createElement('div');
        node.id = `node-${dialogue.id}`;
        node.className = `node-circle node-${dialogue.type}`;
        
        // Trouver l'index pour afficher le numéro (comme dans ta maquette)
        const index = dialogues.findIndex(d => d.id === dialogue.id) + 1;
        node.innerText = index;

        whiteboard.appendChild(node);
        
        // Rendre le cercle déplaçable une fois posé
        makeNodeDraggable(node, dialogue);
    }

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    
    // Sauvegarder la position dans l'objet dialogue
    dialogue.x = x;
    dialogue.y = y;
}

// Fonction pour déplacer les cercles à la souris
function makeNodeDraggable(node, dialogue) {
    let isDragging = false;
    let startMouseX, startMouseY;
    let startNodeX, startNodeY;

    node.addEventListener('mousedown', (e) => {
        // Empêche le "Pan" du tableau de se déclencher en même temps
        e.stopPropagation(); 
        
        isDragging = true;
        node.style.cursor = 'grabbing';

        // On enregistre la position de départ de la souris et du node
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startNodeX = dialogue.x;
        startNodeY = dialogue.y;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        // CALCUL CRUCIAL : 
        // On calcule la distance parcourue par la souris (delta) 
        // ET on la divise par le scale actuel pour garder le cercle sous le curseur
        const dx = (e.clientX - startMouseX) / scale;
        const dy = (e.clientY - startMouseY) / scale;

        let newX = startNodeX + dx;
        let newY = startNodeY + dy;

        // Mise à jour visuelle
        node.style.left = `${newX}px`;
        node.style.top = `${newY}px`;
        
        // Mise à jour des données
        dialogue.x = newX;
        dialogue.y = newY;
        
        updateLines(); 
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            node.style.cursor = 'move';
        }
    });
}

// --- LOGIQUE DES LIENS (FLÈCHES) ---

const btnLink = document.getElementById('btn-link');
const svgCanvas = document.getElementById('lines-svg');

// Activer/Désactiver le mode lien
btnLink.addEventListener('click', () => {
    isLinking = !isLinking;
    btnLink.classList.toggle('green'); // Change la couleur du bouton pour montrer qu'il est actif
    btnLink.innerText = isLinking ? "Cliquez sur 2 cercles..." : "Relier deux dialogues";
    firstNodeSelected = null;
});

// Modifier la fonction createNodeOnBoard pour ajouter le clic de liaison
// Remplace la partie où tu crées le node (dans le if(!node)) par ceci :
function createNodeOnBoard(dialogue, x, y) {
    let node = document.getElementById(`node-${dialogue.id}`);
    
    if (!node) {
        node = document.createElement('div');
        node.id = `node-${dialogue.id}`;
        node.className = `node-circle node-${dialogue.type}`;
        const index = dialogues.findIndex(d => d.id === dialogue.id) + 1;
        node.innerText = index;

        // --- GESTION DU CLIC POUR LIER ---
        node.addEventListener('click', (e) => {
            if (!isLinking) return;

            if (!firstNodeSelected) {
                // Premier clic
                firstNodeSelected = dialogue.id;
                node.style.border = "5px solid gold"; // Feedback visuel
            } else {
                // Deuxième clic
                if (firstNodeSelected !== dialogue.id) {
                    addConnection(firstNodeSelected, dialogue.id);
                }
                // Réinitialisation
                document.getElementById(`node-${firstNodeSelected}`).style.border = "3px solid var(--black)";
                firstNodeSelected = null;
                isLinking = false;
                btnLink.innerText = "Relier deux dialogues";
                btnLink.classList.remove('green');
            }
        });

        whiteboard.appendChild(node);
        makeNodeDraggable(node, dialogue);
    }

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    dialogue.x = x;
    dialogue.y = y;
    updateLines(); // On redessine tout
}

function addConnection(fromId, toId) {
    // Éviter les doublons
    const exists = connections.some(c => c.fromId === fromId && c.toId === toId);
    if (!exists) {
        connections.push({ fromId, toId });
        updateLines();
    }
}

// Fonction pour dessiner les lignes SVG
function updateLines() {
    svgCanvas.innerHTML = ''; 
    
    // On redéfinit le marker (car innerHTML='' l'efface)
    svgCanvas.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="7" markerHeight="5" refX="33" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill="black" />
            </marker>
        </defs>`;

    connections.forEach((conn) => {
        const fromDialogue = dialogues.find(d => d.id === conn.fromId);
        const toDialogue = dialogues.find(d => d.id === conn.toId);

        if (fromDialogue && toDialogue) {
            // On ajoute 30 pour partir du centre du cercle (diamètre 60 / 2).
            
            const startX = fromDialogue.x + 30;
            const startY = fromDialogue.y + 30;
            const endX = toDialogue.x + 30;
            const endY = toDialogue.y + 30;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", startX);
            line.setAttribute("y1", startY);
            line.setAttribute("x2", endX);
            line.setAttribute("y2", endY);
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("marker-end", "url(#arrowhead)");
            
            svgCanvas.appendChild(line);
        }
    });
}

// --- LOGIQUE DE SUPPRESSION GLOBALE ---

let isUnlinking = false; // Nouvel état pour la suppression de lien
const btnUnlink = document.getElementById('btn-unlink');

btnUnlink.addEventListener('click', () => {
    isUnlinking = !isUnlinking;
    
    // Feedback visuel
    btnUnlink.classList.toggle('active-delete');
    btnUnlink.innerText = isUnlinking ? "Cliquez sur 2 cercles..." : "Supprimer lien";

    // Désactiver le mode liaison si on active la suppression
    if (isUnlinking && isLinking) {
        isLinking = false;
        btnLink.classList.remove('green');
        btnLink.innerText = "Relier deux dialogues";
        firstNodeSelected = null;
    }
});

// MODIFICATION DE LA LOGIQUE DE CLIC DANS createNodeOnBoard
function createNodeOnBoard(dialogue, x, y) {
    let node = document.getElementById(`node-${dialogue.id}`);
    
    if (!node) {
        node = document.createElement('div');
        node.id = `node-${dialogue.id}`;
        node.className = `node-circle node-${dialogue.type}`;
        const index = dialogues.findIndex(d => d.id === dialogue.id) + 1;
        node.innerText = index;

        node.addEventListener('click', (e) => {
            // --- CAS 1 : SUPPRIMER UN LIEN ---
            if (isUnlinking) {
                if (!firstNodeSelected) {
                    firstNodeSelected = dialogue.id;
                    node.style.border = "5px solid red"; // Feedback visuel suppression
                } else {
                    removeConnection(firstNodeSelected, dialogue.id);
                    // Reset
                    document.getElementById(`node-${firstNodeSelected}`).style.border = "3px solid var(--black)";
                    firstNodeSelected = null;
                    isUnlinking = false;
                    btnUnlink.innerText = "Supprimer lien";
                    btnUnlink.classList.remove('active-delete');
                }
                return;
            }

            // --- CAS 2 : CRÉER UN LIEN (Ton code existant) ---
            if (isLinking) {
                if (!firstNodeSelected) {
                    firstNodeSelected = dialogue.id;
                    node.style.border = "5px solid gold";
                } else {
                    if (firstNodeSelected !== dialogue.id) {
                        addConnection(firstNodeSelected, dialogue.id);
                    }
                    document.getElementById(`node-${firstNodeSelected}`).style.border = "3px solid var(--black)";
                    firstNodeSelected = null;
                    isLinking = false;
                    btnLink.innerText = "Relier deux dialogues";
                    btnLink.classList.remove('green');
                }
            }
        });

        whiteboard.appendChild(node);
        makeNodeDraggable(node, dialogue);
    }

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    dialogue.x = x;
    dialogue.y = y;
}

// FONCTION POUR SUPPRIMER LA CONNEXION
function removeConnection(fromId, toId) {
    const initialLength = connections.length;
    // On filtre pour enlever la connexion dans les deux sens possibles (si besoin)
    // Mais ici, ton jeu est orienté (A vers B), donc on cherche le lien exact
    connections = connections.filter(c => !(c.fromId === fromId && c.toId === toId));
    
    if (connections.length < initialLength) {
        updateLines();
    } else {
        alert("Aucun lien n'existe entre ces deux dialogues.");
    }
}

// Appliquer les transformations (Position + Zoom)
function applyTransform() {
    whiteboard.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

// --- LOGIQUE ZOOM ---
zoomIn.addEventListener('click', () => { scale += 0.1; applyTransform(); });
zoomOut.addEventListener('click', () => { if(scale > 0.3) scale -= 0.1; applyTransform(); });
recenter.addEventListener('click', () => { scale = 1; offsetX = 0; offsetY = 0; applyTransform(); });

// Zoom à la molette (Optionnel mais très pratique)
canvasArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = scale + delta;
    if (newScale > 0.2 && newScale < 3) {
        scale = newScale;
        applyTransform();
    }
}, { passive: false });

// --- LOGIQUE PAN (Déplacement du tableau) ---
canvasArea.addEventListener('mousedown', (e) => {
    // On ne déplace le tableau que si on ne clique pas sur un bouton ou un cercle
    if (e.target === canvasArea || e.target === whiteboard || e.target.id === 'lines-svg') {
        isPanning = true;
        canvasArea.style.cursor = 'grabbing';
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    applyTransform();
});

document.addEventListener('mouseup', () => {
    isPanning = false;
    canvasArea.style.cursor = 'grab';
});

// Bouton sauvegarde
document.getElementById('btn-save-all').addEventListener('click', () => {
    const dataToSave = {
        scenarioName: scenarioTitle, // Récupéré de l'URL
        nodes: dialogues,           // Tes objets cercles
        connections: connections    // Tes objets flèches
    };

    axios.post(`${serveur}/api/scenarios/tree/save`, dataToSave)
        .then(() => alert("Scénario sauvegardé avec succès !"))
        .catch(err => console.error("Erreur sauvegarde :", err));
});

const btnSaveAll = document.getElementById('btn-save-all');

btnSaveAll.addEventListener('click', () => {
    // On regroupe tout ce qu'on a fait sur le tableau blanc
    const payload = {
        scenarioName: scenarioTitle, 
        nodes: dialogues,           
        connections: connections    
    };

    axios.post(`${serveur}/api/scenarios/tree/save`, payload)
        .then(response => {
            alert("Scénario sauvegardé avec succès !");
        })
        .catch(err => {
            console.error("Erreur sauvegarde :", err);
            alert("Erreur de connexion au serveur.");
        });
});