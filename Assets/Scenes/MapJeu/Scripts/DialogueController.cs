using UnityEngine;
using TMPro;
using UnityEngine.UI;
using System.Collections;

/// <summary>
/// Contrôle toute l’interface de dialogue :
/// - affichage/masquage du panneau
/// - mise à jour du nom, portrait et texte
/// - création dynamique des choix
/// - gestion du singleton pour un accès global.
/// </summary>
public class DialogueController : MonoBehaviour
{
    public static DialogueController Instance { get; private set; }

    [Header("Dialogue UI")]
    public GameObject dialoguePanel;
    public TMP_Text dialogueText;
    public TMP_Text nameText;
    public Image portraitImage;

    [Header("Choix")]
    public Transform choiceContainer;
    public GameObject choiceButtonPrefab;

    [Header("Page Récap")]
    public GameObject recapPanel;
    public TMP_Text recapText;

    /// <summary>
    /// Initialise le singleton.
    /// </summary>
    void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
        if (recapPanel != null)
            recapPanel.SetActive(false);
    }

    /// <summary>
    /// Affiche ou masque l’UI du dialogue.
    /// </summary>
    public void ShowDialogueUI(bool show)
    {
        dialoguePanel.SetActive(show);
    }

    /// <summary>
    /// Met à jour le nom et le portrait du PNJ.
    /// </summary>
    public void SetNPCInfo(string npcName, Sprite portrait)
    {
        nameText.text = npcName;
        portraitImage.sprite = portrait;
    }

    /// <summary>
    /// Met à jour le texte du dialogue.
    /// </summary>
    public void SetDialogueText(string text)
    {
        dialogueText.text = text;
    }

    /// <summary>
    /// Supprime tous les choix affichés.
    /// </summary>
    public void ClearChoices()
    {
        foreach (Transform child in choiceContainer)
            Destroy(child.gameObject);
    }

    /// <summary>
    /// Crée un bouton de choix :
    /// - instancie le prefab
    /// - définit le texte
    /// - ajoute l’action associée.
    /// </summary>
    public GameObject CreateChoiceButton(string choiceText, UnityEngine.Events.UnityAction onClick)
    {
        GameObject choiceButton = Instantiate(choiceButtonPrefab, choiceContainer);
        choiceButton.GetComponentInChildren<TMP_Text>().text = choiceText;
        choiceButton.GetComponent<Button>().onClick.AddListener(onClick);
        return choiceButton;
    }


    /// <summary>
    /// Affiche la page récap avec un texte donné.
    /// Appelé par le script NPC à la fin d’un dialogue.
    /// </summary>
    public void ShowRecap(string text)
    {
        recapText.text = text;
        recapPanel.SetActive(true);
    }

    /// <summary>
    /// Ferme la page récap.
    /// Appelé par un bouton UI.
    /// </summary>
    public void CloseRecap()
    {
        recapPanel.SetActive(false);
    }
}
