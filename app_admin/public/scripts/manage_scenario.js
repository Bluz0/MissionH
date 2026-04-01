const serveur = "http://51.38.222.173";
let gridScenarios = document.querySelector(".grid-scenarios");
let cardId = 1;

let nbChapitresElement = document.getElementById("nb-chap");


/**
 * Met à jour le compteur de chapitres affiché dans l'interface.
 *
 * @param {number} count - Nombre total de scénarios/chapitres.
 * @returns {void}
 */
function updateNbChapitres(count) {
    nbChapitresElement.innerText = `${count} Chapitre${count > 1 ? 's' : ''}`;
}

/**
 * Crée un élément HTML, lui assigne éventuellement un texte,
 * puis l'ajoute au conteneur fourni.
 *
 * @param {string} tag - Nom de la balise à créer (ex: "div", "span").
 * @param {HTMLElement} container - Élément parent qui recevra le nouvel élément.
 * @param {string|null} [text=null] - Texte à injecter dans l'élément.
 * @returns {HTMLElement} L'élément HTML créé et ajouté au DOM.
 */
function create(tag, container, text = null) {
    const element = document.createElement(tag);
    element.innerText = text;
    container.appendChild(element);
    return element;
}

/**
 * Construit et affiche une carte de scénario dans la grille.
 * Un clic sur la carte redirige vers l'éditeur du scénario ciblé.
 *
 * @param {string} scenarioName - Nom du scénario à afficher.
 * @returns {void}
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

    card.addEventListener("click", (e) => {
        
        if (e.target.closest('.action-btn')) return;
        window.location.href = `lib/html/edit_dialogue.html?scenario=${encodeURIComponent(scenarioName)}`;
    });

    card.querySelector(".delete-btn").addEventListener("click", async () => {
        const confirmSuppr = confirm(`ATTENTION : Supprimer "${scenarioName}" effacera TOUS les dialogues associés. Continuer ?`);
        if (confirmSuppr) {
            try {
                await axios.delete(`${serveur}/api/scenarios/${encodeURIComponent(scenarioName)}`);
                window.location.reload(); // On rafraîchit la liste
            } catch (err) {
                alert("Erreur lors de la suppression");
            }
        }
    });

    card.querySelector(".edit-btn").addEventListener("click", async () => {
        const newName = prompt(`Nouveau nom pour "${scenarioName}" :`, scenarioName);
        if (newName && newName.trim() !== "" && newName !== scenarioName) {
            try {
                await axios.put(`${serveur}/api/scenarios/${encodeURIComponent(scenarioName)}`, {
                    newName: newName.trim()
                });
                window.location.reload();
            } catch (err) {
                alert("Erreur lors du renommage");
            }
        }
    });
}

// Récupération des scénarios depuis l'API
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
    .catch(error => {
        console.error("Erreur lors de la récupération :", error);
    });

/**
 * Crée la carte interactive pour ajouter un nouveau scénario
 */
function afficheBoutonAjout() {
    let card = document.createElement("div");
    card.className = "scenario-card add-new rapprochement-letter";
    card.innerHTML = `
        <div class="plus-icon">+</div>
        <span class="uppercase espace-letter">Créer une mission</span>
    `;

    card.addEventListener("click", async () => {
        const name = prompt("Nom du nouveau scénario (ex: Mission Alpha) :");
        
        if (name && name.trim() !== "") {
            try {
                const res = await axios.post(`${serveur}/api/scenarios`, { 
                    scenarioName: name.trim() 
                });
                
                if(res.status === 201) {
                    window.location.reload();
                }
            } catch (err) {
                alert("Erreur lors de la création : " + (err.response?.data?.error || err.message));
            }
        }
    });

    gridScenarios.appendChild(card);
}