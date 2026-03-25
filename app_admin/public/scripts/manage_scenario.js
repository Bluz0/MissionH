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
    let card = create("div", gridScenarios);
    card.className = "scenario-card rapprochement-letter";
    
    // REDIRECTION DIRECTE VERS L'ÉDITEUR
    card.addEventListener("click", () => {
        // On monte d'un niveau si nécessaire selon ton arborescence de dossiers
        window.location.href = `lib/html/edit_dialogue.html?scenario=${encodeURIComponent(scenarioName)}`;
    });

    let cardIdStr = cardId.toString().padStart(2, '0');
    let spanCard = create("span", card, cardIdStr);
    spanCard.className = "card-number";
    cardId++;

    let h3Card = create("h3", card, scenarioName);
    h3Card.className = "font-black uppercase rapprochement-letter";
    h3Card.style.fontSize = "1.5rem";
}

// Récupération des scénarios depuis l'API
axios.get(`${serveur}/api/scenarios`)
    .then(response => {
        const scenarios = response.data;
        updateNbChapitres(scenarios.length);
        gridScenarios.innerHTML = ""; // On vide la grille avant d'afficher
        scenarios.forEach(scenario => {
            afficheTitreScenario(scenario.scenarioName);
        });
    })
    .catch(error => {
        console.error("Erreur lors de la récupération des scénarios :", error);
    });