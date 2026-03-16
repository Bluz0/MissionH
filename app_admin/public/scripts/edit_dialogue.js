// ============================================================
// CONFIGURATION & ÉTAT
// ============================================================
const serveur = "http://51.38.222.173";

let dialogues = [];       // [{ id (MongoDB _id string), text, type, locuteur, x, y }]
let connections = [];     // [{ fromId, toId }]
let currentEditId = null;

let isLinking = false;
let isUnlinking = false;
let firstNodeSelected = null;

// ============================================================
// ÉLÉMENTS DOM
// ============================================================
const modal             = document.getElementById('modal-edit-dialogue');
const listContainer     = document.getElementById('dialogue-list-container');
const btnAdd            = document.getElementById('btn-add-dialogue');
const btnClose          = document.getElementById('btn-close-edit');
const btnValidate       = document.getElementById('btn-validate-line');
const btnLink           = document.getElementById('btn-link');
const btnUnlink         = document.getElementById('btn-unlink');
const btnSaveAll        = document.getElementById('btn-save-all');
const canvasArea        = document.getElementById('canvas-area');
const whiteboard        = document.getElementById('whiteboard');
const svgCanvas         = document.getElementById('lines-svg');

const editText          = document.getElementById('edit-text');
const editLocuteur      = document.getElementById('edit-locuteur'); // <input> pour le nom du locuteur
const editType          = document.getElementById('edit-type');
const previewName       = document.getElementById('preview-name');
const previewText       = document.getElementById('preview-text');

// ============================================================
// CHARGEMENT DU SCÉNARIO
// ============================================================
const urlParams     = new URLSearchParams(window.location.search);
const scenarioTitle = urlParams.get('scenario');

if (scenarioTitle) {
    document.getElementById('scenario-title').innerText = scenarioTitle;
    loadScenarioData(scenarioTitle);
}

function loadScenarioData(title) {
    axios.get(`${serveur}/api/scenarios/${title}/tree`)
        .then(response => {
            if (response.data) {
                dialogues   = response.data.dialogues   || [];
                connections = response.data.connections || [];

                renderList();

                // Placer les cercles sur le whiteboard
                dialogues.forEach(d => {
                    if (d.x !== undefined && d.y !== undefined) {
                        createNodeOnBoard(d, d.x, d.y);
                    }
                });

                updateLines();
            }
        })
        .catch(() => {
            console.log("Nouveau scénario ou erreur de chargement. Page blanche.");
        });
}

// ============================================================
// PAN & ZOOM
// ============================================================
let scale = 1, offsetX = 0, offsetY = 0;
let isPanning = false, startX, startY;

const zoomIn   = document.getElementById('btn-zoom-in');
const zoomOut  = document.getElementById('btn-zoom-out');
const recenter = document.getElementById('btn-recenter');

function applyTransform() {
    whiteboard.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

zoomIn.addEventListener('click',   () => { scale += 0.1; applyTransform(); });
zoomOut.addEventListener('click',  () => { if (scale > 0.3) scale -= 0.1; applyTransform(); });
recenter.addEventListener('click', () => { scale = 1; offsetX = 0; offsetY = 0; applyTransform(); });

canvasArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = scale + delta;
    if (newScale > 0.2 && newScale < 3) { scale = newScale; applyTransform(); }
}, { passive: false });

