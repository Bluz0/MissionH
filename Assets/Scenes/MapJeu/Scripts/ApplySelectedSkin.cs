using UnityEngine;
using UnityEngine.U2D.Animation;

/// <summary>
/// Applique automatiquement le skin sélectionné par le joueur
/// (stocké dans les PlayerPrefs) au SpriteLibrary du personnage.
/// </summary>
public class ApplySelectedSkin : MonoBehaviour
{
    /// <summary>
    /// SpriteLibrary du personnage sur laquelle appliquer le skin choisi.
    /// </summary>
    public SpriteLibrary spriteLibrary;

    /// <summary>
    /// Liste de tous les skins disponibles dans le jeu.
    /// </summary>
    public SpriteLibraryAsset[] allSkins;

    /// <summary>
    /// Au démarrage, récupère le skin choisi dans les PlayerPrefs
    /// et l'applique si trouvé dans la liste des skins disponibles.
    /// </summary>
    void Start()
    {
        string selectedSkin = PlayerPrefs.GetString("SelectedSkin", "");

        foreach (var skin in allSkins)
        {
            if (skin.name == selectedSkin)
            {
                spriteLibrary.spriteLibraryAsset = skin;
                break;
            }
        }
    }
}
