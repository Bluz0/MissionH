using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Contient toutes les données nécessaires pour sauvegarder l'état du jeu :
/// - position du joueur
/// - nom de la zone ou limite de carte
/// - contenu de l'inventaire
/// - contenu de la hotbar.
/// </summary>
[System.Serializable]
public class SaveData
{
    /// <summary>
    /// Position du joueur au moment de la sauvegarde.
    /// </summary>
    public Vector3 playerPosition;

    /// <summary>
    /// Nom de la zone ou limite de carte où se trouve le joueur.
    /// </summary>
    public string mapBoundary;

    /// <summary>
    /// Données de sauvegarde de l'inventaire complet.
    /// </summary>
    public List<InventorySaveData> inventorySaveData = new List<InventorySaveData>();

    /// <summary>
    /// Données de sauvegarde de la hotbar.
    /// </summary>
    public List<InventorySaveData> hotbarSaveData = new List<InventorySaveData>();

    /// <summary>
    /// Nombre de pièces du joueur.
    /// </summary>
    public int money;

}
