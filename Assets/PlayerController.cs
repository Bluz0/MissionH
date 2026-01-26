using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    public LayerMask interactableLayer;
    private PlayerMovement playerMovement;

    private void Awake()
    {
        playerMovement = GetComponent<PlayerMovement>();
    }

    public void HandleUpdate()
    {
        // Vérifier si le joueur appuie sur la touche "F" pour interagir
        if (Keyboard.current.fKey.wasPressedThisFrame)
        {
            Interact();
        }
    }

    void Interact()
    {
        // Déterminer la direction face au joueur (Input actuel ou dernier regardé)
        Vector2 direction = playerMovement.MoveInput != Vector2.zero ? playerMovement.MoveInput : playerMovement.LastInput;
        Vector3 facingDir = new Vector3(direction.x, direction.y);
        Vector3 interactPos = transform.position + facingDir;

        // Vérifier s'il y a un objet interactif à proximité
        Collider2D collider = Physics2D.OverlapCircle(interactPos, 0.3f, interactableLayer);
        if (collider != null)
        {
            Interactable interactable = collider.GetComponent<Interactable>();
            if (interactable != null)
            {
                interactable.Interact();
            }
        }
    }
}