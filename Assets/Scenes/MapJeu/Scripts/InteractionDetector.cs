using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;

/// <summary>
/// Détecte les objets interactifs autour du joueur :
/// - garde en mémoire l'interactable le plus proche
/// - affiche une icône d'interaction lorsqu'un interactable est à portée
/// - déclenche l'interaction via Input System ou via un bouton UI.
/// </summary>
public class InteractionDetector : MonoBehaviour
{
    /// <summary>
    /// Référence à l'objet interactif actuellement à portée.
    /// </summary>
    private IInteractable interactableInRange = null; // Closest Interactable

    /// <summary>
    /// Icône affichée lorsque le joueur peut interagir.
    /// </summary>
    public GameObject interactionIcon;

    /// <summary>
    /// Cache l'icône au démarrage.
    /// </summary>
    void Start()
    {
        interactionIcon.SetActive(false);
    }

    /// <summary>
    /// Appelé par l'Input System lorsque le joueur appuie sur la touche d'interaction.
    /// Déclenche l'interaction si un interactable est à portée.
    /// </summary>
    public void OnInteract(InputAction.CallbackContext context)
    {
        if (context.performed)
        {
            interactableInRange?.Interact();
        }
    }

    /// <summary>
    /// Lorsqu'un objet entre dans la zone de détection :
    /// - vérifie s'il implémente IInteractable
    /// - vérifie s'il est disponible pour interaction
    /// - affiche l'icône et le mémorise comme interactable courant.
/// </summary>
    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.TryGetComponent(out IInteractable interactable) && interactable.CanInteract())
        {
            interactableInRange = interactable;
            interactionIcon.SetActive(true);
        }
    }

    /// <summary>
    /// Lorsqu'un objet sort de la zone de détection :
    /// - si c'était l'interactable courant, on le retire
    /// - on masque l'icône.
/// </summary>
    private void OnTriggerExit2D(Collider2D collision)
    {
        if (collision.TryGetComponent(out IInteractable interactable) && interactable == interactableInRange)
        {
            interactableInRange = null;
            interactionIcon.SetActive(false);
        }
    }

    /// <summary>
    /// Méthode appelée par un bouton UI d'interaction (mobile par exemple).
    /// </summary>
    public void OnInteractButton()
    {
        interactableInRange?.Interact();
    }
}
