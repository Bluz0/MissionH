using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem; // IMPORTANT pour le nouveau Input System

public class HotBarController : MonoBehaviour
{
    public GameObject hotbarPanel;
    public GameObject slotPrefab;
    public int slotCount = 10;
    private Key[] hotbarKeys;
    private ItemDictionary itemDictionary;
    public RectTransform highlight;
    private int selectedIndex = -1;

    private void Awake()
    {
        itemDictionary = FindAnyObjectByType<ItemDictionary>();
        hotbarKeys = new Key[slotCount];
        for (int i = 0; i < slotCount; i++)
        {
            if (i < 9)
                hotbarKeys[i] = Key.Digit1 + i;
            else
                hotbarKeys[i] = Key.Digit0;
        }
        highlight.gameObject.SetActive(false);
        GenerateSlots();
    }

    public void GenerateSlots()
    {
        foreach (Transform child in hotbarPanel.transform)
        {
            if (child != highlight.transform)
                Destroy(child.gameObject);
        }

        for (int i = 0; i < slotCount; i++)
            Instantiate(slotPrefab, hotbarPanel.transform);
    }

    void UseItemInSlot(int index)
    {
        Slot slot = hotbarPanel.transform.GetChild(index).GetComponent<Slot>();

        if (slot.currentItem != null)
        {
            Item item = slot.currentItem.GetComponent<Item>();
            item.UseItem();
        }
    }

    public void SelectSlot(int index)
    {
        selectedIndex = index;

        Transform slot = hotbarPanel.transform.GetChild(index);
        if (!highlight.gameObject.activeSelf)
            highlight.gameObject.SetActive(true);
        highlight.SetParent(slot, false);

        highlight.anchoredPosition = Vector2.zero;
        highlight.SetAsLastSibling();
    }



    public List<InventorySaveData> GetHotBarItems()
    {
        List<InventorySaveData> HotBarData = new List<InventorySaveData>();
        foreach (Transform slotTransform in hotbarPanel.transform)
        {
            Slot slot = slotTransform.GetComponent<Slot>();
            if (slot.currentItem != null)
            {
                Item item = slot.currentItem.GetComponent<Item>();
                HotBarData.Add(new InventorySaveData
                {
                    itemID = item.ID,
                    slotIndex = slotTransform.GetSiblingIndex()
                });
            }
        }

        return HotBarData;
    }

    public void SetHotBarItems(List<InventorySaveData> hotbarSaveData)
    {
        GenerateSlots();

        foreach (InventorySaveData data in hotbarSaveData)
        {
            if (data.slotIndex < slotCount)
            {
                Slot slot = hotbarPanel.transform.GetChild(data.slotIndex).GetComponent<Slot>();
                GameObject itemPrefab = itemDictionary.GetItemPrefab(data.itemID);

                if (itemPrefab != null)
                {
                    GameObject item = Instantiate(itemPrefab, slot.transform);
                    item.GetComponent<RectTransform>().anchoredPosition = Vector2.zero;
                    slot.currentItem = item;
                }
            }
        }
    }

}
