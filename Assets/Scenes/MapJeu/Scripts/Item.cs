using UnityEngine;

/// <summary>
/// Représente un objet utilisable dans le jeu.
/// Chaque item possède un ID et peut exécuter une action via UseItem().
/// Les classes dérivées peuvent surcharger UseItem pour définir un comportement spécifique.
/// </summary>
public class Item : MonoBehaviour
{
    /// <summary>
    /// Identifiant unique de l'item.
    /// </summary>
    public int ID;

    /// <summary>
    /// Action par défaut exécutée lorsqu'un item est utilisé.
    /// Peut être redéfinie dans les classes héritées.
    /// </summary>
    public virtual void UseItem()
    {
        Debug.Log("Using item");
    }
}
