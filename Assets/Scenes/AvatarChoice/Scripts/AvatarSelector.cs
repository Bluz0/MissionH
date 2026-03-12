using UnityEngine;
using UnityEngine.UI;
using UnityEngine.U2D.Animation;
using UnityEngine.SceneManagement;
using TMPro;

/// <summary>
/// Gère la sélection d'avatar et le nom du joueur.
/// </summary>
public class AvatarSelector : MonoBehaviour
{
    public SpriteLibraryAsset[] skins;      // Liste des skins disponibles
    public SpriteResolver previewResolver;  // Aperçu du skin sélectionné
    public TMP_InputField nameInput;        // Champ du nom du joueur

    private int index = 0;                  // Index du skin sélectionné

    /// <summary>
    /// Initialise l’aperçu et recharge le nom sauvegardé.
    /// </summary>
    void Start()
    {
        UpdatePreview();

        if (PlayerPrefs.HasKey("PlayerName"))
            nameInput.text = PlayerPrefs.GetString("PlayerName");
    }

    /// <summary>
    /// Passe au skin suivant.
    /// </summary>
    public void Next()
    {
        index = (index + 1) % skins.Length;
        UpdatePreview();
    }

    /// <summary>
    /// Passe au skin précédent.
    /// </summary>
    public void Previous()
    {
        index = (index - 1 + skins.Length) % skins.Length;
        UpdatePreview();
    }

    /// <summary>
    /// Met à jour l’aperçu visuel du skin sélectionné.
    /// </summary>
    void UpdatePreview()
    {
        previewResolver.spriteLibrary.spriteLibraryAsset = skins[index];
    }

    /// <summary>
    /// Sauvegarde le skin et le nom, puis lance la scène du jeu.
    /// </summary>
    public void PlayGame()
    {
        PlayerPrefs.SetString("SelectedSkin", skins[index].name);
        PlayerPrefs.SetString("PlayerName", nameInput.text);
        PlayerPrefs.Save();

        SceneManager.LoadScene("map_jeu");
    }
}
