using UnityEngine;

/// <summary>
/// Rend une porte (Tilemap) interactive.
/// Lorsqu'on interagit avec elle, elle déclenche la transition MapTransitions.
/// </summary>
public class DoorInteractable : MonoBehaviour, IInteractable
{
    [Header("Référence à la transition de zone")]
    public MapTransitions transition; // Le script MapTransitions associé à cette porte

    /// <summary>
    /// La porte peut toujours être utilisée.
    /// (Tu peux ajouter des conditions : clé, quête, etc.)
    /// </summary>
    public bool CanInteract()
    {
        return true;
    }

    /// <summary>
    /// Appelé lorsque le joueur appuie sur la touche d'interaction.
    /// Déclenche la transition de zone.
    /// </summary>
    public void Interact()
    {
        if (transition != null)
        {
            transition.TriggerFromInteract();
        }
    }
}
