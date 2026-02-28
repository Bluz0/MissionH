using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Gère l'inventaire du joueur :
/// - génère les slots au démarrage
/// - instancie les items de départ
/// - fournit les données nécessaires à la sauvegarde
/// - restaure l'inventaire depuis une sauvegarde.
/// </summary>
public class InventoryController : MonoBehaviour
{
    /// <summary>
    /// Référence au dictionnaire d'items permettant de retrouver un item via son ID.
    /// </summary>
    private ItemDictionary itemDictionary;

    /// <summary>
    /// Panel contenant tous les slots de l'inventaire.
    /// </summary>
    public GameObject inventoryPanel;

    /// <summary>
    /// Prefab d'un slot d'inventaire.
    /// </summary>
    public GameObject slotPrefab;

    /// <summary>
    /// Nombre total de slots dans l'inventaire.
    /// </summary>
    public int slotCount;

    /// <summary>
    /// Liste des items de départ à placer dans les premiers slots.
    /// </summary>
    public GameObject[] itemPrefabs;

    /// <summary>
    /// Initialise l'inventaire :
    /// - récupère le dictionnaire d'items
    /// - crée les slots
    /// - instancie les items de départ si présents.
    /// </summary>
    void Start()
    {
        itemDictionary = FindAnyObjectByType<ItemDictionary>();

        for(int i = 0; i < slotCount; i++)
        {
            Slot slot = Instantiate(slotPrefab, inventoryPanel.transform).GetComponent<Slot>();

            if(i < itemPrefabs.Length)
            {
                GameObject item = Instantiate(itemPrefabs[i], slot.transform);
                item.GetComponent<RectTransform>().anchoredPosition = Vector2.zero;
                slot.currentItem = item;
            }
        }
    }

    /// <summary>
    /// Récupère la liste des items présents dans l'inventaire
    /// afin de les sauvegarder :
    /// - itemID : identifiant unique de l'item
    /// - slotIndex : position du slot dans l'inventaire.
    /// </summary>
    public List<InventorySaveData> GetInventoryItems()
    {
        List<InventorySaveData> invData = new List<InventorySaveData>();

        foreach(Transform slotTransform in inventoryPanel.transform)
        {
            Slot slot = slotTransform.GetComponent<Slot>();

            if(slot.currentItem != null)
            {
                Item item = slot.currentItem.GetComponent<Item>();
                invData.Add(new InventorySaveData
                {
                    itemID = item.ID,
                    slotIndex = slotTransform.GetSiblingIndex()
                });
            }
        }

        return invData;
    }

    /// <summary>
    /// Recharge l'inventaire depuis les données sauvegardées :
    /// - détruit les anciens slots
    /// - recrée les slots vides
    /// - instancie les items correspondant aux IDs sauvegardés.
/// </summary>
    public void SetInventoryItems(List<InventorySaveData> inventorySaveData)
    {
        // Supprime tous les slots existants
        foreach (Transform child in inventoryPanel.transform)
        {
            Destroy(child.gameObject);
        }

        // Recrée les slots vides
        for (int i = 0; i < slotCount; i++)
        {
            Instantiate(slotPrefab, inventoryPanel.transform);
        }
        
        // Remplit les slots avec les items sauvegardés
        foreach (InventorySaveData data in inventorySaveData)
        {
            if (data.slotIndex < slotCount)
            {
                Slot slot = inventoryPanel.transform.GetChild(data.slotIndex).GetComponent<Slot>();
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
