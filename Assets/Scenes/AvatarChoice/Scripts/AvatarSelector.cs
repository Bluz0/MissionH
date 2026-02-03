using UnityEngine;
using UnityEngine.UI;
using UnityEngine.U2D.Animation;
using UnityEngine.SceneManagement;

public class AvatarSelector : MonoBehaviour
{
    public SpriteLibraryAsset[] skins;
    public SpriteResolver previewResolver;
    private int index = 0;

    void Start()
    {
        UpdatePreview();
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

    void UpdatePreview()
    {
        previewResolver.spriteLibrary.spriteLibraryAsset = skins[index];
    }
    
    public void PlayGame()
    {
        PlayerPrefs.SetString("SelectedSkin", skins[index].name);
        SceneManager.LoadScene("map_jeu");
    }
}
