using UnityEngine;
using UnityEngine.UI;
using UnityEngine.U2D.Animation;
using UnityEngine.SceneManagement;

/// <summary>
/// Permet de sélectionner un avatar parmi une liste de skins,
/// d'afficher un aperçu via un SpriteResolver,
/// et de sauvegarder le choix avant de charger la scène du jeu.
/// </summary>
public class AvatarSelector : MonoBehaviour
{
    /// <summary>
    /// Liste des skins disponibles pour l'avatar.
    /// </summary>
    public SpriteLibraryAsset[] skins;

    /// <summary>
    /// SpriteResolver utilisé pour afficher l'aperçu du skin sélectionné.
    /// </summary>
    public SpriteResolver previewResolver;

    /// <summary>
    /// Index du skin actuellement sélectionné.
    /// </summary>
    private int index = 0;

    /// <summary>
    /// Initialise l'aperçu au démarrage.
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
    /// Met à jour l'aperçu affiché en fonction du skin sélectionné.
    /// </summary>
    void UpdatePreview()
    {
        previewResolver.spriteLibrary.spriteLibraryAsset = skins[index];
    }
    
    /// <summary>
    /// Sauvegarde le skin choisi et charge la scène principale du jeu.
    /// </summary>
    public void PlayGame()
    {
        PlayerPrefs.SetString("SelectedSkin", skins[index].name);
        SceneManager.LoadScene("map_jeu");
    }
}
