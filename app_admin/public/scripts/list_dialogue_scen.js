function create(tag, container, text = null) {
    const element = document.createElement(tag);
    element.innerText = text;
    container.appendChild(element);
    return element;
}

let buttonBack = document.getElementById('button-back');
buttonBack.addEventListener('click', () => {
    window.location.href = '../../index.html';
});

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
    buttonEditor.className = "btn btn-outline";
    buttonEditor.style.padding = "0.5rem 1rem";
    buttonEditor.addEventListener("click", () => openEditor(dialogue_id));
}

createRow("69a44c761bf731421d9aef05", "Prof", "Yo !");
createRow("69a44c7c1bf731421d9aef09", "Prof", "Pas yo");