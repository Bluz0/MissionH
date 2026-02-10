using UnityEngine;

public class MenuController : MonoBehaviour
{
    public GameObject menuCanvas;
    public GameObject menuButton;
    public GameObject joystick;
    public GameObject interactButton;

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
        PauseController.SetPause(isOpen);
    }
}
