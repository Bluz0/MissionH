// Vérification de session au chargement de la page
if (localStorage.getItem('admin_session') !== 'authorized_access_key') {
    window.location.href = 'login.html';
}

let allScenarios = [];
let allNpcs = [];

async function init() {
    await loadScenarios();
    await loadNpcs();
}

async function loadScenarios() {
    try {
        const res = await axios.get('/api/scenarios');
        allScenarios = res.data;
        const select = document.getElementById('scenario-select');
        // ATTENTION : utilise s.scenarioName et non s.name
        select.innerHTML = allScenarios.map(s => `<option value="${s.scenarioName}">${s.scenarioName}</option>`).join('');
    } catch (e) { console.error("Erreur chargement scénarios", e); }
}

async function loadNpcs() {
    try {
        const response = await axios.get('/api/npc');
        allNpcs = response.data;
        renderNpcTable(); // On appelle la fonction de rendu ici
    } catch (e) { console.error("Erreur chargement NPCs", e); }
}

function renderNpcTable() {
    const body = document.getElementById('npc-list-body');
    body.innerHTML = allNpcs.map(npc => `
        <tr class="dialogue-row">
            <td class="font-black">
                ${npc.npcName} 
                <button class="btn-outline" style="padding: 2px 8px; font-size: 9px; margin-left: 10px; cursor: pointer;" 
                        onclick="openEditNameModal('${npc.npcId}')">Modifier le nom</button>
            </td>
            <td>
                <span class="tag" style="background: ${npc.scenarioName ? 'var(--swiss-green)' : 'var(--swiss-red)'}; color: white; padding: 5px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase;">
                    ${npc.scenarioName || 'NON ASSIGNÉ'}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="btn btn-outline green" onclick="openAssignModal('${npc.npcId}')">Assigner Scénario</button>
            </td>
        </tr>
    `).join('');
}

function openEditNameModal(npcId) {
    const npc = allNpcs.find(n => n.npcId === npcId);
    document.getElementById('current-npc-name').innerText = npc.npcName;
    document.getElementById('new-npc-name-input').value = npc.npcName;
    document.getElementById('modal-edit-name').classList.add('show');
    
    document.getElementById('confirm-name-btn').onclick = async () => {
        const newName = document.getElementById('new-npc-name-input').value;
        if(!newName) return;

        try {
            await axios.put(`/api/npc/${npcId}/name`, { npcName: newName });
            closeNameModal();
            await loadNpcs(); // Rafraîchir la liste
        } catch (e) { console.error(e); }
    };
}

function closeNameModal() {
    document.getElementById('modal-edit-name').classList.remove('show');
}

function openAssignModal(npcId) {
    const npc = allNpcs.find(n => n.npcId === npcId);
    document.getElementById('target-npc-id').innerText = npc.npcName;
    document.getElementById('modal-assign').classList.add('show');
    
    document.getElementById('confirm-assign-btn').onclick = async () => {
        const scenarioName = document.getElementById('scenario-select').value;
        try {
            await axios.put(`/api/npc/${npcId}/scenario`, { scenarioName });
            closeModal();
            await loadNpcs(); // On recharge proprement la liste
        } catch (e) { console.error(e); }
    };
}

function closeModal() {
    document.getElementById('modal-assign').classList.remove('show');
}

init();