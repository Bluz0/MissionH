function create(tag, container, text = null) {
    const element = document.createElement(tag);
    element.innerText = text;
    container.appendChild(element);
    return element;
}

let id_dialogue = new URLSearchParams(window.location.search).get('dialogueId');
let serveur = "http://51.38.222.173";

let locuteur = document.getElementById('edit-name');
let dialogueText = document.getElementById('edit-text');
let previewName = document.getElementById('preview-name');
let previewText = document.getElementById('preview-text');

// Recupere et affiche les infos du dialogue a editer
axios.get(`${serveur}/api/dialogue/${id_dialogue}`)
  .then(response => {
    const dialogue = response.data;
    console.log(dialogue);
    locuteur.value = dialogue.locuteur;
    dialogueText.value = dialogue.contenu;
    previewName.innerText = dialogue.locuteur;
    previewText.innerText = dialogue.contenu;
  })
  .catch(error => {
    console.error("Erreur lors de la récupération du dialogue :", error);
  });


locuteur.addEventListener('input', () => {
    previewName.innerText = locuteur.value;
});

dialogueText.addEventListener('input', () => {
    previewText.innerText = dialogueText.value;
});


// Enregistre les modifications du dialogue et redirige vers la liste des dialogues du scenario
let buttonSave = document.getElementById('enregistre');
buttonSave.addEventListener('click', () => {
    const updatedDialogue = {
        locuteur: locuteur.value,
        contenu: dialogueText.value
    };

    axios.put(`${serveur}/api/dialogues/${id_dialogue}`, updatedDialogue)
        .then(response => {
            updatedDialogue.scenarioName = response.data.scenarioName;
            window.location.href = `dashboard.html?title=${response.data.scenarioName}`;
        })
        .catch(error => {
            console.error("Erreur lors de la mise à jour du dialogue :", error);
        });
});