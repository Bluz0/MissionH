using UnityEngine;

public enum GameState { FreeRoam, Dialog };

public class GameController : MonoBehaviour
{
    [SerializeField] private PlayerController playerController;
    private GameState state;

    private void Start()
    {
        if (playerController == null)
            playerController = Object.FindFirstObjectByType<PlayerController>();

        DialogManager.Instance.OnshowDialog += () =>
        {
            state = GameState.Dialog;
            playerController?.GetComponent<PlayerMovement>()?.StopMovementAnimations();
        };

        DialogManager.Instance.OnHideDialog += () =>
        {
            if (state == GameState.Dialog)
                state = GameState.FreeRoam;
        };
    }

    // CETTE FONCTION EST LE NOUVEL AIGUILLAGE POUR LE BOUTON
    public void OnActionButtonPressed()
    {
        if (state == GameState.FreeRoam)
        {
            // Si on se promène, on demande au joueur d'interagir
            playerController.OnInteractButtonPressed();
        }
        else if (state == GameState.Dialog)
        {
            // Si on est en dialogue, on demande au DialogManager de passer à la suite
            DialogManager.Instance.OnNextLinePressed();
        }
    }

    private void Update()
    {
        if (playerController == null) return;

        // On garde HandleUpdate pour la touche F (PC)
        if (state == GameState.FreeRoam)
            playerController.HandleUpdate();
        else if (state == GameState.Dialog)
            DialogManager.Instance.HandleUpdate();
    }
}
