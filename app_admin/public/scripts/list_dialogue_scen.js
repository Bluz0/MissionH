let main = document.getElementById('scenario-view');
function create(tag, container, text = null) {
    const element = document.createElement(tag);
    element.innerText = text;
    container.appendChild(element);
    return element;
}

const serveur = "http://51.38.222.173";

let buttonBack = document.getElementById('button-back');
buttonBack.addEventListener('click', () => {
    window.location.href = '../../index.html';
});

// Gere la liste des dialogues d'un scenario
let titleScenario = document.getElementById('current-scenario-title');
const title = new URLSearchParams(window.location.search).get('title');
titleScenario.innerText = title;

examplejson = [{"_id":"69a44c761bf731421d9aef05","scenarioName":"MissionBienvenue","locuteur":"Prof","contenu":"Yo !","ordre":1,"dateCreation":"2026-03-01T14:25:58.980Z","__v":0},{"_id":"69a44c7c1bf731421d9aef09","scenarioName":"MissionBienvenue","locuteur":"Prof","contenu":"Pas yo","ordre":2,"dateCreation":"2026-03-01T14:26:04.129Z","__v":0},{"_id":"69a44cb81bf731421d9aef0f","scenarioName":"MissionBienvenue","locuteur":"Eleve","contenu":"Je suis le 3eme dialogue","ordre":3,"dateCreation":"2026-03-01T14:27:04.113Z","__v":0}];

let listBody = document.querySelector(".dialogue-list-body");

function createRow(dialogue_id, dialogue_name, dialogue_text) {

    let row = create('tr', listBody);
    row.className = 'dialogue-row';
    listBody.appendChild(row);

    let id = create("td", row, dialogue_id);
    id.style.fontFamily = "monospace";
    id.style.color = "#888";

    let name = create("td", row, dialogue_name);
    name.className = "font-black";

    let text = create("td", row, dialogue_text);
    let td_empty = create("td", row);
    td_empty.style.textAlign = "right";
    let buttonEditor = create("button", td_empty, "Éditer");
    buttonEditor.className = "btn btn-outline green";
    buttonEditor.style.padding = "0.5rem 1rem";
    buttonEditor.addEventListener("click", () => openEditor(dialogue_id));
    let buttonDelete = create("button", td_empty, "Supprimer");
    buttonDelete.className = "btn btn-outline delete";
    buttonDelete.style.padding = "0.5rem 1rem";
    buttonDelete.style.marginLeft = "0.5rem";
    buttonDelete.addEventListener("click", () => {
        openDeleteModal(dialogue_id, row);
    });
}

function openEditor(dialogueId) {
    // Rediriger vers la page d'édition du dialogue
    window.location.href = `edit_dialogue.html?&dialogueId=${dialogueId}`;
}

axios.get(`${serveur}/api/scenarios/${title}/dialogues`)
    .then(response => {
        const dialogues = response.data;

        if (dialogues.length === 0) {
            const emptyRow = create('tr', listBody);
            const emptyCell = create('td', emptyRow, "Aucun dialogue trouvé pour ce scénario.");
            emptyCell.colSpan = 4;
            emptyCell.className = "mot-vide";
        }

        console.log(dialogues);
        dialogues.forEach(d => {
            createRow(d._id, d.locuteur, d.contenu);
        });
    });

// Gere l'ajout d'un dialogue dans un scenario
function addDialogue(locuteur, contenu) {
    const newDialogue = {
        scenarioName: title,
        locuteur: locuteur,
        contenu: contenu
    };

    return axios.post(`${serveur}/api/dialogues`, newDialogue)
        .then(response => {
            console.log("Dialogue ajouté :", response.data);
            createRow(response.data._id, response.data.locuteur, response.data.contenu);
            if (document.querySelector(".mot-vide")) {
                document.querySelector(".mot-vide").hidden = true;
            }
        })
        .catch(error => {
            console.error("Erreur lors de l'ajout du dialogue :", error);
        });
}

let buttonNewDialogue = document.getElementById("new-d");
let addDialogueSection = document.querySelector(".add-dialogue");

// Fonction pour nettoyer et fermer
function closeModal() {
    addDialogueSection.hidden = true;
    addDialogueSection.innerHTML = ""; // On vide le formulaire
    main.style.filter = "none";
    main.style.pointerEvents = "auto";
}

