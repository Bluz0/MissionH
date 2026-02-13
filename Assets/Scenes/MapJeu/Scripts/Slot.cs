using UnityEngine;

public class Slot : MonoBehaviour
{
    public GameObject currentItem;

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
