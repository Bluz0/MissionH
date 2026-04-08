// Vérification de session au chargement de la page
if (localStorage.getItem('admin_session') !== 'authorized_access_key') {
    window.location.href = 'login.html';
}


const serveur = "http://51.38.222.173";
let gridScenarios = document.querySelector(".grid-scenarios");
let cardId = 1;
let nbChapitresElement = document.getElementById("nb-chap");

/**
 * MODALE PERSONNALISÉE (PROMPT / CONFIRM)
 */
function openModal({ title, message, isPrompt = false, defaultValue = '', okText = 'Confirmer', okClass = 'btn-black' }) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const inputContainer = document.getElementById('modal-input-container');
        const inputField = document.getElementById('modal-input-field');
        const btnOk = document.getElementById('modal-ok');
        const btnCancel = document.getElementById('modal-cancel');

        document.getElementById('modal-title').innerText = title.toUpperCase();
        document.getElementById('modal-message').innerText = message;
        btnOk.innerText = okText.toUpperCase();
        btnOk.className = `btn press-effect ${okClass}`;

        if (isPrompt) {
            inputContainer.classList.remove('hidden');
            inputField.value = defaultValue;
            setTimeout(() => inputField.focus(), 100);
        } else {
            inputContainer.classList.add('hidden');
        }

        modal.classList.add('show');

        const cleanup = () => {
            modal.classList.remove('show');
            const newOk = btnOk.cloneNode(true);
            const newCancel = btnCancel.cloneNode(true);
            btnOk.replaceWith(newOk);
            btnCancel.replaceWith(newCancel);
        };

        document.getElementById('modal-ok').addEventListener('click', () => {
            const val = isPrompt ? document.getElementById('modal-input-field').value : true;
            cleanup();
            resolve(val);
        });

        document.getElementById('modal-cancel').addEventListener('click', () => {
            cleanup();
            resolve(null);
        });
    });
}

function updateNbChapitres(count) {
    nbChapitresElement.innerText = `${count} Chapitre${count > 1 ? 's' : ''}`;
}

/**
 * AFFICHER UNE CARTE DE MISSION EXISTANTE
 */
function afficheTitreScenario(scenarioName) {
    let card = document.createElement("div");
    card.className = "scenario-card rapprochement-letter";
    
    card.innerHTML = `
        <div class="card-header">
            <span class="card-number">${cardId.toString().padStart(2, '0')}</span>
            <div class="card-actions">
                <button class="action-btn edit-btn" title="Renommer">✏️</button>
                <button class="action-btn delete-btn" title="Supprimer">🗑️</button>
            </div>
        </div>
        <h3 class="font-black uppercase rapprochement-letter scenario-display-name">${scenarioName}</h3>
    `;
    
    gridScenarios.appendChild(card);
    cardId++;

    // CLIC SUR LA CARTE -> Aller à l'éditeur
    card.addEventListener("click", (e) => {
        // Si on clique sur un bouton d'action, on ne redirige pas
        if (e.target.closest('.action-btn')) return;
        window.location.href = `lib/html/edit_dialogue.html?scenario=${encodeURIComponent(scenarioName)}`;
    });

    // BOUTON SUPPRIMER
    card.querySelector(".delete-btn").addEventListener("click", async (e) => {
        e.stopPropagation(); // Empêche le clic sur la carte
        const result = await openModal({
            title: "Supprimer",
            message: `Voulez-vous vraiment effacer "${scenarioName}" ?`,
            okText: "Supprimer",
            okClass: "delete"
        });

        if (result) {
            try {
                await axios.delete(`${serveur}/api/scenarios/${encodeURIComponent(scenarioName)}`);
                window.location.reload();
            } catch (err) { console.error(err); }
        }
    });

    // BOUTON RENOMMER
    card.querySelector(".edit-btn").addEventListener("click", async (e) => {
        e.stopPropagation(); // Empêche le clic sur la carte
        const newName = await openModal({
            title: "Renommer",
            message: "Entrez le nouveau nom :",
            isPrompt: true,
            defaultValue: scenarioName
        });

        if (newName && newName.trim() !== "" && newName !== scenarioName) {
            try {
                await axios.put(`${serveur}/api/scenarios/${encodeURIComponent(scenarioName)}`, {
                    newName: newName.trim()
                });
                window.location.reload();
            } catch (err) { console.error(err); }
        }
    });
}

/**
 * AFFICHER LE BOUTON "+" POUR CRÉER
 */
function afficheBoutonAjout() {
    let card = document.createElement("div");
    card.className = "scenario-card add-new rapprochement-letter";
    card.innerHTML = `
        <div class="plus-icon">+</div>
        <span class="uppercase espace-letter">Créer une mission</span>
    `;

    card.addEventListener("click", async () => {
        const name = await openModal({
            title: "Nouveau Scénario",
            message: "Nom de la mission :",
            isPrompt: true
        });
        
        if (name && name.trim() !== "") {
            try {
                const res = await axios.post(`${serveur}/api/scenarios`, { 
                    scenarioName: name.trim() 
                });
                if(res.status === 201) window.location.reload();
            } catch (err) {
                alert("Erreur : " + (err.response?.data?.error || err.message));
            }
        }
    });

    gridScenarios.appendChild(card);
}

// CHARGEMENT INITIAL
axios.get(`${serveur}/api/scenarios`)
    .then(response => {
        const scenarios = response.data;
        updateNbChapitres(scenarios.length);
        gridScenarios.innerHTML = ""; 
        scenarios.forEach(scenario => {
            afficheTitreScenario(scenario.scenarioName);
        });
        afficheBoutonAjout();
    })
    .catch(error => { console.error(error); });