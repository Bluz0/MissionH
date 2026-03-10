using UnityEngine;
using UnityEngine.EventSystems;

/// <summary>
/// Gère les animations d’un bouton UI situé à droite.
/// Implémente les interfaces Pointer pour détecter :
/// - l’appui (PointerDown)
/// - le relâchement (PointerUp)
/// - le clic (PointerClick)
///
/// Chaque interaction déclenche une animation spécifique dans l’Animator.
/// </summary>
public class UIButtonPressAnimatorRight : MonoBehaviour,
    IPointerDownHandler, IPointerUpHandler, IPointerClickHandler
{
    /// <summary>
    /// Référence à l’Animator contrôlant les animations du bouton droit.
    /// Doit être assignée dans l’inspecteur Unity.
    /// </summary>
    public Animator anim;

    /// <summary>
    /// Appelé automatiquement lorsque le joueur appuie sur le bouton.
    /// Lance l’animation "PressedRight" depuis le début.
    /// </summary>
    public void OnPointerDown(PointerEventData eventData)
    {
        anim.Play("PressedRight", 0, 0f);
    }

    /// <summary>
    /// Appelé lorsque le joueur relâche le bouton.
    /// Rejoue l’animation Idle pour revenir à l’état normal.
    /// </summary>
    public void OnPointerUp(PointerEventData eventData)
    {
        anim.Play("IdleRightButton", 0, 0f);
    }

    /// <summary>
    /// Appelé lors d’un clic complet (appui + relâchement).
    /// Joue brièvement l’animation de pression puis revient à l’état Idle.
    /// </summary>
    public void OnPointerClick(PointerEventData eventData)
    {
        anim.Play("PressedRight", 0, 0f);
        anim.Play("IdleRightButton", 0, 0f);
    }
}
