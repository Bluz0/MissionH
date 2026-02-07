using UnityEngine;
using UnityEngine.EventSystems;

public class Joystick : MonoBehaviour, IDragHandler, IPointerUpHandler, IPointerDownHandler
{
    public RectTransform background;
    public RectTransform handle;

    public static Vector2 valeurInput;

    private Vector2 handleStartPos;
    private Vector2 backgroundCenter;

    void Start()
    {
        handleStartPos = handle.anchoredPosition;
        backgroundCenter = background.rect.center;
    }

    public void OnDrag(PointerEventData eventData)
    {
        Vector2 localPos;
        if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
            background,
            eventData.position,
            eventData.pressEventCamera,
            out localPos))
        {
            // Position relative AU CENTRE du background
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

    public void OnPointerDown(PointerEventData eventData)
    {
        OnDrag(eventData);
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        valeurInput = Vector2.zero;
        handle.anchoredPosition = handleStartPos;
    }
}
