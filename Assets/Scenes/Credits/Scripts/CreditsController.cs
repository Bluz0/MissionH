using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Contrôle la fin du défilement des crédits :
/// - surveille la position du texte
/// - affiche le bouton "Retour" une fois les crédits terminés
/// - permet de revenir au menu principal.
/// </summary>
public class CreditsController : MonoBehaviour
{
    /// <summary>
    /// Référence au RectTransform contenant le texte des crédits.
    /// </summary>
    public RectTransform creditsText;

    /// <summary>
    /// Bouton permettant de revenir au menu une fois les crédits terminés.
    /// </summary>
    public GameObject backButton;

    /// <summary>
    /// Position Y à partir de laquelle les crédits sont considérés comme terminés.
    /// </summary>
    public float endYPosition = 1200f;

    /// <summary>
    /// Cache le bouton au démarrage.
    /// </summary>
    void Start()
    {
        backButton.SetActive(false);
    }

    /// <summary>
    /// Vérifie en continu si les crédits ont atteint la fin.
    /// </summary>
    void Update()
    {
        if (creditsText.anchoredPosition.y >= endYPosition)
        {
            backButton.SetActive(true);
        }
    }

    /// <summary>
    /// Charge la scène du menu principal.
    /// </summary>
    public void BackToMenu()
    {
        SceneManager.LoadScene("TitleScreen");
    }
}
