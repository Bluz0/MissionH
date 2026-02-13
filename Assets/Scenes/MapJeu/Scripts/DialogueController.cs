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
    /// <summary>
    /// Instance unique du DialogueController (singleton).
    /// </summary>
    public static DialogueController Instance { get; private set; }

    /// <summary>
    /// Panneau principal du dialogue.
    /// </summary>
    public GameObject dialoguePanel;

    /// <summary>
    /// Texte principal du dialogue.
    /// </summary>
    public TMP_Text dialogueText;

    /// <summary>
    /// Nom du PNJ affiché dans l’UI.
    /// </summary>
    public TMP_Text nameText;

    /// <summary>
    /// Portrait du PNJ.
    /// </summary>
    public Image portraitImage;

    /// <summary>
    /// Conteneur où seront instanciés les boutons de choix.
    /// </summary>
    public Transform choiceContainer;

    /// <summary>
    /// Prefab d’un bouton de choix.
    /// </summary>
    public GameObject choiceButtonPrefab;

    /// <summary>
    /// Initialise le singleton.
    /// </summary>
    void Awake()
    {
        if (Instance == null) Instance = this;
        else Destroy(gameObject);
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
}
