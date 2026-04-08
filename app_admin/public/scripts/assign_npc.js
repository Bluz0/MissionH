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
            </td>
            <td>
                <span class="tag" style="background: ${npc.scenarioName ? 'var(--swiss-green)' : 'var(--swiss-red)'}; color: white; padding: 5px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase;">
                    ${npc.scenarioName || 'NON ASSIGNÉ'}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="btn btn-outline green" onclick="openAssignModal('${npc.npcId}')">Assigner</button>
            </td>
        </tr>
    `).join('');
}

function openAssignModal(npcId) {
    document.getElementById('target-npc-id').innerText = npcId;
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