using UnityEngine;

/// <summary>
/// Permet de quitter le jeu lorsqu'il est exécuté dans une build.
/// Dans l'éditeur Unity, Application.Quit() n'a aucun effet visible.
/// </summary>
public class QuitGame : MonoBehaviour
{
    /// <summary>
    /// Quitte l'application. Fonctionne uniquement dans une version compilée du jeu.
    /// </summary>
    public void Quit()
    {
        Application.Quit();
    }
}
