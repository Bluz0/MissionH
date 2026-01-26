using UnityEngine;

public enum GameState { FreeRoam, Dialog };

public class GameController : MonoBehaviour
{
    private PlayerController playerController;
    GameState state;

    private void Start()
    {
        // On cherche le joueur dans la scène au lancement
        FindPlayer();

        DialogManager.Instance.OnshowDialog += () =>
        {
            state = GameState.Dialog;
        };
        DialogManager.Instance.OnHideDialog += () =>
        {
            if (state == GameState.Dialog)
                state = GameState.FreeRoam;
        };
    }

    private void FindPlayer()
    {
        playerController = FindFirstObjectByType<PlayerController>();
    }

    private void Update()
    {
        // Si le joueur n'est pas trouvé (scène de chargement ou autre), on ne fait rien
        if (playerController == null)
        {
            FindPlayer();
            return;
        }

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
