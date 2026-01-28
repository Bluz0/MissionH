using UnityEngine.InputSystem;
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 5f;
    private Rigidbody2D rb;
    private Vector2 moveInput;
    private Animator animator;

    // Propri�t�s pour que le PlayerController puisse lire la direction du regard
    public Vector2 MoveInput => moveInput;
    public Vector2 LastInput => new Vector2(animator.GetFloat("LastinputX"), animator.GetFloat("LastinputY"));

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        animator = GetComponent<Animator>();
    }

    void Update()
    {
        if (PauseController.IsGamePaused)
        {
            if(rb.linearVelocity != Vector2.zero)
            {
                rb.linearVelocity = Vector2.zero;
                StopMovementAnimations();
            }
            return;
        }
        rb.linearVelocity = moveInput * moveSpeed;
        animator.SetBool("isWalking", rb.linearVelocity.magnitude > 0);
    }

    public void Move(InputAction.CallbackContext context)
    {
        animator.SetBool("isWalking", true);
        if (context.canceled)
        {
            StopMovementAnimations();
        }
        moveInput = context.ReadValue<Vector2>();
        animator.SetFloat("InputX", moveInput.x);
        animator.SetFloat("InputY", moveInput.y);
    }

    void StopMovementAnimations()
    {
        animator.SetBool("isWalking", false);
        animator.SetFloat("LastinputX", moveInput.x);
        animator.SetFloat("LastinputY", moveInput.y);
    }
}
