using UnityEngine;

/// <summary> 
/// Classe utilitaire contenant des méthodes globales réutilisables.
/// </summary>
public static class GlobalHelper
{
/// <summary> 
/// Génère un identifiant unique basé sur le nom de la scène et la position du GameObject.
/// Utile pour créer des clés de sauvegarde, identifier des objets ou tracer leur position. 
/// Attention : deux objets ayant exactement la même position produiront le même ID. 
/// </summary>
    public static string GenerateUniqueID(GameObject obj)
    {
        return $"{obj.scene.name}_{obj.transform.position.x}_{obj.transform.position.y}";
    }
}
