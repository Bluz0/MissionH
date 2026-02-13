using UnityEngine;
using UnityEngine.EventSystems;

/// <summary>
/// Gère un joystick virtuel pour les contrôles tactiles :
/// - calcule la direction d'entrée (valeurInput)
/// - déplace le handle en fonction du doigt
/// - remet le joystick à zéro lorsque le doigt est levé.
/// </summary>
public class Joystick : MonoBehaviour, IDragHandler, IPointerUpHandler, IPointerDownHandler
{
    /// <summary>
    /// Fond du joystick (zone circulaire).
    /// </summary>
    public RectTransform background;

    /// <summary>
    /// Poignée du joystick (élément mobile).
    /// </summary>
    public RectTransform handle;

    /// <summary>
    /// Valeur d'entrée normalisée (entre -1 et 1 sur X et Y).
    /// Utilisée par le PlayerMovement.
    /// </summary>
    public static Vector2 valeurInput;

    /// <summary>
    /// Position initiale du handle.
    /// </summary>
    private Vector2 handleStartPos;

    /// <summary>
    /// Centre du background, utilisé pour calculer la direction.
    /// </summary>
    private Vector2 backgroundCenter;

    /// <summary>
    /// Initialise les positions de référence du joystick.
    /// </summary>
    void Start()
    {
        handleStartPos = handle.anchoredPosition;
        backgroundCenter = background.rect.center;
    }

    /// <summary>
    /// Appelé lorsque le doigt glisse sur le joystick.
    /// Calcule la direction et déplace le handle.
    /// </summary>
    public void OnDrag(PointerEventData eventData)
    {
        Vector2 localPos;
        if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
            background,
            eventData.position,
            eventData.pressEventCamera,
            out localPos))
        {
            Vector2 offset = localPos - backgroundCenter;
            Vector2 radius = background.sizeDelta / 2f;
            
            Vector2 normalized = new Vector2(
                offset.x / radius.x,
                offset.y / radius.y
            );

            valeurInput = Vector2.ClampMagnitude(normalized, 1f);

            handle.anchoredPosition = handleStartPos + new Vector2(
                valeurInput.x * radius.x,
                valeurInput.y * radius.y
            );
        }
    }

    /// <summary>
    /// Lorsque le doigt touche le joystick, on traite immédiatement comme un drag.
    /// </summary>
    public void OnPointerDown(PointerEventData eventData) => OnDrag(eventData);

    /// <summary>
    /// Lorsque le doigt est levé, on remet le joystick au centre.
    /// </summary>
    public void OnPointerUp(PointerEventData eventData)
    {
        valeurInput = Vector2.zero;
        handle.anchoredPosition = handleStartPos;
    }
}
