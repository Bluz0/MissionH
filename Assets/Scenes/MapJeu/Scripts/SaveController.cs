using Cinemachine;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

public class SaveController : MonoBehaviour
{
    private string saveLocation;
    void Start()
    {
        saveLocation = Path.Combine(Application.persistentDataPath, "saveData.json");
        LoadGame();
    }

    public void SaveGame()
    {
    GameObject player = GameObject.FindGameObjectWithTag("Player");
    if (player == null) return; // Sécurité : on arrête si le joueur n'est pas là

    SaveData saveData = new SaveData();
    saveData.playerPosition = player.transform.position;

    // On vérifie si la Cinemachine existe avant de sauvegarder les limites
    CinemachineConfiner confiner = FindObjectOfType<CinemachineConfiner>();
    if (confiner != null && confiner.m_BoundingShape2D != null)
    {
        saveData.mapBoundary = confiner.m_BoundingShape2D.gameObject.name;
    }

    File.WriteAllText(saveLocation, JsonUtility.ToJson(saveData));
    }

    public void LoadGame()
    {
        if (!File.Exists(saveLocation)) return;

        SaveData saveData = JsonUtility.FromJson<SaveData>(File.ReadAllText(saveLocation));
        
        GameObject player = GameObject.FindGameObjectWithTag("Player");
        if (player != null)
        {
            player.transform.position = saveData.playerPosition;
        }

        CinemachineConfiner confiner = FindObjectOfType<CinemachineConfiner>();
        if (confiner != null && !string.IsNullOrEmpty(saveData.mapBoundary))
        {
            GameObject boundaryObj = GameObject.Find(saveData.mapBoundary);
            if (boundaryObj != null)
            {
                confiner.m_BoundingShape2D = boundaryObj.GetComponent<PolygonCollider2D>();
            }
        }
    }
}
