using UnityEngine;
using UnityEngine.U2D.Animation;

public class ApplySelectedSkin : MonoBehaviour
{
    public SpriteLibrary spriteLibrary;
    public SpriteLibraryAsset[] allSkins;

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
