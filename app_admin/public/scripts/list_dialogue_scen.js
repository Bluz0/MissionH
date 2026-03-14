const serveur = "http://51.38.222.173";
const urlParams = new URLSearchParams(window.location.search);
const title = urlParams.get('title');

let titleScenario = document.getElementById('current-scenario-title');
let buttonBack = document.getElementById('button-back');
let openEditorBtn = document.getElementById('open-tree-editor'); // Assure-toi que l'ID correspond dans le HTML

// Affichage du titre
if (title) {
    titleScenario.innerText = title;
}

// Retour à l'accueil
buttonBack.addEventListener('click', () => {
    window.location.href = '../../index.html';
});

// Bouton principal pour ouvrir l'éditeur d'arbre
// On réutilise ton bouton "new-d" ou le nouveau "open-tree-editor"
let mainActionBtn = document.getElementById("new-d") || document.getElementById("open-tree-editor");

if (mainActionBtn) {
    mainActionBtn.innerText = "🌳 OUVRIR L'ÉDITEUR D'ARBRE";
    mainActionBtn.className = "btn btn-black press-effect green";
    mainActionBtn.style.padding = "1.5rem 2rem";

    mainActionBtn.addEventListener("click", () => {
        window.location.href = `edit_dialogue.html?scenario=${encodeURIComponent(title)}`;
    });
}

// Optionnel : Afficher un petit récapitulatif du scénario
axios.get(`${serveur}/api/scenarios/${title}/dialogues`)
    .then(response => {
        const dialogues = response.data;
        const stats = document.getElementById('scenario-stats');
        if (stats) {
            stats.innerText = `Ce scénario contient actuellement ${dialogues.length} ligne(s) de dialogue. Ouvrez l'éditeur pour modifier l'arborescence.`;
        }
    })
    .catch(err => console.log("Erreur stats:", err));