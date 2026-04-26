using UnityEngine;
using TMPro;
using UnityEngine.UI;
using System.Collections;

/// <summary>
/// Gère toute la logique d'interaction avec un PNJ :
/// - lancement du dialogue
/// - affichage progressif du texte (typewriter)
/// - choix multiples
/// - progression automatique
/// - fin du dialogue.
/// Implémente IInteractable pour être utilisé par le système d'interaction du joueur.
/// </summary>
public class NPC : MonoBehaviour, IInteractable
{

    [Header("Id PNJ")]
    public int npcId;

    /// <summary>
    /// Nom du scénario à charger depuis l'API ou la source de dialogues.
    /// </summary>
    [Header("Scénario API")]
    public string scenarioName;

    /// <summary>
    /// Nom affiché du PNJ dans l'interface de dialogue.
    /// </summary>
    public string npcName;

    /// <summary>
    /// Portrait du PNJ affiché pendant la conversation.
    /// </summary>
    public Sprite npcPortrait;

    /// <summary>
    /// Montant de pièces accordé au joueur à la fin du dialogue.
    /// </summary>
    public int rewardAmount = 0;

    /// <summary>
    /// Données du dialogue actuellement chargées pour ce PNJ.
    /// </summary>
    private NPCDialogue dialogueData;

    /// <summary>
    /// Référence au contrôleur d'interface de dialogue.
    /// </summary>
    private DialogueController dialogueUI;

    /// <summary>
    /// Composant chargé de récupérer et préparer les dialogues.
    /// </summary>
    private DialogueLoader loader;

    /// <summary>
    /// Indique si une conversation avec ce PNJ est en cours.
    /// </summary>
    private bool isDialogueActive;

    /// <summary>
    /// Indique si la ligne actuelle est en cours d'écriture progressive.
    /// </summary>
    private bool isTyping;

    /// <summary>
    /// Index de la ligne de dialogue actuellement affichée.
    /// </summary>
    private int dialogueIndex;

    /// <summary>
    /// Indique si les données de dialogue ont bien été préchargées.
    /// </summary>
    private bool isLoaded = false;

    private Coroutine typeLineCoroutine;
    private Coroutine scenarioPollCoroutine;

