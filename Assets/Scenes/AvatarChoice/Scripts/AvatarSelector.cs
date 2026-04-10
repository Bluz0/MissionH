using UnityEngine;
using UnityEngine.UI;
using UnityEngine.U2D.Animation;
using UnityEngine.SceneManagement;
using TMPro;

/// <summary>
/// Gère la sélection d'avatar, le portrait et le nom du joueur.
/// </summary>
public class AvatarSelector : MonoBehaviour
{
    [Header("Skins complets (SpriteLibraryAsset)")]
    public SpriteLibraryAsset[] skins;

    [Header("Portraits associés (UI Sprite)")]
    public Sprite[] portraits;

    [Header("Aperçu du skin dans la scène")]
    public SpriteResolver previewResolver;

    [Header("Portrait affiché dans le HUD de sélection")]
    public Image portraitPreview;

    [Header("Nom du joueur")]
    public TMP_InputField nameInput;

    private int index = 0;

    void Start()
    {
        UpdatePreview();

        if (PlayerPrefs.HasKey("PlayerName"))
            nameInput.text = PlayerPrefs.GetString("PlayerName");
    }

    public void Next()
    {
        index = (index + 1) % skins.Length;
        UpdatePreview();
    }

    public void Previous()
    {
        index = (index - 1 + skins.Length) % skins.Length;
        UpdatePreview();
    }

    /// <summary>
    /// Met à jour l’aperçu du skin ET du portrait.
    /// </summary>
    void UpdatePreview()
    {
        // Skin complet (SpriteLibrary)
        previewResolver.spriteLibrary.spriteLibraryAsset = skins[index];

        // Portrait UI
        if (portraitPreview != null && portraits.Length > index)
            portraitPreview.sprite = portraits[index];
    }

    public void PlayGame()
    {
        PlayerPrefs.SetString("SelectedSkin", skins[index].name);
        PlayerPrefs.SetInt("SelectedPortraitIndex", index);
        PlayerPrefs.SetString("PlayerName", nameInput.text);
        PlayerPrefs.Save();

        SceneManager.LoadScene("map_jeu");
    }
}
