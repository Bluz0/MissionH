using UnityEngine;
using UnityEngine.U2D.Animation;
using UnityEngine.UI;

/// <summary>
/// Applique le skin sélectionné :
/// - au personnage in-game
/// - au portrait HUD
/// - au portrait Menu
/// - aux 4 images de preview du skin dans le menu
/// - permet de tourner entre les images avec des flèches.
/// </summary>
public class ApplySelectedSkin : MonoBehaviour
{
    [Header("SpriteLibrary du personnage (in-game)")]
    public SpriteLibrary spriteLibrary;

    [Header("Tous les skins disponibles")]
    public SpriteLibraryAsset[] allSkins;

    [Header("Portraits associés (même ordre que les skins)")]
    public Sprite[] portraits;

    [Header("Images de preview (4 par skin : face, gauche, dos, droite)")]
    public Sprite[] skin0Views;
    public Sprite[] skin1Views;
    public Sprite[] skin2Views;
    public Sprite[] skin3Views;
    public Sprite[] skin4Views;
    public Sprite[] skin5Views;

    [Header("Image UI où afficher la vue actuelle du skin")]
    public Image previewImage;

    [Header("Portrait HUD")]
    public Image hudPortraitImage;

    [Header("Portrait Menu")]
    public Image menuPortraitImage;

    private Sprite[][] allSkinViews;
    private int selectedSkinIndex = 0;
    private int currentViewIndex = 0;

    void Start()
    {
        // Regrouper les vues dans un tableau 2D
        allSkinViews = new Sprite[][]
        {
            skin0Views,
            skin1Views,
            skin2Views,
            skin3Views,
            skin4Views,
            skin5Views
        };

        LoadSelectedSkin();
        UpdatePreviewImage();
    }

    /// <summary>
    /// Charge le skin choisi dans PlayerPrefs et applique tout.
    /// </summary>
    void LoadSelectedSkin()
    {
        string selectedSkin = PlayerPrefs.GetString("SelectedSkin", "");

        // Trouver l'index du skin
        for (int i = 0; i < allSkins.Length; i++)
        {
            if (allSkins[i].name == selectedSkin)
            {
                selectedSkinIndex = i;

                // Appliquer au personnage in-game
                if (spriteLibrary != null)
                    spriteLibrary.spriteLibraryAsset = allSkins[i];

                break;
            }
        }

        // Appliquer le portrait
        if (selectedSkinIndex < portraits.Length)
        {
            if (hudPortraitImage != null)
                hudPortraitImage.sprite = portraits[selectedSkinIndex];

            if (menuPortraitImage != null)
                menuPortraitImage.sprite = portraits[selectedSkinIndex];
        }
    }

    /// <summary>
    /// Met à jour l'image affichée selon la vue actuelle.
    /// </summary>
    void UpdatePreviewImage()
    {
        if (previewImage != null)
        {
            previewImage.sprite = allSkinViews[selectedSkinIndex][currentViewIndex];
        }
    }

    /// <summary>
    /// Flèche gauche : vue précédente.
    /// </summary>
    public void PreviousView()
    {
        currentViewIndex--;
        if (currentViewIndex < 0)
            currentViewIndex = 3;

        UpdatePreviewImage();
    }

    /// <summary>
    /// Flèche droite : vue suivante.
    /// </summary>
    public void NextView()
    {
        currentViewIndex++;
        if (currentViewIndex > 3)
            currentViewIndex = 0;

        UpdatePreviewImage();
    }
}
