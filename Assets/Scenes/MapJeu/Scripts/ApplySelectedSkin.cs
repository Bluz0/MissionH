using UnityEngine;
using UnityEngine.U2D.Animation;
using UnityEngine.UI;

public class ApplySelectedSkin : MonoBehaviour
{
    [Header("SpriteLibrary du personnage")]
    public SpriteLibrary spriteLibrary;

    [Header("Tous les skins disponibles")]
    public SpriteLibraryAsset[] allSkins;

    [Header("Portraits associés (UI Sprite)")]
    public Sprite[] portraits;

    [Header("Image du portrait dans le HUD")]
    public Image hudPortraitImage;

    void Start()
    {
        // 1) Charger le skin sélectionné
        string selectedSkin = PlayerPrefs.GetString("SelectedSkin", "");

        foreach (var skin in allSkins)
        {
            if (skin.name == selectedSkin)
            {
                spriteLibrary.spriteLibraryAsset = skin;
                break;
            }
        }

        // 2) Charger le portrait sélectionné
        int portraitIndex = PlayerPrefs.GetInt("SelectedPortraitIndex", 0);

        if (hudPortraitImage != null && portraitIndex >= 0 && portraitIndex < portraits.Length)
        {
            hudPortraitImage.sprite = portraits[portraitIndex];
        }
    }
}
