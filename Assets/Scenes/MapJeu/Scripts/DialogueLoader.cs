using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

public class AcceptAllCertificates : CertificateHandler
{
    protected override bool ValidateCertificate(byte[] certificateData) => true;
}

public class DialogueLoader : MonoBehaviour
{
    private const string API_URL = "http://51.38.222.173/api/scenarios";

    private const string NPC_API_URL = "http://51.38.222.173/api/npc";
    public IEnumerator FetchAssignedScenario(int npcId, string npcName, System.Action<string, string> onLoaded)
    {
        string url = $"{NPC_API_URL}/{npcId}/config?name={UnityWebRequest.EscapeURL(npcName)}";

        using UnityWebRequest req = UnityWebRequest.Get(url);
        req.certificateHandler = new AcceptAllCertificates();
        yield return req.SendWebRequest();

        if (req.result != UnityWebRequest.Result.Success) {
            onLoaded?.Invoke(null, null);
            yield break;
        }

        // analyse le JSON complet
        string rawJson = req.downloadHandler.text;
        AssignedScenarioResponse res = JsonUtility.FromJson<AssignedScenarioResponse>(rawJson);
        
        // On renvoie le scénario ET le nom du PNJ
        onLoaded?.Invoke(res.scenarioName, res.npcName);
    }

    public IEnumerator LoadDialogue(string scenarioName, System.Action<NPCDialogue> onLoaded)
    {
        string url = $"{API_URL}/{scenarioName}/tree";

        using UnityWebRequest req = UnityWebRequest.Get(url);
        req.certificateHandler = new AcceptAllCertificates(); // ← ajout
        yield return req.SendWebRequest();

        if (req.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"Erreur API : {req.error}");
            yield break;
        }

