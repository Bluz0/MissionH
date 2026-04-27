using UnityEngine;
using System.Collections;

public class PlayerSpawn : MonoBehaviour
{
    [Header("Paramètres")]
    public string spawnPointName = "SpawnPoint";

    // Awake est appelé avant Start, c'est plus rapide
    void Awake()
    {
        // On lance le repositionnement immédiatement
        PositionPlayer();
    }

    void Start()
    {
        // Au cas où Awake est passé trop vite (fréquent sur mobile), 
        // on fait une deuxième sécurité au Start
        PositionPlayer();
    }

    public void PositionPlayer()
    {
        GameObject spawn = GameObject.Find(spawnPointName);

        if (spawn != null)
        {
            // On force la position ET la rotation
            transform.position = spawn.transform.position;
            transform.rotation = spawn.transform.rotation;

            // Debug pour vérifier sur le téléphone via ADB ou Logcat
            Debug.Log("Joueur placé avec succès sur : " + spawnPointName);
        }
        else
        {
            // Si tu vois ce message dans tes logs, c'est que l'objet n'existe pas encore
            Debug.LogWarning("ERREUR : " + spawnPointName + " introuvable dans cette scène !");
        }
    }
}