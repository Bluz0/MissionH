let allScenarios = [];
let allNpcs = [];

async function init() {
    await loadScenarios();
    await loadNpcs();
}

async function loadScenarios() {
    const res = await axios.get('/api/scenarios');
    allScenarios = res.data;
    const select = document.getElementById('scenario-select');
    select.innerHTML = allScenarios.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
}

async function loadNpcs() {
    const res = await axios.get('/api/npc');
    allNpcs = res.data;
    renderNpcTable();
}

function renderNpcTable() {
    const body = document.getElementById('npc-list-body');
    body.innerHTML = allNpcs.map(npc => `
        <tr class="dialogue-row">
            <td class="font-black"># ${npc.npcId}</td>
            <td>
                <span class="tag" style="background: ${npc.scenarioName ? 'var(--gray-medium)' : 'var(--swiss-red)'}; padding: 5px 10px; font-size: 10px; font-weight: 900;">
                    ${npc.scenarioName || 'NON ASSIGNÉ'}
                </span>
            </td>
            <td style="text-align: right;">
                <button class="btn btn-outline green" onclick="openAssignModal('${npc.npcId}')">Modifier</button>
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
            loadNpcs(); // Recharger la liste
        } catch (e) {
            console.error(e);
        }
    };
}

function closeModal() {
    document.getElementById('modal-assign').classList.remove('show');
}

init();