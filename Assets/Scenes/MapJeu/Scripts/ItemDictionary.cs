using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Gère un dictionnaire d'items permettant :
/// - d'attribuer automatiquement un ID unique à chaque prefab d'item
/// - de retrouver rapidement un item via son ID
/// Ce système est utilisé pour sauvegarder/charger l'inventaire.
/// </summary>
public class ItemDictionary : MonoBehaviour
{
    /// <summary>
    /// Liste des prefabs d'items disponibles dans le jeu.
    /// Chaque item recevra un ID unique basé sur son index.
    /// </summary>
    public List<Item> itemPrefabs;

    /// <summary>
    /// Dictionnaire associant un ID d'item à son prefab.
    /// </summary>
    private Dictionary<int, GameObject> itemDictionary;

    /// <summary>
    /// Initialise le dictionnaire :
    /// - assigne un ID unique à chaque item
    /// - remplit le dictionnaire pour un accès rapide.
    /// </summary>
    private void Awake()
    {
        itemDictionary = new Dictionary<int, GameObject>();

        // Assigne un ID unique à chaque item
        for (int i = 0; i < itemPrefabs.Count; i++)
        {
            if (itemPrefabs[i] != null)
            {
                itemPrefabs[i].ID = i + 1;
            }
        }

        // Remplit le dictionnaire
        foreach (Item item in itemPrefabs)
        {
            itemDictionary[item.ID] = item.gameObject;
        }
    }

    /// <summary>
    /// Retourne le prefab correspondant à un ID donné.
    /// Affiche un avertissement si l'ID n'existe pas.
    /// </summary>
    public GameObject GetItemPrefab(int itemID)
    {
        itemDictionary.TryGetValue(itemID, out GameObject prefab);

        if (prefab == null)
        {
            Debug.LogWarning($"Item with ID {itemID} not found in dictionary");
        }

        return prefab;
    }
}
