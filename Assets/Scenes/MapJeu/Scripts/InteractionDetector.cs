using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;

public class InteractionDetector : MonoBehaviour
{
    private IInteractable interactableInRange = null;

    [Header("UI Elements")]
    public GameObject interactionIcon;

    void Start()
    {
        if (interactionIcon != null) interactionIcon.SetActive(false);
    }

    public void OnInteract(InputAction.CallbackContext context)
    {
        if (context.performed)
        {
            PerformInteraction();
        }
    }

    /// <summary>
    /// Méthode appelée par ton bouton UI (Symbole validé).
    /// </summary>
    public void OnInteractButton()
    {
        PerformInteraction();
    }

    /// <summary>
    /// Logique centrale de l'interaction (Touche E ou Bouton Mobile).
    /// </summary>
    private void PerformInteraction()
    {
        // 1. PRIORITÉ : Si un dialogue est déjà à l'écran, on force le "Suivant"
        if (DialogueController.Instance != null && DialogueController.Instance.dialoguePanel.activeSelf)
        {
            // On cherche n'importe quel NPC actif dans la scène qui est en train de parler
            NPC[] allNPCs = Object.FindObjectsByType<NPC>(FindObjectsSortMode.None);
            foreach (NPC npc in allNPCs)
            {
                if (npc.IsDialogueActive()) // Utilise la petite fonction ajoutée plus tôt
                {
                    npc.Interact(); // Cela appellera NextLine()
                    return; // On arrête ici, mission accomplie
                }
            }
        }

        // 2. CAS NORMAL : On interagit avec le PNJ à proximité
        if (interactableInRange != null)
        {
            interactableInRange.Interact();
        }
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.TryGetComponent(out IInteractable interactable) && interactable.CanInteract())
        {
            interactableInRange = interactable;
            interactionIcon.SetActive(true);
        }
    }

    private void OnTriggerStay2D(Collider2D collision)
    {
        // Sécurité si on était déjà dans la zone mais que le CanInteract a changé
        if (interactableInRange == null && collision.TryGetComponent(out IInteractable interactable) && interactable.CanInteract())
        {
            interactableInRange = interactable;
            interactionIcon.SetActive(true);
        }
    }

    private void OnTriggerExit2D(Collider2D collision)
    {
        if (collision.TryGetComponent(out IInteractable interactable) && interactable == interactableInRange)
        {
            interactableInRange = null;
            interactionIcon.SetActive(false);
        }
    }
}