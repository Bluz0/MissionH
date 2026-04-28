using UnityEngine;

/// <summary>
/// Gère l'ouverture et la fermeture du menu en jeu :
/// - affiche ou masque le canvas du menu
/// - désactive le joystick et le bouton d'interaction quand le menu est ouvert
/// - met le jeu en pause via PauseController.
/// </summary>
public class MenuController : MonoBehaviour
{
    /// <summary>
    /// Canvas contenant l'interface du menu.
    /// </summary>
    public GameObject menuCanvas;

    /// <summary>
    /// Canvas contenant l'interface du HUD.
    /// </summary>
    public GameObject menuHUD;

    /// <summary>
    /// Bouton permettant d'ouvrir le menu.
    /// </summary>
    public GameObject menuButton;

    /// <summary>
    /// Joystick virtuel utilisé pour le déplacement du joueur.
    /// </summary>
    public GameObject joystick;

    /// <summary>
    /// Bouton d'interaction affiché en jeu.
    /// </summary>
    public GameObject interactButton;

    /// <summary>
    /// Cache le menu au lancement de la scène.
    /// </summary>
    void Start()
    {
        if (menuCanvas != null) menuCanvas.SetActive(false);
    }

    /// <summary>
    /// Ouvre ou ferme le menu :
    /// - active/désactive le canvas
    /// - masque les contrôles de gameplay
    /// - met le jeu en pause si le menu est ouvert.
    /// </summary>
    public void ToggleMenu()
    {
        if (!menuCanvas.activeSelf && DialogueController.Instance != null)
        {
            if (DialogueController.Instance.dialoguePanel.activeSelf)
            {
                Debug.Log("Ouverture du menu bloquée : Un dialogue est en cours.");
                return;
            }
        }

        bool isOpen = !menuCanvas.activeSelf;

        menuCanvas.SetActive(isOpen);
        menuHUD.SetActive(!isOpen);
        joystick.SetActive(!isOpen);
        interactButton.SetActive(!isOpen);

        PauseController.SetPause(isOpen);

        if (DialogueController.Instance != null && DialogueController.Instance.recapPanel.activeSelf)
        {
            DialogueController.Instance.CloseRecap();
        }
    }
}
