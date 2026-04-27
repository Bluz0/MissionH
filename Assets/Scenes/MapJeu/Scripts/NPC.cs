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

    private Coroutine typeLineCoroutine;
    private Coroutine scenarioPollCoroutine;

    private void Awake()
    {
        // Hash stable sur le nom pour générer un ID int positif.
        npcId = name.GetHashCode() & 0x7FFFFFFF;
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

        dialogueUI.SetNPCInfo(this.npcName, npcPortrait);
        dialogueUI.ShowDialogueUI(true);
        PauseController.SetPause(true);

        DisplayCurrentLine();
    }

    void NextLine()
    {
        if (isTyping) return;

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
        dialogueUI.PrepareTextChunks(dialogueData.dialogueLines[dialogueIndex]);
        DisplayNextChunk();
    }

    void DisplayNextChunk()
    {
        string chunk = dialogueUI.GetNextChunk();
        if (chunk != null)
        {
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
            string choiceText = choice.choices[i];

            dialogueUI.CreateChoiceButton(choiceText, () =>
            {
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

        // Récompense (vérifier si on ne veut la donner qu'une fois)
        if (rewardAmount > 0)
        {
            HUDController hud = FindAnyObjectByType<HUDController>();
            if (hud != null) hud.AddMoney(rewardAmount);
            rewardAmount = 0; // Évite de farmer le NPC en boucle
        }

        dialogueUI.ClearChoices();
        dialogueUI.SetDialogueText("");
        dialogueUI.ShowDialogueUI(false);
        PauseController.SetPause(false);

        if (!string.IsNullOrEmpty(dialogueData.recapText))
        {
            dialogueUI.ShowRecap(dialogueData.recapText);
        }
    }
}