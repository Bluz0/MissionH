using UnityEngine;

public class PlayerSpawn : MonoBehaviour
{
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
