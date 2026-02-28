using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Structure de données utilisée pour sauvegarder un item dans l'inventaire :
/// - itemID : identifiant unique de l'item (fourni par ItemDictionary)
/// - slotIndex : position du slot dans l'inventaire ou la hotbar.
/// </summary>
[System.Serializable]
public class InventorySaveData
{
    /// <summary>
    /// Identifiant unique de l'item sauvegardé.
    /// </summary>
    public int itemID;

    /// <summary>
    /// Index du slot dans lequel l'item était placé.
    /// </summary>
    public int slotIndex;
}
