using UnityEngine;
using UnityEngine.SceneManagement;

public class MenuContoller : MonoBehaviour
{
    public void PlayGame()
    {
        SceneManager.LoadScene("AvatarChoice");
    }

    public void OpenCredits()
    {
        SceneManager.LoadScene("Credits");
    }

    public void OpenOptions()
    {
        SceneManager.LoadScene("Options");
    }

    public void QuitGame()
    {
        Application.Quit();
        Debug.Log("Quitter le jeu");
    }
}
