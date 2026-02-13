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
    /// <summary>
    /// Données du dialogue du PNJ (texte, choix, portrait, etc.).
    /// </summary>
    public NPCDialogue dialogueData;

    /// <summary>
    /// Référence à l'UI de dialogue (singleton).
    /// </summary>
    private DialogueController dialogueUI;

    /// <summary>
    /// Index de la ligne de dialogue actuellement affichée.
    /// </summary>
    private int dialogueIndex;

    /// <summary>
    /// Indique si le texte est en train d'être écrit lettre par lettre.
    /// </summary>
    private bool isTyping;

    /// <summary>
    /// Indique si un dialogue est actuellement actif.
    /// </summary>
    private bool isDialogueActive;

    /// <summary>
    /// Récupère la référence au DialogueController.
    /// </summary>
    public void Start()
    {
        dialogueUI = DialogueController.Instance;
    }

    /// <summary>
    /// Le joueur peut interagir seulement si aucun dialogue n'est en cours.
    /// </summary>
    public bool CanInteract()
    {
        return !isDialogueActive;
    }

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

        dialogueUI.SetNPCInfo(dialogueData.npcName, dialogueData.npcPortrait);
        dialogueUI.ShowDialogueUI(true);
        PauseController.SetPause(true);

        DisplayCurrentLine();
    }

    /// <summary>
    /// Passe à la ligne suivante ou affiche les choix si nécessaire.
    /// </summary>
    void NextLine()
    {
        if (isTyping)
        {
            StopAllCoroutines();
            dialogueUI.SetDialogueText(dialogueData.dialogueLines[dialogueIndex]);
            isTyping = false;
        }

        dialogueUI.ClearChoices();

        // Vérifie si cette ligne doit mettre fin au dialogue
        if (dialogueData.endDialogueLines.Length > dialogueIndex && dialogueData.endDialogueLines[dialogueIndex])
        {
            EndDialogue();
            return;
        }

        // Vérifie si cette ligne propose des choix
        foreach (DialogueChoice dialogueChoice in dialogueData.choices)
        {
            if (dialogueChoice.dialogueIndex == dialogueIndex)
            {
                DisplayChoices(dialogueChoice);
                return;
            }
        }

        // Passe à la ligne suivante
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
    IEnumerator TypeLine()
    {
        isTyping = true;
        dialogueUI.SetDialogueText("");

        foreach (char letter in dialogueData.dialogueLines[dialogueIndex])
        {
            dialogueUI.SetDialogueText(dialogueUI.dialogueText.text += letter);
            SoundEffectManager.PlayVoice(dialogueData.voiceSound, dialogueData.voicePitch);
            yield return new WaitForSeconds(dialogueData.typingSpeed);
        }

        isTyping = false;

        // Progression automatique si activée pour cette ligne
        if (dialogueData.autoProgressLines.Length > dialogueIndex && dialogueData.autoProgressLines[dialogueIndex])
        {
            yield return new WaitForSeconds(dialogueData.autoProgressDelay);
            NextLine();
        }
    }

    /// <summary>
    /// Affiche les boutons de choix pour une ligne donnée.
    /// </summary>
    void DisplayChoices(DialogueChoice choice)
    {
        for (int i = 0; i < choice.choices.Length; i++)
        {
            int nextIndex = choice.nextDialogueIndexes[i];
            dialogueUI.CreateChoiceButton(choice.choices[i], () => ChooseOption(nextIndex));
        }
    }

    /// <summary>
    /// Applique le choix sélectionné et passe /// </summary>
    void DisplayChoices(DialogueChoice choice)
    {
        for (int i = 0; i < choice.choices.Length; i++)
        {
            int nextIndex = choice.nextDialogueIndexes[i];
            dialogueUI.CreateChoiceButton(choice.choices[i], () => ChooseOption(nextIndex));
        }
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
        StopAllCoroutines();
        StartCoroutine(TypeLine());
    }

    /// <summary>
    /// Termine le dialogue, cache l'UI et réactive le jeu.
    /// </summary>
    public void EndDialogue()
    {
        StopAllCoroutines();
        isDialogueActive = false;
        dialogueUI.SetDialogueText("");
        dialogueUI.ShowDialogueUI(false);
        PauseController.SetPause(false);
    }
}
