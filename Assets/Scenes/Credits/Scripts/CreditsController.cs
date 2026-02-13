using UnityEngine;
using UnityEngine.SceneManagement;

public class CreditsController : MonoBehaviour
{
    public RectTransform creditsText;
    public GameObject backButton;

    public float endYPosition = 1200f;

    void Start()
    {
        backButton.SetActive(false);
    }

    void Update()
    {
        if (creditsText.anchoredPosition.y >= endYPosition)
        {
            backButton.SetActive(true);
        }
    }

    public void BackToMenu()
    {
        SceneManager.LoadScene("TitleScreen");
    }
}
