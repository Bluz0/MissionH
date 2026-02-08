using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private LayerMask interactableLayer;
    private PlayerMovement playerMovement;

    private void Awake()
    {
        playerMovement = GetComponent<PlayerMovement>();
    }

    public void HandleUpdate()
    {
        if (Keyboard.current.fKey.wasPressedThisFrame)
        {
            Interact();
        }
    }

    void Interact()
    {
        // On récupère la direction depuis le mouvement
        Vector2 direction = (playerMovement.MoveInput != Vector2.zero) ? playerMovement.MoveInput : playerMovement.LastInput;
        
        // On normalise pour éviter des rayons trop longs en diagonale
        Vector3 interactPos = transform.position + new Vector3(direction.x, direction.y, 0).normalized;

        Collider2D collider = Physics2D.OverlapCircle(interactPos, 0.3f, interactableLayer);
        if (collider != null)
        {
            var interactable = collider.GetComponent<Interactable>();
            interactable?.Interact();
        }
    }
}
