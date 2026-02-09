using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using TMPro; // Nécessaire pour TextMeshPro
using UnityEngine.UI;
using System;

public class DialogManager : MonoBehaviour
{
    [SerializeField] GameObject dialogBox;
    [SerializeField] Text dialogText; 
    [SerializeField] int lettersPerSecond;

    // AJOUT : Référence au texte du bouton
    [SerializeField] TMP_Text interactButtonText; 

    public event Action OnshowDialog;
    public event Action OnHideDialog;
    public static DialogManager Instance { get; private set; }

    private void Awake()
    {
        Instance = this;
    }

    Dialog dialog;
    int currentLine = 0;
    bool isTyping;

    public IEnumerator ShowDialog(Dialog dialog)
    {
        yield return new WaitForEndOfFrame();
        
        // On change le texte du bouton au début du dialogue
        if (interactButtonText != null) interactButtonText.text = "Suivant";

        OnshowDialog?.Invoke();

        this.dialog = dialog;
        dialogBox.SetActive(true);
        StartCoroutine(TypeDialog(dialog.Lines[0]));
    }

    public void OnNextLinePressed()
    {
        if (!isTyping)
        {
            ++currentLine;
            if (currentLine < dialog.Lines.Count)
            {
                StartCoroutine(TypeDialog(dialog.Lines[currentLine]));
            }
            else
            {
                // Fin du dialogue : on ferme et on remet le texte initial
                dialogBox.SetActive(false);
                currentLine = 0;

                if (interactButtonText != null) interactButtonText.text = "Interagir";

                OnHideDialog?.Invoke();
            }
        }
    }

    public void HandleUpdate()
    {
        // On garde la touche F pour le debug PC
        if (UnityEngine.InputSystem.Keyboard.current.fKey.wasPressedThisFrame && !isTyping)
        {
            OnNextLinePressed();
        }
    }

    public IEnumerator TypeDialog(string line)
    {
        isTyping = true;
        dialogText.text = "";
        foreach (var letter in line.ToCharArray())
        {
            dialogText.text += letter;
            yield return new WaitForSeconds(1f / lettersPerSecond);
        }
        isTyping = false;
    }
}