        ApiResponse response = JsonUtility.FromJson<ApiResponse>(req.downloadHandler.text);
        NPCDialogue dialogue = ConvertToNPCDialogue(response);
        onLoaded?.Invoke(dialogue);
    }

    NPCDialogue ConvertToNPCDialogue(ApiResponse response)
    {
        NPCDialogue dialogue = ScriptableObject.CreateInstance<NPCDialogue>();

        // Construit un dictionnaire id → nœud
        var nodeMap = response.dialogues.ToDictionary(d => d._id);

        // Construit un dictionnaire id → liste des enfants
        var childrenMap = new Dictionary<string, List<string>>();
        foreach (var conn in response.connections)
        {
            if (!childrenMap.ContainsKey(conn.fromId))
                childrenMap[conn.fromId] = new List<string>();
            childrenMap[conn.fromId].Add(conn.toId);
        }

        // Trouve la racine (nœud sans parent)
        var allTargets = response.connections.Select(c => c.toId).ToHashSet();
        var root = response.dialogues.FirstOrDefault(d => !allTargets.Contains(d._id));

        if (root == null) return dialogue;

        // Parcours en largeur pour aplatir le graphe
        List<string> lines = new();
        List<bool> autoProgress = new();
        List<bool> endLines = new();
        List<DialogueChoice> choices = new();

        var queue = new Queue<(DialogueNode node, bool isPlayerChoice)>();
        var indexMap = new Dictionary<string, int>(); // id → index dans lines[]

        queue.Enqueue((root, false));

        while (queue.Count > 0)
        {
            var (node, _) = queue.Dequeue();

            if (indexMap.ContainsKey(node._id)) continue;

            int currentIndex = lines.Count;
            indexMap[node._id] = currentIndex;
            lines.Add(node.contenu);

            var children = childrenMap.GetValueOrDefault(node._id, new List<string>());

            if (children.Count == 0)
            {
                // Fin du dialogue
                autoProgress.Add(false);
                endLines.Add(true);
            }
            else if (children.Count == 1)
            {
                // Ligne simple → progression automatique si c'est un choix joueur
                bool isPlayer = node.type == "player";
                autoProgress.Add(isPlayer);
                endLines.Add(false);
                queue.Enqueue((nodeMap[children[0]], false));
            }
            else
            {
                // Plusieurs enfants → ce sont des choix joueur
                autoProgress.Add(false);
                endLines.Add(false);

                // Les enfants sont des nœuds "player" = boutons de choix
                var choiceTexts = new List<string>();
                var nextIndexes = new List<int>();

                foreach (var childId in children)
                {
                    var childNode = nodeMap[childId];
                    choiceTexts.Add(childNode.contenu);

                    // Les petits-enfants sont les réponses NPC
                    var grandChildren = childrenMap.GetValueOrDefault(childId, new List<string>());
                    foreach (var gcId in grandChildren)
                        queue.Enqueue((nodeMap[gcId], false));

                    // L'index sera résolu après (on enqueue d'abord)
                    nextIndexes.Add(-1); // placeholder
                }

                // On crée le choix — les index seront mis à jour au prochain passage
                choices.Add(new DialogueChoice
                {
                    dialogueIndex = currentIndex,
                    choices = choiceTexts.ToArray(),
                    nextDialogueIndexes = nextIndexes.ToArray()
                });
            }
        }

        // Résolution des index de choix
        foreach (var choice in choices)
        {
            var npcNode = response.dialogues[choice.dialogueIndex];
            var children = childrenMap.GetValueOrDefault(npcNode._id, new List<string>());

            for (int i = 0; i < children.Count; i++)
            {
                var childId = children[i];
                var grandChildren = childrenMap.GetValueOrDefault(childId, new List<string>());
                if (grandChildren.Count > 0 && indexMap.TryGetValue(grandChildren[0], out int idx))
                    choice.nextDialogueIndexes[i] = idx;
            }
        }

        dialogue.dialogueLines = lines.ToArray();
        dialogue.autoProgressLines = autoProgress.ToArray();
        dialogue.endDialogueLines = endLines.ToArray();
        dialogue.choices = choices.ToArray();
        dialogue.typingSpeed = 0.05f;
        dialogue.autoProgressDelay = 1.5f;
        dialogue.recapText = response.recap;
        return dialogue;
    }

    private string TryExtractAssignedScenario(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        string trimmed = raw.Trim();

        // API can return a plain string or a small JSON payload.
        if (!trimmed.StartsWith("{"))
        {
            return trimmed.Trim('"');
        }

        AssignedScenarioResponse wrapped = JsonUtility.FromJson<AssignedScenarioResponse>(trimmed);
        if (!string.IsNullOrWhiteSpace(wrapped?.scenarioName)) return wrapped.scenarioName;
        if (!string.IsNullOrWhiteSpace(wrapped?.scenario)) return wrapped.scenario;
        if (!string.IsNullOrWhiteSpace(wrapped?.name)) return wrapped.name;

        AssignedScenarioDataResponse dataWrapped = JsonUtility.FromJson<AssignedScenarioDataResponse>(trimmed);
        if (!string.IsNullOrWhiteSpace(dataWrapped?.data?.scenarioName)) return dataWrapped.data.scenarioName;
        if (!string.IsNullOrWhiteSpace(dataWrapped?.data?.scenario)) return dataWrapped.data.scenario;
        if (!string.IsNullOrWhiteSpace(dataWrapped?.data?.name)) return dataWrapped.data.name;

        return null;
    }
}

// Modèles JSON
[System.Serializable] public class ApiResponse
{
    public List<DialogueNode> dialogues;
    public List<DialogueConnection> connections;
    public string recap;
}

[System.Serializable] public class DialogueNode
{
    public string _id;
    public string contenu;
    public string type; // "npc" ou "player"
    public string locuteur;
    public string scenarioName;
}

[System.Serializable] public class DialogueConnection
{
    public string fromId;
    public string toId;
}

[System.Serializable] public class AssignedScenarioResponse
{
    public string scenarioName;
    public string scenario;
    public string name;
}

[System.Serializable] public class AssignedScenarioDataResponse
{
    public AssignedScenarioResponse data;
}