buttonNewDialogue.addEventListener("click", () => {
    addDialogueSection.hidden = false;
    
    // Application du flou et blocage des clics derrière
    main.style.filter = "blur(8px)";
    main.style.pointerEvents = "none";

    // Création du formulaire avec ta fonction create()
    let form = create("form", addDialogueSection);
    
    create("h3", form, "Nouveau Message"); // Petit titre
    
    let inputLocuteur = create("input", form);
    inputLocuteur.placeholder = "Nom du locuteur (ex: Prof)";
    let pErrorLocuteur = create("p", form);
    pErrorLocuteur.hidden = true;
    pErrorLocuteur.innerText = "Le nom du locuteur est requis.";
    pErrorLocuteur.style.color = "red";
    pErrorLocuteur.style.fontSize = "0.8rem";
    pErrorLocuteur.style.marginTop = "0.25rem";
    pErrorLocuteur.style.fontFamily = "Inter, -apple-system, sans-serif";
    
    let inputContenu = create("input", form);
    inputContenu.placeholder = "Contenu du dialogue...";
    let pErrorContenu = create("p", form);
    pErrorContenu.hidden = true;
    pErrorContenu.innerText = "Le contenu du dialogue est requis.";
    pErrorContenu.style.color = "red";
    pErrorContenu.style.fontSize = "0.8rem";
    pErrorContenu.style.marginTop = "0.25rem";
    pErrorContenu.style.fontFamily = "Inter, -apple-system, sans-serif";

    // Conteneur pour les boutons (alignement horizontal)
    let actions = create("div", form);
    actions.style.display = "flex";
    actions.style.gap = "10px";

    let buttonSubmit = create("button", actions, "Ajouter");
    buttonSubmit.className = "btn btn-black green";
    buttonSubmit.type = "submit";

    let buttonCancel = create("button", actions, "Annuler");
    buttonCancel.className = "btn btn-outline delete";
    buttonCancel.type = "button";

    // Events
    buttonCancel.addEventListener("click", closeModal);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if(inputLocuteur.value && inputContenu.value) {
            pErrorLocuteur.hidden = true;
            pErrorContenu.hidden = true;
            addDialogue(inputLocuteur.value, inputContenu.value);
            closeModal();
        } else {
            if (!inputLocuteur.value) {
                pErrorLocuteur.hidden = false;
            }
            if (!inputContenu.value) {
                pErrorContenu.hidden = false;
            }
        }
    });
});

addDialogueSection.addEventListener("click", (e) => {
    if (e.target === addDialogueSection) {
        closeModal();
    }
});

// SUPPRESSION DIALOGUE

function closeDeleteModal() {
    deleteDialogueSection.hidden = true;
    deleteDialogueSection.innerHTML = "";
    main.style.filter = "none";
    main.style.pointerEvents = "auto";
}


let deleteDialogueSection = document.querySelector(".delete-dialogue");

function openDeleteModal(dialogueId, rowElement) {
    deleteDialogueSection.hidden = false;
    deleteDialogueSection.innerHTML = "";

    // Blur background
    main.style.filter = "blur(8px)";
    main.style.pointerEvents = "none";

    let container = create("div", deleteDialogueSection);
    
    let title = create("h3", container, "Supprimer ce dialogue ?");
    title.style.marginBottom = "1rem";

    create("p", container, "Cette action est définitive.");

    let actions = create("div", container);
    actions.style.display = "flex";
    actions.style.gap = "10px";
    actions.style.marginTop = "1rem";

    let buttonCancel = create("button", actions, "Annuler");
    buttonCancel.className = "btn btn-outline";

    let buttonConfirm = create("button", actions, "Supprimer");
    buttonConfirm.className = "btn btn-outline delete";

    buttonCancel.addEventListener("click", closeDeleteModal);

    buttonConfirm.addEventListener("click", () => {
        axios.delete(`${serveur}/api/dialogues/${dialogueId}`)
            .then(() => {
                rowElement.remove();
                closeDeleteModal();
                if (document.querySelector(".mot-vide").hidden == true) {
                    document.querySelector(".mot-vide").hidden = false;
                }
            })
            .catch(error => {
                console.error("Erreur suppression :", error);
            });
    });
}

function verifieDialogue(dialogueTab) {
   return dialogueTab.length > 0;
}