using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Gère les actions du menu principal :
/// - lancer le jeu
/// - ouvrir les crédits
/// - ouvrir les options
/// - quitter l'application.
/// </summary>
public class MenuContoller : MonoBehaviour
{
    /// <summary>
    /// Charge la scène de sélection d'avatar.
    /// </summary>
    public void PlayGame()
    {
        SceneManager.LoadScene("AvatarChoice");
    }

    /// <summary>
    /// Charge la scène des crédits.
    /// </summary>
    public void OpenCredits()
    {
        SceneManager.LoadScene("Credits");
    }

    /// <summary>
    /// Charge la scène des options.
    /// </summary>
    public void OpenOptions()
    {
        SceneManager.LoadScene("Options");
    }

    /// <summary>
    /// Quitte le jeu (fonctionne uniquement dans une build).
    /// </summary>
    public void QuitGame()
    {
        Application.Quit();
        Debug.Log("Quitter le jeu");
    }
}
