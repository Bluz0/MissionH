using UnityEngine;

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
        // On laisse la touche F pour les tests sur PC, mais le bouton mobile utilisera la fonction ci-dessous
        if (UnityEngine.InputSystem.Keyboard.current.fKey.wasPressedThisFrame)
        {
            OnInteractButtonPressed();
        }
    }

    // CETTE FONCTION SERA APPELÉE PAR LE BOUTON UI
    public void OnInteractButtonPressed()
    {
        // On récupère la direction depuis le mouvement
        Vector2 direction = (playerMovement.MoveInput != Vector2.zero) ? playerMovement.MoveInput : playerMovement.LastInput;
        
        Vector3 interactPos = transform.position + new Vector3(direction.x, direction.y, 0).normalized;

        Collider2D collider = Physics2D.OverlapCircle(interactPos, 0.3f, interactableLayer);
        if (collider != null)
        {
            var interactable = collider.GetComponent<Interactable>();
            interactable?.Interact();
        }
    }
}
