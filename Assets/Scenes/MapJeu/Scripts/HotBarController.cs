using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem; // IMPORTANT pour le nouveau Input System

/// <summary>
/// Gère la hotbar du joueur :
/// - création dynamique des slots
/// - sélection visuelle d’un slot
/// - utilisation d’un item dans un slot
/// - sauvegarde et chargement des items de la hotbar.
/// </summary>
public class HotBarController : MonoBehaviour
{
    /// <summary>
    /// Panel contenant tous les slots de la hotbar.
    /// </summary>
    public GameObject hotbarPanel;

    /// <summary>
    /// Prefab d’un slot individuel.
    /// </summary>
    public GameObject slotPrefab;

    /// <summary>
    /// Nombre total de slots dans la hotbar.
    /// </summary>
    public int slotCount = 10;

    /// <summary>
    /// Tableau des touches associées aux slots (1 à 0).
    /// </summary>
    private Key[] hotbarKeys;

    /// <summary>
    /// Référence au dictionnaire d’items pour retrouver un item via son ID.
    /// </summary>
    private ItemDictionary itemDictionary;

    /// <summary>
    /// Highlight visuel indiquant quel slot est sélectionné.
    /// </summary>
    public RectTransform highlight;

    /// <summary>
    /// Index du slot actuellement sélectionné.
    /// </summary>
    private int selectedIndex = -1;

    /// <summary>
    /// Initialise la hotbar :
    /// - configure les touches
    /// - désactive le highlight
    /// - génère les slots.
/// </summary>
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

    /// <summary>
    /// Supprime les anciens slots (sauf le highlight) et recrée la hotbar.
    /// </summary>
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

    /// <summary>
    /// Utilise l’item contenu dans un slot donné, si présent.
    /// </summary>
    void UseItemInSlot(int index)
    {
        Slot slot = hotbarPanel.transform.GetChild(index).GetComponent<Slot>();

        if (slot.currentItem != null)
        {
            Item item = slot.currentItem.GetComponent<Item>();
            item.UseItem();
        }
    }

    /// <summary>
    /// Sélectionne un slot :
    /// - déplace le highlight dans ce slot
    /// - met à jour l’index sélectionné.
/// </summary>
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

    /// <summary>
    /// Récupère les items présents dans la hotbar pour la sauvegarde.
    /// </summary>
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

    /// <summary>
    /// Recharge la hotbar depuis les données sauvegardées :
    /// - régénère les slots
    /// - instancie les items correspondants.
/// </summary>
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
