
function create(tag, container, text = null) {
    const element = document.createElement(tag);
    element.innerText = text;
    container.appendChild(element);
    return element;
}


const title = new URLSearchParams(window.location.search).get('title');

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
