using UnityEngine;

public enum GameState { FreeRoam, Dialog };

public class GameController : MonoBehaviour
{
    [SerializeField] private PlayerController playerController;
    private GameState state;

    private void Start()
    {
        // Si non assigné dans l'inspecteur, on le cherche
        if (playerController == null)
            playerController = Object.FindFirstObjectByType<PlayerController>();

        DialogManager.Instance.OnshowDialog += () =>
        {
            state = GameState.Dialog;
            // On force l'arrêt visuel du joueur quand il commence à parler
            playerController?.GetComponent<PlayerMovement>()?.StopMovementAnimations();
        };

        DialogManager.Instance.OnHideDialog += () =>
        {
            if (state == GameState.Dialog)
                state = GameState.FreeRoam;
        };
    }

    private void Update()
    {
        if (playerController == null) return;

        if (state == GameState.FreeRoam)
        {
            playerController.HandleUpdate();
        } 
        else if (state == GameState.Dialog)
        {
            DialogManager.Instance.HandleUpdate();
        }
    }
}
