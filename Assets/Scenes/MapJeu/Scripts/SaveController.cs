using Cinemachine;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

/// <summary>
/// Gère la sauvegarde et le chargement du jeu :
/// - enregistre la position du joueur, la zone actuelle,
///   l'inventaire et la hotbar
/// - restaure ces données au lancement.
/// </summary>
public class SaveController : MonoBehaviour
{
    /// <summary>
    /// Chemin complet du fichier de sauvegarde.
    /// </summary>
    private string saveLocation;

    /// <summary>
    /// Référence au contrôleur d'inventaire du joueur.
    /// </summary>
    private InventoryController inventoryController;

    /// <summary>
    /// Référence au contrôleur de la hotbar.
    /// </summary>
    private HotBarController hotbarController;

    /// <summary>
    /// Initialise les références, définit l'emplacement du fichier
    /// et tente de charger une sauvegarde existante.
    /// </summary>
    void Start()
    {
        saveLocation = Path.Combine(Application.persistentDataPath, "saveData.json");

        inventoryController = FindAnyObjectByType<InventoryController>();
        hotbarController = FindAnyObjectByType<HotBarController>();

        LoadGame();
    }

    /// <summary>
    /// Crée un objet SaveData contenant toutes les informations du jeu
    /// et l'enregistre dans un fichier JSON.
    /// </summary>
    public void SaveGame()
    {
        SaveData saveData = new SaveData
        {
            playerPosition = GameObject.FindGameObjectWithTag("Player").transform.position,
            mapBoundary = FindAnyObjectByType<CinemachineConfiner>().m_BoundingShape2D.gameObject.name,
            inventorySaveData = inventoryController.GetInventoryItems(),
            hotbarSaveData = hotbarController.GetHotBarItems(),
        };

        File.WriteAllText(saveLocation, JsonUtility.ToJson(saveData));
    }

    /// <summary>
    /// Charge les données si une sauvegarde existe :
    /// - replace le joueur
    /// - restaure la zone active
    /// - recharge l'inventaire et la hotbar.
    /// Si aucune sauvegarde n'existe, en crée une nouvelle.
    /// </summary>
    public void LoadGame()
    {
        if (File.Exists(saveLocation))
        {
            SaveData saveData = JsonUtility.FromJson<SaveData>(File.ReadAllText(saveLocation));

            GameObject.FindGameObjectWithTag("Player").transform.position = saveData.playerPosition;

            FindAnyObjectByType<CinemachineConfiner>().m_BoundingShape2D =
                GameObject.Find(saveData.mapBoundary).GetComponent<PolygonCollider2D>();

            inventoryController.SetInventoryItems(saveData.inventorySaveData);
            hotbarController.SetHotBarItems(saveData.hotbarSaveData);
        }
        else
        {
            SaveGame();
        }
    }
}
