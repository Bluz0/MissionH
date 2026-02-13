using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Contrôle le menu principal du jeu :
/// - lancer la partie
/// - ouvrir les crédits
/// - ouvrir les options
/// - quitter le jeu.
/// </summary>
public class MenuContoller : MonoBehaviour
{
    /// <summary>
    /// Charge la scène de sélection d'avatar pour commencer une nouvelle partie.
    /// </summary>
    public void PlayGame()
    {
        SceneManager.LoadScene("AvatarChoice");
    }

    /// <summary>
    /// Ouvre la scène des crédits.
    /// </summary>
    public void OpenCredits()
    {
        SceneManager.LoadScene("Credits");
    }

    /// <summary>
    /// Ouvre la scène des options.
    /// </summary>
    public void OpenOptions()
    {
        SceneManager.LoadScene("Options");
    }

    /// <summary>
    /// Quitte le jeu (fonctionne dans un build).
    /// </summary>
    public void QuitGame()
    {
        Application.Quit();
        Debug.Log("Quitter le jeu");
    }
}
