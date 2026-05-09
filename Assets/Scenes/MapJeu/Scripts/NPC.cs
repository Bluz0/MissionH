using UnityEngine;
using TMPro;
using UnityEngine.UI;
using System.Collections;

/// <summary>
/// Gère toute la logique d'interaction avec un PNJ :
/// - lancement du dialogue, affichage typewriter, choix, fin de dialogue.
/// </summary>
public class NPC : MonoBehaviour, IInteractable
{
    [Header("Id PNJ")]
    public int npcId;

    [Header("Scénario API")]
    public string scenarioName;
    public string npcName;
    public Sprite npcPortrait;
    public int rewardAmount = 0;

    private NPCDialogue dialogueData;
    private DialogueController dialogueUI;
    private DialogueLoader loader;

    private bool isDialogueActive;
    private bool isTyping;
    private int dialogueIndex;
    private bool isLoaded = false;
    private bool needsToLoop;
    private int lastQuestionIndex;
    private bool dialogueCompletedFully = false;

    private int currentSessionReward;
    private const int MAX_REWARD = 20;
    private const int MIN_REWARD = 5;

    private Coroutine typeLineCoroutine;
    private Coroutine scenarioPollCoroutine;

    private string currentChunkFullText;

    private void Awake()
    {
        // Hash stable sur le nom pour générer un ID int positif.
        npcId = name.GetHashCode() & 0x7FFFFFFF;
    }

    public bool IsDialogueActive()
    {
        return isDialogueActive;
    }
    public void Start()
    {
        dialogueUI = DialogueController.Instance;
        loader = GetComponent<DialogueLoader>();
        if (loader == null) loader = gameObject.AddComponent<DialogueLoader>();

        // Initialisation initiale
        StartCoroutine(InitializeNPC());

        // Lance le polling pour les changements en temps réel
        scenarioPollCoroutine = StartCoroutine(PollScenarioChange());
    }

    private IEnumerator InitializeNPC()
    {
        yield return loader.FetchAssignedScenario(npcId, npcName, (assignedScenario, serverNpcName) =>
        {
            if (!string.IsNullOrWhiteSpace(serverNpcName))
                npcName = serverNpcName;

            if (!string.IsNullOrWhiteSpace(assignedScenario))
                scenarioName = assignedScenario;

            StartCoroutine(loader.LoadDialogue(scenarioName, (data) =>
            {
                data.npcName = npcName;
                data.npcPortrait = npcPortrait;
                dialogueData = data;
                isLoaded = true;
            }));
        });
    }

    private IEnumerator PollScenarioChange()
    {
        while (loader == null) yield return null;

        while (true)
        {
            yield return new WaitForSeconds(5f);
            if (isDialogueActive) continue; // On ne change pas le script pendant qu'on parle

            yield return loader.FetchAssignedScenario(npcId, npcName, (newScenarioName, serverNpcName) =>
            {
                if (!string.IsNullOrWhiteSpace(serverNpcName)) npcName = serverNpcName;

                if (!string.IsNullOrWhiteSpace(newScenarioName) && newScenarioName != scenarioName)
                {
                    scenarioName = newScenarioName;
                    isLoaded = false; // Bloque l'interaction le temps du reload
                    StartCoroutine(loader.LoadDialogue(scenarioName, (data) =>
                    {
                        data.npcName = npcName;
                        data.npcPortrait = npcPortrait;
                        dialogueData = data;
                        isLoaded = true;
                    }));
                }
            });
        }
    }

    private void OnEnable()
    {
        if (scenarioPollCoroutine == null && loader != null)
            scenarioPollCoroutine = StartCoroutine(PollScenarioChange());
    }

    private void OnDisable()
    {
        if (scenarioPollCoroutine != null)
        {
            StopCoroutine(scenarioPollCoroutine);
            scenarioPollCoroutine = null;
        }
        StopTypingCoroutine();
    }

    public bool CanInteract() => isLoaded && !isDialogueActive;

    public void Interact()
    {
        if (dialogueData == null || (PauseController.IsGamePaused && !isDialogueActive))
            return;

        if (isDialogueActive)
            NextLine();
        else
            StartDialogue();
    }

    void StartDialogue()
    {
        isDialogueActive = true;
        dialogueIndex = 0; // Sécurité : on repart bien de zéro
        needsToLoop = false;

        // Initialise la récompense au maximum au début du dialogue
        currentSessionReward = MAX_REWARD;

        dialogueUI.SetNPCInfo(this.npcName, npcPortrait);
        dialogueUI.ShowDialogueUI(true);
        PauseController.SetPause(true);

        DisplayCurrentLine();
    }

    void FinishLineInstantly()
    {
        StopTypingCoroutine();
        isTyping = false;
        dialogueUI.SetDialogueText(currentChunkFullText);
        
    }

