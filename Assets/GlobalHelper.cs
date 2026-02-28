using UnityEngine;

/// <summary>
/// Fournit des fonctions utilitaires globales accessibles depuis n'importe quel script.
/// Ici : génération d'un identifiant unique basé sur la scène et la position d'un GameObject.
/// </summary>
public static class GlobalHelper
{
    /// <summary>
    /// Génère un identifiant unique pour un objet donné.
    /// L'ID est basé sur :
    /// - le nom de la scène
    /// - la position X de l'objet
    /// - la position Y de l'objet
    /// 
    /// Utile pour identifier des objets persistants ou sauvegardables.
    /// </summary>
    public static string GenerateUniqueID(GameObject obj)
    {
        return $"{obj.scene.name}_{obj.transform.position.x}_{obj.transform.position.y}";
    }
}