canvasArea.addEventListener('mousedown', (e) => {
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

// ============================================================
// ÉDITEUR (MODAL)
// ============================================================

function openEditor(id = null) {
    currentEditId = id;
    if (id !== null) {
        const d = dialogues.find(item => item.id === id);
        editText.value     = d.text;
        editType.value     = d.type;
        if (editLocuteur) editLocuteur.value = d.locuteur || '';
    } else {
        editText.value     = "";
        editType.value     = "npc";
        if (editLocuteur) editLocuteur.value = "";
    }
    updatePreview();
    modal.classList.remove('hidden');
}

btnClose.addEventListener('click', () => modal.classList.add('hidden'));

function updatePreview() {
    previewText.innerText = editText.value || "Aperçu du texte...";
    const locuteurVal = editLocuteur ? editLocuteur.value : '';
    const isNPC       = editType.value === "npc";

    previewName.innerText    = locuteurVal || (isNPC ? "PROFESSEUR" : "JOUEUR");
    previewName.style.color  = isNPC ? "var(--swiss-green)" : "#007bff";
}

editText.addEventListener('input', updatePreview);
editType.addEventListener('change', updatePreview);
if (editLocuteur) editLocuteur.addEventListener('input', updatePreview);

// Valider la ligne (Ajout local — la sauvegarde API se fait via "Sauvegarder")
btnValidate.addEventListener('click', () => {
    if (editText.value.trim() === "") return alert("Le texte ne peut pas être vide");

    const locuteurVal = editLocuteur ? editLocuteur.value.trim() : '';
    const typeVal     = editType.value;
    const defaultLoc  = typeVal === 'npc' ? 'NPC' : 'Joueur';

    if (currentEditId !== null) {
        // Mise à jour locale
        const d = dialogues.find(d => d.id === currentEditId);
        d.text     = editText.value;
        d.type     = typeVal;
        d.locuteur = locuteurVal || defaultLoc;

        // Mettre à jour visuellement le cercle si déjà posé
        const node = document.getElementById(`node-${currentEditId}`);
        if (node) node.className = `node-circle node-${d.type}`;
    } else {
        // Nouveau dialogue (ID temporaire — sera remplacé lors de la sauvegarde)
        dialogues.push({
            id:       `tmp_${Date.now()}`,   // préfixe tmp_ pour distinguer les nouveaux
            text:     editText.value,
            type:     typeVal,
            locuteur: locuteurVal || defaultLoc,
            x:        undefined,
            y:        undefined
        });
    }

    modal.classList.add('hidden');
    renderList();
});

btnAdd.addEventListener('click', () => openEditor());

// ============================================================
// LISTE (SIDEBAR)
// ============================================================

function renderList() {
    listContainer.innerHTML = "";
    dialogues.forEach((d, index) => {
        const item      = document.createElement('div');
        item.className  = `draggable-dialogue ${d.type}`;
        item.draggable  = true;

        const maxLength  = 35;
        const displayText = d.text.length > maxLength
            ? d.text.substring(0, maxLength) + "..."
            : d.text;

        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span title="${d.text}"><strong>${index + 1}.</strong> ${displayText}</span>
                <div class="actions">
                    <button onclick="openEditor('${d.id}')" style="margin-right:5px; cursor:pointer; background:none; border:none;">✏️</button>
                    <button onclick="deleteLine('${d.id}')" style="cursor:pointer; background:none; border:none;">🗑️</button>
                </div>
            </div>
        `;

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData("dialogueId", d.id);
        });

        listContainer.appendChild(item);
    });
}

function refreshNodeNumbers() {
    dialogues.forEach((d, index) => {
        const node = document.getElementById(`node-${d.id}`);
        if (node) node.innerText = index + 1;
    });
}

function deleteLine(id) {
    if (!confirm("Supprimer cette ligne et toutes ses liaisons ?")) return;

    dialogues   = dialogues.filter(d => d.id !== id);
    connections = connections.filter(c => c.fromId !== id && c.toId !== id);

    const node = document.getElementById(`node-${id}`);
    if (node) node.remove();

    renderList();
    refreshNodeNumbers();
    updateLines();
}

// ============================================================
// WHITEBOARD — DRAG & DROP
// ============================================================

whiteboard.addEventListener('dragover', (e) => e.preventDefault());

whiteboard.addEventListener('drop', (e) => {
    e.preventDefault();
    const id      = e.dataTransfer.getData("dialogueId");
    const dialogue = dialogues.find(d => d.id == id);

    if (dialogue) {
        const rect = whiteboard.getBoundingClientRect();
        const x    = (e.clientX - rect.left) / scale - 30;
        const y    = (e.clientY - rect.top)  / scale - 30;
        createNodeOnBoard(dialogue, x, y);
    }
});

// ============================================================
// CRÉATION / MISE À JOUR D'UN NŒUD SUR LE WHITEBOARD
// ============================================================

function createNodeOnBoard(dialogue, x, y) {
    let node = document.getElementById(`node-${dialogue.id}`);

    if (!node) {
        node           = document.createElement('div');
        node.id        = `node-${dialogue.id}`;
        node.className = `node-circle node-${dialogue.type}`;

        const index    = dialogues.findIndex(d => d.id === dialogue.id) + 1;
        node.innerText = index;

        node.addEventListener('click', (e) => {
            // --- CAS 1 : SUPPRIMER UN LIEN ---
            if (isUnlinking) {
                if (!firstNodeSelected) {
                    firstNodeSelected    = dialogue.id;
                    node.style.border   = "5px solid red";
                } else {
                    removeConnection(firstNodeSelected, dialogue.id);
                    resetBorder(firstNodeSelected);
                    firstNodeSelected   = null;
                    isUnlinking         = false;
                    btnUnlink.innerText = "Supprimer lien";
                    btnUnlink.classList.remove('active-delete');
                }
                return;
            }

            // --- CAS 2 : CRÉER UN LIEN ---
            if (isLinking) {
                if (!firstNodeSelected) {
                    firstNodeSelected  = dialogue.id;
                    node.style.border  = "5px solid gold";
                } else {
                    if (firstNodeSelected !== dialogue.id) {
                        addConnection(firstNodeSelected, dialogue.id);
                    }
                    resetBorder(firstNodeSelected);
                    firstNodeSelected  = null;
                    isLinking          = false;
                    btnLink.innerText  = "Relier deux dialogues";
                    btnLink.classList.remove('green');
                }
            }
        });

        whiteboard.appendChild(node);
        makeNodeDraggable(node, dialogue);
    }

    node.style.left = `${x}px`;
    node.style.top  = `${y}px`;
    dialogue.x      = x;
    dialogue.y      = y;
    updateLines();
}

function resetBorder(id) {
    const n = document.getElementById(`node-${id}`);
    if (n) n.style.border = "3px solid var(--black)";
}

// ============================================================
// DÉPLACEMENT DES NŒUDS
// ============================================================

function makeNodeDraggable(node, dialogue) {
    let isDragging = false;
    let startMouseX, startMouseY, startNodeX, startNodeY;

    node.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDragging  = true;
        node.style.cursor = 'grabbing';
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startNodeX  = dialogue.x;
        startNodeY  = dialogue.y;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx   = (e.clientX - startMouseX) / scale;
        const dy   = (e.clientY - startMouseY) / scale;
        dialogue.x = startNodeX + dx;
        dialogue.y = startNodeY + dy;
        node.style.left = `${dialogue.x}px`;
        node.style.top  = `${dialogue.y}px`;
        updateLines();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging        = false;
            node.style.cursor = 'move';
        }
    });
}

// ============================================================
// LIAISONS (FLÈCHES SVG)
// ============================================================

btnLink.addEventListener('click', () => {
    isLinking = !isLinking;
    btnLink.classList.toggle('green');
    btnLink.innerText = isLinking ? "Cliquez sur 2 cercles..." : "Relier deux dialogues";
    firstNodeSelected = null;

    if (isLinking && isUnlinking) {
        isUnlinking = false;
        btnUnlink.classList.remove('active-delete');
        btnUnlink.innerText = "Supprimer lien";
    }
});

btnUnlink.addEventListener('click', () => {
    isUnlinking = !isUnlinking;
    btnUnlink.classList.toggle('active-delete');
    btnUnlink.innerText = isUnlinking ? "Cliquez sur 2 cercles..." : "Supprimer lien";

    if (isUnlinking && isLinking) {
        isLinking = false;
        btnLink.classList.remove('green');
        btnLink.innerText = "Relier deux dialogues";
        firstNodeSelected = null;
    }
});

function addConnection(fromId, toId) {
    const exists = connections.some(c => c.fromId === fromId && c.toId === toId);
    if (!exists) {
        connections.push({ fromId, toId });
        updateLines();
    }
}

function removeConnection(fromId, toId) {
    const before = connections.length;
    connections  = connections.filter(c => !(c.fromId === fromId && c.toId === toId));
    if (connections.length < before) {
        updateLines();
    } else {
        alert("Aucun lien n'existe entre ces deux dialogues.");
    }
}

function updateLines() {
    svgCanvas.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="7" markerHeight="5" refX="33" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill="black" />
            </marker>
        </defs>`;

    connections.forEach((conn) => {
        const from = dialogues.find(d => d.id === conn.fromId);
        const to   = dialogues.find(d => d.id === conn.toId);

        if (from && to && from.x !== undefined && to.x !== undefined) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", from.x + 30);
            line.setAttribute("y1", from.y + 30);
            line.setAttribute("x2", to.x   + 30);
            line.setAttribute("y2", to.y   + 30);
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("marker-end", "url(#arrowhead)");
            svgCanvas.appendChild(line);
        }
    });
}

// ============================================================
// SAUVEGARDE COMPLÈTE
// ============================================================

btnSaveAll.addEventListener('click', async () => {
    const payload = {
        scenarioName: scenarioTitle,
        nodes:        dialogues,
        connections:  connections
    };

    try {
        const response = await axios.post(`${serveur}/api/scenarios/tree/save`, payload);
        const { idMap } = response.data;

        // Mettre à jour les IDs temporaires (tmp_xxx) avec les vrais _id MongoDB
        if (idMap) {
            dialogues = dialogues.map(d => {
                if (idMap[d.id]) {
                    // Mettre à jour le nœud visuel (son id DOM)
                    const oldNode = document.getElementById(`node-${d.id}`);
                    if (oldNode) {
                        oldNode.id = `node-${idMap[d.id]}`;
                    }
                    // Mettre à jour les connexions qui pointaient vers l'ancien ID
                    connections = connections.map(c => ({
                        fromId: c.fromId === d.id ? idMap[d.id] : c.fromId,
                        toId:   c.toId   === d.id ? idMap[d.id] : c.toId
                    }));
                    return { ...d, id: idMap[d.id] };
                }
                return d;
            });
        }

        renderList();
        refreshNodeNumbers();
        alert("Scénario sauvegardé avec succès !");
    } catch (err) {
        console.error("Erreur sauvegarde :", err);
        alert("Erreur de connexion au serveur.");
    }
});