    private IEnumerator PollScenarioChange()
    {
        while (loader == null)
        {
            yield return null;
        }

        while (true)
        {
            yield return new WaitForSeconds(5f); // toutes les 5s
            yield return loader.FetchAssignedScenario(npcId, npcName, (newScenarioName, serverNpcName) =>
            {
                if (!string.IsNullOrWhiteSpace(serverNpcName))
                    npcName = serverNpcName;

                if (!string.IsNullOrWhiteSpace(newScenarioName) && newScenarioName != scenarioName && !isDialogueActive)
                {
                    scenarioName = newScenarioName;
                    // On recharge le dialogue
                    StartCoroutine(loader.LoadDialogue(scenarioName, (data) => {
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
        if (scenarioPollCoroutine == null)
        {
            scenarioPollCoroutine = StartCoroutine(PollScenarioChange());
        }
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

    private void StopTypingCoroutine()
    {
        if (typeLineCoroutine != null)
        {
            StopCoroutine(typeLineCoroutine);
            typeLineCoroutine = null;
        }
    }

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

        // Récupère d'abord le scénario assigné depuis l'API admin
        StartCoroutine(loader.FetchAssignedScenario(npcId, npcName, (assignedScenario, serverNpcName) =>
        {
            if (!string.IsNullOrWhiteSpace(serverNpcName))
                npcName = serverNpcName; 

            if (!string.IsNullOrWhiteSpace(assignedScenario))
                scenarioName = assignedScenario;

            // Charge le dialogue correspondant
            StartCoroutine(loader.LoadDialogue(scenarioName, (data) =>
            {
                data.npcName = npcName;
                data.npcPortrait = npcPortrait;
                dialogueData = data;
                isLoaded = true;
            }));
        }));

        // Lance le polling pour les changements en temps réel
        scenarioPollCoroutine = StartCoroutine(PollScenarioChange());

    }
    /// <summary>
    /// Le joueur peut interagir seulement si aucun dialogue n'est en cours.
    /// </summary>

    public bool CanInteract() => isLoaded && !isDialogueActive;


    /// <summary>
    /// Déclenche ou avance le dialogue selon l'état actuel.
    /// </summary>
    public void Interact()
    {
        if (dialogueData == null || (PauseController.IsGamePaused && !isDialogueActive))
            return;

        if (isDialogueActive)
        {
            NextLine();
        }
        else
        {
            StartDialogue();
        }
    }

    /// <summary>
    /// Initialise le dialogue, affiche l'UI et bloque le jeu.
    /// </summary>
    void StartDialogue()
    {
        isDialogueActive = true;
        dialogueIndex = 0;

        dialogueUI.SetNPCInfo(this.npcName, npcPortrait);
        
        dialogueUI.ShowDialogueUI(true);
        PauseController.SetPause(true);

        DisplayCurrentLine();
    }

    /// <summary>
    /// Passe à la ligne suivante ou affiche les choix si nécessaire.
    /// </summary>
    void NextLine()
    {
        // 1. Si le texte est en train de s'écrire, on l'affiche instantanément (Skip)
        if (isTyping)
        {
            StopTypingCoroutine();
            // On récupère le texte complet du morceau actuel via le contrôleur
            // (Note: Assure-tu que la variable actuelle est bien affichée)
            isTyping = false;
            return; 
        }

        // 2. Nettoyer les anciens choix UI
        dialogueUI.ClearChoices();

        // 3. PRIORITÉ : Est-ce qu'il reste des morceaux (chunks) de la phrase actuelle ?
        if (dialogueUI.HasMoreChunks())
        {
            DisplayNextChunk(); // Affiche la suite du long texte
            return; // On s'arrête ici pour ne pas passer à la suite du scénario
        }

        // 4. Si plus de morceaux, on regarde si la ligne actuelle marquait la FIN du dialogue
        if (dialogueData.endDialogueLines.Length > dialogueIndex && dialogueData.endDialogueLines[dialogueIndex])
        {
            EndDialogue();
            return;
        }

        // 5. On regarde si la ligne actuelle doit afficher des CHOIX
        foreach (DialogueChoice dialogueChoice in dialogueData.choices)
        {
            if (dialogueChoice.dialogueIndex == dialogueIndex)
            {
                DisplayChoices(dialogueChoice);
                return;
            }
        }

        // 6. Sinon, on passe à l'INDEX de dialogue suivant dans le scénario
        if (++dialogueIndex < dialogueData.dialogueLines.Length)
        {
            DisplayCurrentLine();
        }
        else
        {
            EndDialogue();
        }
    }

    /// <summary>
    /// Effet "machine à écrire" pour afficher le texte progressivement.
    /// </summary>
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
        // --- LOGIQUE DE PROGRESSION AUTOMATIQUE ---
        // On ne lance la progression automatique QUE s'il n'y a plus de morceaux de texte à lire
        // pour éviter de "sauter" des morceaux si le PNJ est en mode autoProgress.
        if (!dialogueUI.HasMoreChunks())
        {
            if (dialogueData.autoProgressLines.Length > dialogueIndex && dialogueData.autoProgressLines[dialogueIndex])
            {
                yield return new WaitForSeconds(dialogueData.autoProgressDelay);
                NextLine();
            }
        }
    }

    private int lastQuestionIndex;

    /// <summary>
    /// Applique le choix sélectionné et passe /// </summary>
    ///
    void DisplayChoices(DialogueChoice choice)
    {
        lastQuestionIndex = dialogueIndex; 

        for (int i = 0; i < choice.choices.Length; i++)
        {
            string text = choice.choices[i];
            int nextIdx = choice.nextDialogueIndexes[i];
            
            // On récupère le drapeau isCorrect pour l'INDEX DU CHOIX (le nœud bleu)
            bool isCorrectChoice = dialogueData.isCorrectFlags[nextIdx];

            dialogueUI.CreateChoiceButton(text, () => {
                if (!isCorrectChoice) {
                    // MAUVAISE RÉPONSE : On lance le message d'erreur puis on revient à la question
                    StartCoroutine(WrongAnswerRoutine(nextIdx));
                } else {
                    // BONNE RÉPONSE : On avance simplement vers la suite du scénario
                    ChooseOption(nextIdx);
                }
            });
        }
    }

    IEnumerator WrongAnswerRoutine(int feedbackIndex)
    {
        // Affiche le message de feedback du PNJ (ex: "Ce n'est pas ça...")
        dialogueIndex = feedbackIndex;
        DisplayCurrentLine();

        //  Attend que l'écriture soit finie
        yield return new WaitUntil(() => !isTyping);
        
        // Attend un clic du joueur pour passer le message d'erreur
        yield return new WaitUntil(() => Input.GetMouseButtonDown(0)); 

        // BOUCLE : On revient à la question d'origine
        dialogueIndex = lastQuestionIndex;
        DisplayCurrentLine();
    }

    /// <summary>
    /// à la ligne correspondante.
    /// </summary>
    void ChooseOption(int nextIndex)
    {
        dialogueIndex = nextIndex;
        dialogueUI.ClearChoices();
        DisplayCurrentLine();
    }

    /// <summary>
    /// Affiche la ligne actuelle en lançant la coroutine de typing.
    /// </summary>
    void DisplayCurrentLine()
    {
        StopTypingCoroutine();
        // On découpe la nouvelle ligne en morceaux
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

    /// <summary>
    /// Donne la récompense en pièces au joueur.
    /// </summary>
    void GiveReward()
    {
        if (rewardAmount > 0)
        {
            HUDController hud = FindAnyObjectByType<HUDController>();
            hud.AddMoney(rewardAmount);
        }
    }

   



    /// <summary>
    /// Termine le dialogue, cache l'UI et réactive le jeu.
    /// </summary>
    public void EndDialogue()
    {
        StopTypingCoroutine();
        isDialogueActive = false;

        if (rewardAmount > 0)
        {
            HUDController hud = FindAnyObjectByType<HUDController>();
            hud.AddMoney(rewardAmount);
        }

        dialogueUI.SetDialogueText("");
        dialogueUI.ShowDialogueUI(false);
        PauseController.SetPause(false);

        if (!string.IsNullOrEmpty(dialogueData.recapText)){
        dialogueUI.ShowRecap(dialogueData.recapText);
        }
    }
}
