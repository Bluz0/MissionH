// Vérification de session au chargement de la page
if (localStorage.getItem('admin_session') !== 'authorized_access_key') {
    window.location.href = 'login.html';
}
const serveur = "http://82.165.32.184";

let dialogues = [];
let connections = [];
let currentEditId = null;

let isLinking = false;
let isUnlinking = false;
let firstNodeSelected = null;

let scenarioRecap = "";

const modal = document.getElementById('modal-edit-dialogue');
const listContainer = document.getElementById('dialogue-list-container');
const btnAdd = document.getElementById('btn-add-dialogue');
const btnClose = document.getElementById('btn-close-edit');
const btnValidate = document.getElementById('btn-validate-line');
const btnLink = document.getElementById('btn-link');
const btnUnlink = document.getElementById('btn-unlink');
const btnSaveAll = document.getElementById('btn-save-all');
const canvasArea = document.getElementById('canvas-area');
const whiteboard = document.getElementById('whiteboard');
const svgCanvas = document.getElementById('lines-svg');

const editText = document.getElementById('edit-text');
const editLocuteur = document.getElementById('edit-locuteur');
const editType = document.getElementById('edit-type');
const previewName = document.getElementById('preview-name');
const previewText = document.getElementById('preview-text');

const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

const btnRecap = document.getElementById('btn-recap');
const modalRecap = document.getElementById('modal-recap');
const btnCloseRecap = document.getElementById('close-recap');
const btnSaveRecapLocal = document.getElementById('save-recap-local');

/**
 * Affiche une notification toast dans l'interface.
 *
 * @param {string} message - Message à afficher.
 * @param {'success'|'error'|'info'|'warning'} [type='info'] - Type visuel du toast.
 * @param {number} [duration=3500] - Durée d'affichage en millisecondes (0 pour persistant).
 * @returns {HTMLDivElement} Élément DOM du toast créé.
 */
