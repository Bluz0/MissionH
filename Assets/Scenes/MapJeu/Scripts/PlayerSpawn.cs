using UnityEngine;

/// <summary>
/// Positionne automatiquement le joueur sur le point de spawn nommé "PlayerSpawnPoint"
/// au lancement de la scène. Affiche un avertissement si aucun point n'est trouvé.
/// </summary>
public class PlayerSpawn : MonoBehaviour
{
    /// <summary>
    /// Au démarrage, cherche l'objet "PlayerSpawnPoint" et place le joueur dessus.
    /// </summary>
    void Start()
    {
        GameObject spawn = GameObject.Find("PlayerSpawnPoint");

        if (spawn != null)
        {
            transform.position = spawn.transform.position;
        }
        else
        {
            Debug.LogWarning("PlayerSpawnPoint introuvable dans la scène !");
        }
    }
}
