function create(tag, container, text = null) {
    const element = document.createElement(tag);
    element.innerText = text;
    container.appendChild(element);
    return element;
}

let locuteur = document.getElementById('edit-name');
let dialogueText = document.getElementById('edit-text');
let previewName = document.getElementById('preview-name');
let previewText = document.getElementById('preview-text');

