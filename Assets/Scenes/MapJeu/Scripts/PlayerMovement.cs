using UnityEngine;

/// <summary>
/// Gère le déplacement du joueur en fonction de l'entrée du joystick.
/// Inclut la marche, la course, l'arrêt des animations et la gestion de la pause.
/// </summary>
public class PlayerMovement : MonoBehaviour
{
    [Header("Paramètres de vitesse")]
    /// <summary>
    /// Vitesse de marche du joueur.
    /// </summary>
    public float walkSpeed = 5f;    // Vitesse normale

    /// <summary>
    /// Vitesse de course lorsque le joystick dépasse un certain seuil.
    /// </summary>
    public float runSpeed = 8f;     // Vitesse accélérée

    /// <summary>
    /// Seuil d'intensité du joystick à partir duquel le joueur court.
    /// </summary>
    public float sprintThreshold = 0.85f; // Seuil du joystick pour courir (0 à 1)

    /// <summary>
    /// Référence au Rigidbody2D du joueur pour gérer le mouvement physique.
    /// </summary>
    private Rigidbody2D rb;

    /// <summary>
    /// Référence à l'Animator pour gérer les animations de déplacement.
    /// </summary>
    private Animator animator;
    
    // --- AJOUT POUR LA LIAISON AVEC PLAYERCONTROLLER ---
    /// <summary>
    /// Retourne la valeur actuelle du joystick (input de déplacement).
    /// </summary>
    public Vector2 MoveInput => Joystick.valeurInput;

    /// <summary>
    /// Retourne la dernière direction enregistrée pour l'animation Idle.
    /// </summary>
    public Vector2 LastInput => new Vector2(animator.GetFloat("LastInputX"), animator.GetFloat("LastInputY"));

    /// <summary>
    /// Initialise les composants nécessaires.
    /// </summary>
    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        animator = GetComponent<Animator>();
    }

    /// <summary>
    /// Gère le déplacement physique du joueur et les animations associées.
    /// S'exécute à intervalle fixe pour une meilleure cohérence physique.
    /// </summary>
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

    /// <summary>
    /// Arrête les animations de déplacement et enregistre la dernière direction utilisée.
    /// </summary>
    public void StopMovementAnimations()
    {
        animator.SetBool("isWalking", false);
        // On garde la dernière direction pour l'Idle
        animator.SetFloat("LastInputX", animator.GetFloat("InputX"));
        animator.SetFloat("LastInputY", animator.GetFloat("InputY"));
    }
}
