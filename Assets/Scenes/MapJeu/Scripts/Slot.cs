using UnityEngine;

/// <summary>
/// Représente un slot d'inventaire :
/// - informe le HotBarController lorsqu'il est cliqué
/// - utilise l'item présent dans le slot si un objet est assigné.
/// </summary>
public class Slot : MonoBehaviour
{
    /// <summary>
    /// Référence à l'objet actuellement placé dans le slot.
    /// Peut être null si le slot est vide.
    /// </summary>
    public GameObject currentItem;

    /// <summary>
    /// Appelé lorsqu'on clique sur le slot :
    /// - sélectionne ce slot dans la hotbar
    /// - utilise l'item s'il est présent.
    /// </summary>
    public void OnSlotClicked()
    {
        FindAnyObjectByType<HotBarController>().SelectSlot(transform.GetSiblingIndex());

        if (currentItem != null)
        {
            Item item = currentItem.GetComponent<Item>();
            item.UseItem();
        }
    }
}
