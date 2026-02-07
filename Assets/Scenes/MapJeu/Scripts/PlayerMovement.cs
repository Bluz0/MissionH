using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    [Header("Paramètres de vitesse")]
    public float walkSpeed = 5f;    // Vitesse normale
    public float runSpeed = 8f;     // Vitesse accélérée
    public float sprintThreshold = 0.85f; // Seuil du joystick pour courir (0 à 1)

    private Rigidbody2D rb;
    private Animator animator;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        animator = GetComponent<Animator>();
    }

    void FixedUpdate()
    {
        if (PauseController.IsGamePaused)
        {
            rb.linearVelocity = Vector2.zero;
            StopMovementAnimations();
            return;
        }

        Vector2 moveInput = Joystick.valeurInput;
        float inputMagnitude = moveInput.magnitude;

        if (inputMagnitude > 0)
        {
            // --- LOGIQUE D'ACCÉLÉRATION ---
            // Si on pousse le stick à plus de 85%, on utilise runSpeed, sinon walkSpeed
            float currentSpeed = (inputMagnitude > sprintThreshold) ? runSpeed : walkSpeed;
            
            rb.linearVelocity = moveInput * currentSpeed;

            // --- ANIMATIONS ---
            animator.SetBool("isWalking", true);
            
            // Si tu as une animation de course, tu peux utiliser ce paramètre :
            // animator.SetBool("isRunning", inputMagnitude > sprintThreshold);

            animator.SetFloat("InputX", moveInput.x);
            animator.SetFloat("InputY", moveInput.y);
        }
        else
        {
            rb.linearVelocity = Vector2.zero;
            StopMovementAnimations();
        }
    }

    void StopMovementAnimations()
    {
        animator.SetBool("isWalking", false);
        // On garde la dernière direction pour l'Idle
        animator.SetFloat("LastInputX", animator.GetFloat("InputX"));
        animator.SetFloat("LastInputY", animator.GetFloat("InputY"));
    }
}