    void NextLine()
    {
        if (isTyping)
        {
            FinishLineInstantly();
            return;
        }

        dialogueUI.ClearChoices();

        // Si on vient d'une mauvaise réponse, on boucle vers la question
        if (needsToLoop)
        {
            needsToLoop = false;
            dialogueIndex = lastQuestionIndex;
            DisplayCurrentLine();
            return;
        }

        // Vérification de fin de dialogue (Index ou Flag)
        if (dialogueIndex >= dialogueData.dialogueLines.Length || dialogueData.endDialogueLines[dialogueIndex])
        {
            dialogueCompletedFully = true;
            EndDialogue();
            return;
        }

        // Vérification des choix
        foreach (DialogueChoice choice in dialogueData.choices)
        {
            if (choice.dialogueIndex == dialogueIndex)
            {
                DisplayChoices(choice);
                return;
            }
        }

        // Progression via nextLineTarget ou simple incrément
        int nextIdx = dialogueData.nextLineTarget[dialogueIndex];
        if (nextIdx != -1)
        {
            dialogueIndex = nextIdx;
            DisplayCurrentLine();
        }
        else
        {
            EndDialogue();
        }
    }

    void DisplayCurrentLine()
    {
        StopTypingCoroutine();
        string rawText = dialogueData.dialogueLines[dialogueIndex];
        string cleanText = loader.SimpleRemoveAccents(rawText);
        dialogueUI.PrepareTextChunks(cleanText);
        DisplayNextChunk();
    }

    void DisplayNextChunk()
    {
        string chunk = dialogueUI.GetNextChunk();
        if (chunk != null)
        {
            currentChunkFullText = chunk;
            StopTypingCoroutine();
            typeLineCoroutine = StartCoroutine(TypeLine(chunk));
        }
    }

    IEnumerator TypeLine(string textToType)
    {
        isTyping = true;
        dialogueUI.SetDialogueText("");

        foreach (char letter in textToType)
        {
            dialogueUI.dialogueText.text += letter;
            yield return new WaitForSeconds(dialogueData.typingSpeed);
        }

        isTyping = false;

        if (!dialogueUI.HasMoreChunks())
        {
            if (dialogueData.autoProgressLines.Length > dialogueIndex && dialogueData.autoProgressLines[dialogueIndex])
            {
                yield return new WaitForSeconds(dialogueData.autoProgressDelay);
                NextLine();
            }
        }
    }

    void DisplayChoices(DialogueChoice choice)
    {
        lastQuestionIndex = dialogueIndex;

        for (int i = 0; i < choice.choices.Length; i++)
        {
            int targetIdx = choice.nextDialogueIndexes[i];
            bool isCorrect = choice.choicesCorrectness[i];
            string choiceText = loader.SimpleRemoveAccents(choice.choices[i]);
            // string choiceText = choice.choices[i]; ancienne version

            dialogueUI.CreateChoiceButton(choiceText, () =>
            {
                // --- LOGIQUE DE SCORE ---
                if (!isCorrect)
                {
                    // On retire 1 point, sans descendre en dessous du minimum (5)
                    currentSessionReward = Mathf.Max(MIN_REWARD, currentSessionReward - 1);
                    Debug.Log($"Mauvaise réponse ! Récompense actuelle : {currentSessionReward}");
                }
                // ------------------------
                dialogueIndex = targetIdx;
                needsToLoop = !isCorrect;
                ChooseOption(dialogueIndex);
            });
        }
    }

    void ChooseOption(int nextIndex)
    {
        dialogueIndex = nextIndex;
        dialogueUI.ClearChoices();
        DisplayCurrentLine();
    }

    private void StopTypingCoroutine()
    {
        if (typeLineCoroutine != null)
        {
            StopCoroutine(typeLineCoroutine);
            typeLineCoroutine = null;
        }
    }

    public void EndDialogue()
    {
        StopTypingCoroutine();

        // --- RESET DES ÉTATS POUR REPARLER ---
        isDialogueActive = false;
        dialogueIndex = 0;
        needsToLoop = false;

        // --- DISTRIBUTION DE LA RÉCOMPENSE ---
        if (dialogueCompletedFully)
        {
            HUDController hud = FindAnyObjectByType<HUDController>();
            if (hud != null)
            {
                hud.AddMoney(currentSessionReward);
                Debug.Log($"Succès ! Gain de {currentSessionReward} pièces.");
            }

            if (!string.IsNullOrEmpty(dialogueData.recapText))
            {
                string cleanRecap = loader.SimpleRemoveAccents(dialogueData.recapText);
                dialogueUI.ShowRecap(cleanRecap);
            }
        }
        else
        {
            Debug.Log("Dialogue quitté prématurément : pas de récompense ni de récap.");
        }

        // On remet à zéro pour le prochain dialogue
        dialogueCompletedFully = false;
        currentSessionReward = 0;
        dialogueIndex = 0;
        needsToLoop = false;

        dialogueUI.ClearChoices();
        dialogueUI.SetDialogueText("");
        dialogueUI.ShowDialogueUI(false);
        PauseController.SetPause(false);

    }
}