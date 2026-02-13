using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// Contrôle le déroulement des crédits :
/// - désactive le bouton retour au début
/// - l'active lorsque le texte atteint une certaine position
/// - permet de revenir au menu principal.
/// </summary>
public class CreditsController : MonoBehaviour
{
    /// <summary>
    /// Référence au RectTransform du texte des crédits.
    /// </summary>
    public RectTransform creditsText;

    /// <summary>
    /// Bouton permettant de revenir au menu une fois les crédits terminés.
    /// </summary>
    public GameObject backButton;

    /// <summary>
    /// Position Y à partir de laquelle le bouton retour devient visible.
    /// </summary>
    public float endYPosition = 1200f;

    /// <summary>
    /// Cache le bouton retour au lancement.
    /// </summary>
    void Start()
    {
        backButton.SetActive(false);
    }

    /// <summary>
    /// Vérifie en continu si le texte des crédits a atteint la fin.
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
