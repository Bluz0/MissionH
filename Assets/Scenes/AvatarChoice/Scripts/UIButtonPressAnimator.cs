using UnityEngine;
using UnityEngine.EventSystems;

/// <summary>
/// Gère les animations d’un bouton UI lors des interactions du joueur.
/// Implémente les interfaces d’événements Pointer pour détecter :
/// - l’appui (PointerDown)
/// - le relâchement (PointerUp)
/// - le clic (PointerClick)
///
/// Chaque événement déclenche une animation spécifique dans l’Animator.
/// </summary>
public class UIButtonPressAnimator : MonoBehaviour,
    IPointerDownHandler, IPointerUpHandler, IPointerClickHandler
{
    /// <summary>
    /// Référence à l’Animator contrôlant les animations du bouton.
    /// Doit être assignée dans l’inspecteur.
    /// </summary>
    public Animator anim;

    /// <summary>
    /// Appelé automatiquement lorsque le joueur appuie sur le bouton.
    /// Lance l’animation "PressedLeft" depuis le début.
    /// </summary>
    public void OnPointerDown(PointerEventData eventData)
    {
        anim.Play("PressedLeft", 0, 0f);
    }

    /// <summary>
    /// Appelé lorsque le joueur relâche le bouton.
    /// Rejoue l’animation Idle pour revenir à l’état normal.
    /// </summary>
    public void OnPointerUp(PointerEventData eventData)
    {
        anim.Play("IdleLeftButton", 0, 0f);
    }

    /// <summary>
    /// Appelé lors d’un clic complet (appui + relâchement).
    /// Joue rapidement l’animation de pression puis revient à l’état Idle.
    /// </summary>
    public void OnPointerClick(PointerEventData eventData)
    {
        anim.Play("PressedLeft", 0, 0f);
        anim.Play("IdleLeftButton", 0, 0f);
    }
}