function showToast(message, type = 'info', duration = 100) {
    const icons = { success: 'OK', error: 'X', info: 'ℹ', warning: '⚠︎' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    toastContainer.appendChild(toast);

    // Le double rAF est nécessaire pour que le navigateur applique opacity:0 avant la transition
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    if (duration > 0) {
        setTimeout(() => {
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, duration);
    }

    return toast;
}


const confirmOverlay = document.createElement('div');
confirmOverlay.id = 'confirm-overlay';
confirmOverlay.innerHTML = `
    <div class="confirm-box">
        <div class="confirm-icon" id="confirm-icon">🗑️</div>
        <div class="confirm-title" id="confirm-title">Confirmer</div>
        <div class="confirm-message" id="confirm-message"></div>
        <div class="confirm-actions">
            <button class="btn btn-outline press-effect" id="confirm-cancel">Annuler</button>
            <button class="btn btn-black press-effect" id="confirm-ok">Confirmer</button>
        </div>
    </div>
`;
document.body.appendChild(confirmOverlay);

/**
 * Ouvre une modale de confirmation et retourne le choix utilisateur.
 *
 * @param {string} message - Message de confirmation.
 * @param {{title?: string, icon?: string, okLabel?: string, okClass?: string}} [options={}] - Options d'affichage du dialogue.
 * @returns {Promise<boolean>} Résout à true si confirmé, sinon false.
 */
function showConfirm(message, { title = 'Confirmer', icon = '🗑️', okLabel = 'Confirmer', okClass = 'btn-black' } = {}) {
    return new Promise((resolve) => {
        document.getElementById('confirm-icon').textContent = icon;
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;

        const btnOk = document.getElementById('confirm-ok');
        const btnCancel = document.getElementById('confirm-cancel');

        // Clone pour retirer les anciens listeners
        const newOk = btnOk.cloneNode(true);
        const newCancel = btnCancel.cloneNode(true);
        btnOk.replaceWith(newOk);
        btnCancel.replaceWith(newCancel);

        newOk.textContent = okLabel;
        newOk.className = `btn ${okClass} press-effect`;

        function close(result) {
            confirmOverlay.classList.remove('show');
            resolve(result);
        }

        document.getElementById('confirm-ok').addEventListener('click', () => close(true));
        document.getElementById('confirm-cancel').addEventListener('click', () => close(false));

        confirmOverlay.classList.add('show');
    });
}

const urlParams = new URLSearchParams(window.location.search);
const scenarioTitle = urlParams.get('scenario');

if (scenarioTitle) {
    document.getElementById('scenario-title').innerText = scenarioTitle;
    loadScenarioData(scenarioTitle);
}

/**
 * Charge les données d'un scénario (dialogues + connexions) depuis l'API,
 * puis reconstruit la liste et les nœuds sur le tableau.
 *
 * @param {string} title - Nom du scénario à charger.
 * @returns {void}
 */
function loadScenarioData(title) {
    axios.get(`${serveur}/api/scenarios/${title}/tree`)
        .then(response => {
            if (response.data) {
                dialogues = response.data.dialogues || [];
                connections = response.data.connections || [];
                scenarioRecap = response.data.recap || "";
                renderList();

                dialogues.forEach(d => {
                    if (d.x !== undefined && d.y !== undefined) {
                        let newX = d.x;
                        let newY = d.y;
                        // Si le cercle est dans la zone de l'ancien système (autour de 2500)
                        // on le décale pour le nouveau système (autour de 7500)
                        //if (newX < 7500) newX += 7500;
                        //if (newY < 7500) newY += 7500;

                        createNodeOnBoard(d, newX, newY);
                    }
                });

                updateLines();
            }
        })
        .catch(() => {
            console.log("Nouveau scénario ou erreur de chargement. Page blanche.");
        });
}

// 1. Déclaration des variables d'état (Indispensables pour le déplacement)
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;

// 2. Sélection des éléments (Assure-toi que ces IDs existent bien dans ton HTML)
const recenter = document.getElementById('btn-recenter');

/**
 * Applique la translation et le zoom courant sur le style CSS.
 */
function applyTransform() {
    whiteboard.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

// --- ÉVÉNEMENTS ZOOM ---

if (recenter) recenter.addEventListener('click', () => {
    scale = 1;
    offsetX = 0;
    offsetY = 0;
    applyTransform();
});

// --- ÉVÉNEMENTS DÉPLACEMENT (PAN) ---

canvasArea.addEventListener('mousedown', (e) => {
    // On autorise le déplacement si on clique sur le fond, le whiteboard ou le SVG
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

/**
 * Ouvre la modale d'édition pour un dialogue existant ou un nouveau dialogue.
 *
 * @param {string|null} [id=null] - Identifiant du dialogue à éditer, ou null pour création.
 * @returns {void}
 */
function openEditor(id = null) {
    currentEditId = id;
    if (id !== null) {
        const d = dialogues.find(item => item.id === id);
        editText.value = d.text;
        editType.value = d.type;
        if (editLocuteur) editLocuteur.value = d.locuteur || '';
    } else {
        editText.value = "";
        editType.value = "npc";
        if (editLocuteur) editLocuteur.value = "";
    }
    updatePreview();
    modal.classList.remove('hidden');
}

btnClose.addEventListener('click', () => modal.classList.add('hidden'));

/**
 * Met à jour l'aperçu du dialogue (texte + nom + couleur) selon le formulaire.
 *
 * @returns {void}
 */
function updatePreview() {
    previewText.innerText = editText.value || "Aperçu du texte...";
    const locuteurVal = editLocuteur ? editLocuteur.value : '';
    const isNPC = editType.value === "npc";
    previewName.innerText = locuteurVal || (isNPC ? "PROFESSEUR" : "JOUEUR");
    previewName.style.color = isNPC ? "var(--swiss-green)" : "#007bff";
}

editText.addEventListener('input', updatePreview);
editType.addEventListener('change', updatePreview);
if (editLocuteur) editLocuteur.addEventListener('input', updatePreview);

btnValidate.addEventListener('click', () => {
    if (editText.value.trim() === "") {
        showToast("Le texte du dialogue ne peut pas être vide.", 'warning');
        return;
    }

    const locuteurVal = editLocuteur ? editLocuteur.value.trim() : '';
    const typeVal = editType.value;
    const defaultLoc = typeVal === 'npc' ? 'NPC' : 'Joueur';

    if (currentEditId !== null) {
        const d = dialogues.find(d => d.id === currentEditId);
        d.text = editText.value;
        d.type = typeVal;
        d.locuteur = locuteurVal || defaultLoc;

        const node = document.getElementById(`node-${currentEditId}`);
        if (node) node.className = `node-circle node-${d.type}`;
    } else {
        dialogues.push({
            id: `tmp_${Date.now()}`,
            text: editText.value,
            type: typeVal,
            locuteur: locuteurVal || defaultLoc,
            x: undefined,
            y: undefined
        });
    }

    modal.classList.add('hidden');
    renderList();
});

btnAdd.addEventListener('click', () => openEditor());


/**
 * Rend la liste des dialogues dans le panneau latéral avec actions d'édition/suppression.
 *
 * @returns {void}
 */
function renderList() {
    listContainer.innerHTML = "";
    dialogues.forEach((d, index) => {
        const item = document.createElement('div');
        item.className = `draggable-dialogue ${d.type}`;
        item.draggable = true;

        const maxLength = 35;
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

/**
 * Met à jour les numéros affichés sur les nœuds en fonction de l'ordre des dialogues.
 *
 * @returns {void}
 */
function refreshNodeNumbers() {
    dialogues.forEach((d, index) => {
        const node = document.getElementById(`node-${d.id}`);
        if (node) node.innerText = index + 1;
    });
}

/**
 * Supprime un dialogue après confirmation utilisateur, puis retire ses liaisons associées.
 *
 * @param {string} id - Identifiant du dialogue à supprimer.
 * @returns {Promise<void>}
 */
async function deleteLine(id) {
    const confirmed = await showConfirm(
        "Cette action supprimera le dialogue et toutes ses liaisons. Impossible d'annuler.",
        { title: 'Supprimer ce dialogue ?', icon: '🗑️', okLabel: 'Supprimer', okClass: 'delete' }
    );
    if (!confirmed) return;

    dialogues = dialogues.filter(d => d.id !== id);
    connections = connections.filter(c => c.fromId !== id && c.toId !== id);

    const node = document.getElementById(`node-${id}`);
    if (node) node.remove();

    renderList();
    refreshNodeNumbers();
    updateLines();

    showToast("Dialogue supprimé.", 'info', 2500);
}


canvasArea.addEventListener('dragover', (e) => e.preventDefault());

canvasArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("dialogueId");
    const dialogue = dialogues.find(d => d.id == id);

    if (dialogue) {
        const rect = canvasArea.getBoundingClientRect();
        const x = (e.clientX - rect.left - offsetX) / scale + 7500 - 30;
        const y = (e.clientY - rect.top - offsetY) / scale + 7500 - 30;

        createNodeOnBoard(dialogue, x, y);
    }
});

/**
 * Crée (ou repositionne) un nœud de dialogue sur le tableau blanc.
 * Configure aussi les interactions de sélection/lien si le nœud est nouveau.
 *
 * @param {{id: string, type: string, x?: number, y?: number}} dialogue - Dialogue lié au nœud.
 * @param {number} x - Position horizontale du nœud.
 * @param {number} y - Position verticale du nœud.
 * @returns {void}
 */
function createNodeOnBoard(dialogue, x, y) {
    let node = document.getElementById(`node-${dialogue.id}`);

    if (!node) {
        node = document.createElement('div');
        node.id = `node-${dialogue.id}`;
        node.className = `node-circle node-${dialogue.type}`;

        const index = dialogues.findIndex(d => d.id === dialogue.id) + 1;
        node.innerText = index;

        node.addEventListener('click', (e) => {
            if (isUnlinking) {
                if (!firstNodeSelected) {
                    firstNodeSelected = dialogue.id;
                    node.style.border = "5px solid red";
                } else {
                    removeConnection(firstNodeSelected, dialogue.id);
                    resetBorder(firstNodeSelected);
                    firstNodeSelected = null;
                    isUnlinking = false;
                    btnUnlink.innerText = "Supprimer lien";
                    btnUnlink.classList.remove('active-delete');
                }
                return;
            }

            if (isLinking) {
                if (!firstNodeSelected) {
                    firstNodeSelected = dialogue.id;
                    node.style.border = "5px solid gold";
                } else {
                    if (firstNodeSelected !== dialogue.id) {
                        addConnection(firstNodeSelected, dialogue.id);
                    }
                    resetBorder(firstNodeSelected);
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
    updateLines();
}

/**
 * Réinitialise la bordure visuelle d'un nœud à son style par défaut.
 *
 * @param {string} id - Identifiant du dialogue/nœud.
 * @returns {void}
 */
function resetBorder(id) {
    const n = document.getElementById(`node-${id}`);
    if (n) n.style.border = "3px solid var(--black)";
}


/**
 * Rend un nœud déplaçable à la souris et synchronise sa position dans les données.
 *
 * @param {HTMLDivElement} node - Élément DOM du nœud.
 * @param {{x: number, y: number}} dialogue - Objet dialogue associé contenant les coordonnées.
 * @returns {void}
 */
function makeNodeDraggable(node, dialogue) {
    let isDragging = false;
    let startMouseX, startMouseY, startNodeX, startNodeY;

    node.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDragging = true;
        node.style.cursor = 'grabbing';
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startNodeX = dialogue.x;
        startNodeY = dialogue.y;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = (e.clientX - startMouseX) / scale;
        const dy = (e.clientY - startMouseY) / scale;
        dialogue.x = startNodeX + dx;
        dialogue.y = startNodeY + dy;
        node.style.left = `${dialogue.x}px`;
        node.style.top = `${dialogue.y}px`;
        updateLines();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            node.style.cursor = 'move';
        }
    });
}


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

/**
 * Ajoute une connexion orientée entre deux dialogues si elle n'existe pas déjà.
 *
 * @param {string} fromId - Identifiant du nœud source.
 * @param {string} toId - Identifiant du nœud cible.
 * @returns {void}
 */
function addConnection(fromId, toId) {
    const exists = connections.some(c => c.fromId === fromId && c.toId === toId);
    if (!exists) {
        connections.push({ fromId, toId });
        updateLines();
        showToast("Lien créé entre les deux dialogues.", 'success', 2000);
    } else {
        showToast("Ce lien existe déjà.", 'warning', 2500);
    }
}

/**
 * Supprime une connexion orientée entre deux dialogues.
 *
 * @param {string} fromId - Identifiant du nœud source.
 * @param {string} toId - Identifiant du nœud cible.
 * @returns {void}
 */
function removeConnection(fromId, toId) {
    const before = connections.length;
    connections = connections.filter(c => !(c.fromId === fromId && c.toId === toId));
    if (connections.length < before) {
        updateLines();
        showToast("Lien supprimé.", 'info', 2000);
    } else {
        showToast("Aucun lien n'existe entre ces deux dialogues.", 'warning', 3000);
    }
}

/**
 * Redessine toutes les lignes de connexion sur le canvas SVG.
 *
 * @returns {void}
 */
function updateLines() {
    svgCanvas.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="7" markerHeight="5" refX="33" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill="black" />
            </marker>
        </defs>`;

    connections.forEach((conn) => {
        const from = dialogues.find(d => d.id === conn.fromId);
        const to = dialogues.find(d => d.id === conn.toId);

        if (from && to && from.x !== undefined && to.x !== undefined) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", from.x + 30);
            line.setAttribute("y1", from.y + 30);
            line.setAttribute("x2", to.x + 30);
            line.setAttribute("y2", to.y + 30);
            line.setAttribute("stroke", "black");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("marker-end", "url(#arrowhead)");
            svgCanvas.appendChild(line);
        }
    });
}

/**
 * Découpe un texte long sans couper les mots.
 */
function chunkText(text, limit = 120) {
    if (!text || text.length <= limit) return [text];
    const words = text.split(' ');
    const chunks = [];
    let currentChunk = "";

    words.forEach(word => {
        if ((currentChunk.length + word.length + 1) > limit) {
            chunks.push(currentChunk.trim());
            currentChunk = word + " ";
        } else {
            currentChunk += word + " ";
        }
    });
    if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
    return chunks;
}

btnSaveAll.addEventListener('click', async () => {
    let finalNodes = [];
    let finalConnections = [];

    // 1. DÉCOUPAGE DES NŒUDS TROP LONGS
    dialogues.forEach(node => {
        // chunkText est appelée ici pour diviser le texte tous les 120 caractères
        const chunks = chunkText(node.text || "", 120);

        if (chunks.length <= 1) {
            // Le texte est court, on garde le nœud tel quel
            finalNodes.push(node);
        } else {
            // Le texte est long, on crée une chaîne de morceaux
            let previousId = node.id;

            chunks.forEach((chunk, index) => {
                if (index === 0) {
                    // Le premier morceau garde l'ID d'origine (Update)
                    finalNodes.push({ ...node, text: chunk });
                } else {
                    // Les morceaux suivants sont de nouveaux nœuds (Create)
                    const virtualId = `virtual-${node.id}-${index}`;
                    
                    finalNodes.push({
                        ...node,
                        id: virtualId,
                        text: chunk,
                        // Décalage visuel pour que les nouveaux cercles soient visibles
                        x: (node.x || 0) + (index * 60),
                        y: (node.y || 0) + (index * 60)
                    });

                    // On crée le lien automatique entre le morceau précédent et celui-ci
                    finalConnections.push({
                        fromId: previousId,
                        toId: virtualId
                    });
                    
                    previousId = virtualId;
                }
            });
            // On mémorise l'ID du dernier morceau pour rediriger les flèches sortantes
            node.lastChunkId = previousId;
        }
    });
    // 2. REDIRECTION DES CONNEXIONS (VERS LE DERNIER MORCEAU)
    connections.forEach(conn => {
        const sourceNode = dialogues.find(d => d.id === conn.fromId);
        
        if (sourceNode && sourceNode.lastChunkId) {
            // Si la source a été découpée, la flèche part du dernier bout de phrase
            finalConnections.push({
                fromId: sourceNode.lastChunkId,
                toId: conn.toId
            });
        } else {
            // Sinon, connexion normale
            finalConnections.push(conn);
        }
    });
    // Préparation du paquet final pour le serveur
    const payload = {
        scenarioName: scenarioTitle,
        nodes: finalNodes,
        connections: finalConnections,
        recap: scenarioRecap
    };

    const loadingToast = showToast("Découpage et sauvegarde en cours...", 'info', 0);
    // 3. ENVOI AU SERVEUR (TRY/CATCH)
    try {
        const response = await axios.post(`${serveur}/api/scenarios/tree/save`, payload);
        
        loadingToast.remove();
        showToast("Scénario découpé et sauvegardé avec succès !", 'success', 3000);

        // SOLUTION DOUBLONS : On recharge la page après 1.5s
        // Cela permet de voir les nouveaux nœuds créés et d'avoir les vrais IDs MongoDB
        setTimeout(() => {
            location.reload();
        }, 1500);

    } catch (err) {
        console.error("Erreur sauvegarde :", err);
        if (loadingToast) loadingToast.remove();
        showToast("Erreur lors de la sauvegarde du scénario.", 'error', 5000);
    }
});

// Ouvrir la modale
btnRecap.addEventListener('click', () => {
    document.getElementById('recap-text').value = scenarioRecap;
    modalRecap.classList.remove('hidden');
});

// Fermer la modale (Annuler)
btnCloseRecap.addEventListener('click', () => {
    modalRecap.classList.add('hidden');
});

// Valider (Fermer et garder en mémoire)
btnSaveRecapLocal.addEventListener('click', () => {
    const textVal = document.getElementById('recap-text').value;
    scenarioRecap = textVal;
    modalRecap.classList.add('hidden');
    showToast("Récapitulatif mis en mémoire. N'oubliez pas de sauvegarder le scénario !", 'success', 3000);
});