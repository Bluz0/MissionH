using UnityEngine;

public class MenuController : MonoBehaviour
{
    public GameObject menuCanvas;
    public GameObject menuButton;      // Bouton pour ouvrir le menu
    public GameObject joystick;        // Joystick de déplacement
    public GameObject interactButton;  // Bouton d'interaction

    void Start()
    {
        menuCanvas.SetActive(false);
    }

    public void ToggleMenu()
    {
        bool isOpen = !menuCanvas.activeSelf;

        menuCanvas.SetActive(isOpen);
        joystick.SetActive(!isOpen);
        interactButton.SetActive(!isOpen);
    }
}
