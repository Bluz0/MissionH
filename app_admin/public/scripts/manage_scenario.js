function create(tag, container, text = null) {
    const element = document.createElement(tag);
    element.innerText = text;
    container.appendChild(element);
    return element;
}

const serveur = window.location.origin;
const title = new URLSearchParams(window.location.search).get('title');

let gridScenarios = document.querySelector(".grid-scenarios");
let cardId = 1;

function afficheTitreScenario(scenarioName){
    let card = create("div", gridScenarios);
    card.className = "scenario-card rapprochement-letter";
    // faire le addEventListener pour rediriger vers la page de gestion des dialogues de ce scenario

    let cardIdStr = cardId.toString().padStart(2, '0');
    let spanCard = create("span", card, cardIdStr);
    spanCard.className = "card-number";
    cardId++;

    let h3Card = create("h3", card, scenarioName);
    h3Card.className = "font-black uppercase rapprochement-letter";
    h3Card.style.fontSize = "1.5rem";
}

// Affiche les scenarios disponibles dans la base de données
axios.get(`${serveur}/api/scenarios`).then(response => {
    const scenarios = response.data;
    
    console.log("Scénarios récupérés :", scenarios);
    
    scenarios.forEach(scenario => {
        afficheTitreScenario(scenario.scenarioName);
    });
}).catch(error => {
    console.error("Erreur lors de la récupération des scénarios :", error);
});


/*

// gestion choppe dans mongoDB les dialogues en fonction du titre de la scenario

const dialogues = [
    { id: 'd01', title: 'mission1', name: 'Eleve', text: 'Salut' },
    { id: 'd02', title: 'mission1', name: 'Prof', text: 'Pourquoi vous etes en retard ????' }
];

let listBody = document.querySelector(".dialogue-list-body");

function createRow(row, dialogue_id, dialogue_name, dialogue_text) {
    let id = create("td", row, dialogue_id);
    id.style.fontFamily = "monospace";
    id.style.color = "#888";

    let name = create("td", row, dialogue_name);
    name.className = "font-black";

    let text = create("td", row, dialogue_text);


    let td_empty = create("td", row);
    td_empty.style.textAlign = "right";

    let buttonEditor = create("button", td_empty, "Éditer");
    buttonEditor.className = "btn btn-outline";
    buttonEditor.style.padding = "0.5rem 1rem";
    buttonEditor.addEventListener("click", () => openEditor(dialogue_id));
}

function testDialogues() {
    dialogues.forEach(d => {
        const row = create('tr', listBody);
        row.className = 'dialogue-row';
        createRow(row, d.id, d.name, d.text);
        listBody.appendChild(row);
    });
}

testDialogues();

function openEditor(dialogue_id) {
    window.location.href = `editor.html?dialogue_id=${dialogue_id}&title=${title}`;
}



        const app = document.getElementById('app');
        const notification = document.getElementById('notification');


        function openScenario(title) {
            window.location.href = "lib/html/dashboard.html" + "?title=" + encodeURIComponent(title);
        }

        // dialogues.forEach(d => {
        //         const row = document.createElement('tr');
        //         row.className = 'dialogue-row';
        //         row.innerHTML = `
        //             <td style="font-family:monospace; color:#888;">${d.id}</td>
        //             <td class="font-black">${d.name}</td>
        //             <td>${d.text}</td>
        //             <td style="text-align: right;">
        //                 <button class="btn btn-outline" style="padding: 0.5rem 1rem;" onclick="openEditor('${d.id}')">Éditer</button>
        //             </td>
        //         `;
        //         listBody.appendChild(row);
        //     });


        function openEditor(id) {
            const dialogue = dialogues.find(d => d.id === id);
            document.getElementById('edit-name').value = dialogue.name;
            document.getElementById('edit-text').value = dialogue.text;
            updatePreview();
            showView('editor');
        }

        // aperçu Unity
        function updatePreview() {
            document.getElementById('preview-name').innerText = document.getElementById('edit-name').value;
            document.getElementById('preview-text').innerText = document.getElementById('edit-text').value;
        }

        function saveDialogue() {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                showView('scenario');
            }, 2000);
        }
*/