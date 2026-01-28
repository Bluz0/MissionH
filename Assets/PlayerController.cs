using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    public LayerMask interactableLayer;
    private PlayerMovement playerMovement;

    private void OnDrawGizmosSelected()
    {
        // Détermine la direction (même logique que dans Interact)
        Vector2 direction = playerMovement != null && playerMovement.MoveInput != Vector2.zero ? playerMovement.MoveInput : (playerMovement != null ? playerMovement.LastInput : Vector2.down);
        Vector3 interactPos = transform.position + new Vector3(direction.x, direction.y);
        
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(interactPos, 0.3f);
    }

    private void Awake()
    {
        playerMovement = GetComponent<PlayerMovement>();
    }

    public void HandleUpdate()
    {
        // V�rifier si le joueur appuie sur la touche "F" pour interagir
        if (Keyboard.current.fKey.wasPressedThisFrame)
        {
            Interact();
        }
    }

    void Interact()
    {
        // D�terminer la direction face au joueur (Input actuel ou dernier regard�)
        Vector2 direction = playerMovement.MoveInput != Vector2.zero ? playerMovement.MoveInput : playerMovement.LastInput;
        Vector3 facingDir = new Vector3(direction.x, direction.y);
        Vector3 interactPos = transform.position + facingDir;

        // V�rifier s'il y a un objet interactif � proximit�
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