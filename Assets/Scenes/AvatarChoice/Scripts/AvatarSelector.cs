using UnityEngine;
using UnityEngine.UI;
using UnityEngine.U2D.Animation;
using UnityEngine.SceneManagement;

/// <summary>
/// Gère la sélection d'avatar avant de lancer la partie :
/// - permet de naviguer entre plusieurs skins
/// - met à jour l’aperçu visuel via SpriteResolver
/// - sauvegarde le skin choisi dans les PlayerPrefs
/// - charge la scène de jeu.
/// </summary>
public class AvatarSelector : MonoBehaviour
{
    /// <summary>
    /// Liste des skins disponibles (SpriteLibraryAsset).
    /// </summary>
    public SpriteLibraryAsset[] skins;

    /// <summary>
    /// SpriteResolver utilisé pour afficher l’aperçu du skin sélectionné.
    /// </summary>
    public SpriteResolver previewResolver;

    /// <summary>
    /// Index du skin actuellement sélectionné.
    /// </summary>
    private int index = 0;

    /// <summary>
    /// Initialise l’aperçu au démarrage.
    /// </summary>
    void Start()
    {
        UpdatePreview();
    }

    /// <summary>
    /// Passe au skin suivant dans la liste.
    /// </summary>
    public void Next()
    {
        index = (index + 1) % skins.Length;
        UpdatePreview();
    }

    /// <summary>
    /// Revient au skin précédent dans la liste.
    /// </summary>
    public void Previous()
    {
        index = (index - 1 + skins.Length) % skins.Length;
        UpdatePreview();
    }

    /// <summary>
    /// Met à jour l’aperçu visuel en appliquant le SpriteLibraryAsset sélectionné.
    /// </summary>
    void UpdatePreview()
    {
        previewResolver.spriteLibrary.spriteLibraryAsset = skins[index];
    }
    
    /// <summary>
    /// Sauvegarde le skin choisi et charge la scène de jeu.
    /// </summary>
    public void PlayGame()
    {
        PlayerPrefs.SetString("SelectedSkin", skins[index].name);
        SceneManager.LoadScene("map_jeu");
    }
}
