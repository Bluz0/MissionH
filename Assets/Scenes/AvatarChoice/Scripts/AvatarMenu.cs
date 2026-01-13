using UnityEngine;
using UnityEngine.SceneManagement;

public class AvatarMenu : MonoBehaviour
{
    public void ChoisirAvatar(int index)
    {
        SelectionManager.SelectedAvatarIndex = index;
        
        SceneManager.LoadScene("map_jeu");
    }
}