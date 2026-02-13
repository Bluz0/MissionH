using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

/// <summary>
/// Gère le drag & drop des items dans l'inventaire :
/// - mémorise le slot d'origine
/// - permet de déplacer l'item sous le doigt
/// - détecte le slot de destination
/// - échange les items si nécessaire.
/// </summary>
public class ItemDragHandler : MonoBehaviour, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    /// <summary>
    /// Parent d'origine de l'item (le slot où il se trouvait).
    /// </summary>
    Transform originalParent;

    /// <summary>
    /// CanvasGroup utilisé pour gérer la transparence et les raycasts.
    /// </summary>
    CanvasGroup canvasGroup;

    /// <summary>
    /// Récupère le CanvasGroup au démarrage.
    /// </summary>
    void Start()
    {
        canvasGroup = GetComponent<CanvasGroup>();
    }

    /// <summary>
    /// Début du drag :
    /// - mémorise le parent d'origine
    /// - place l'item tout en haut de la hiérarchie pour suivre le doigt
    /// - désactive les raycasts pour permettre la détection du slot sous l'item
    /// - rend l'item semi-transparent.
    /// </summary>
    public void OnBeginDrag(PointerEventData eventData)
    {
        originalParent = transform.parent;
        transform.SetParent(transform.root);
        canvasGroup.blocksRaycasts = false;
        canvasGroup.alpha = 0.6f;
    }

    /// <summary>
    /// Déplacement de l'item sous le doigt.
    /// </summary>
    public void OnDrag(PointerEventData eventData)
    {
        transform.position = eventData.position;
    }

    /// <summary>
    /// Fin du drag :
    /// - réactive les raycasts
    /// - remet l'opacité normale
    /// - détecte le slot sur lequel l'item a été lâché
    /// - échange les items si nécessaire
    /// - remet l'item dans un slot valide.
/// </summary>
    public void OnEndDrag(PointerEventData eventData)
    {
        canvasGroup.blocksRaycasts = true;
        canvasGroup.alpha = 1f;

        Slot dropSlot = eventData.pointerEnter?.GetComponentInParent<Slot>();
        if(dropSlot != null)
        {
            GameObject dropItem = eventData.pointerEnter;
            if(dropItem != null)
            {
                dropSlot = dropItem.GetComponentInParent<Slot>();
            }
        }

        Slot originalSlot = originalParent.GetComponent<Slot>();

        if(dropSlot != null)
        {
            // Si le slot de destination contient déjà un item, on l'échange
            if(dropSlot.currentItem != null)
            {
                dropSlot.currentItem.transform.SetParent(originalSlot.transform);
                originalSlot.currentItem = dropSlot.currentItem;
                dropSlot.currentItem.GetComponent<RectTransform>().anchoredPosition = Vector2.zero;
            }
            else
            {
                originalSlot.currentItem = null;
            }

            // Place l'item dans le nouveau slot
            transform.SetParent(dropSlot.transform);
            dropSlot.currentItem = gameObject;
        }
        else
        {
            // Si pas de slot valide, retour au slot d'origine
            transform.SetParent(originalParent);
        }

        // Réinitialise la position dans le slot
        GetComponent<RectTransform>().anchoredPosition = Vector2.zero;
    }
}
