using UnityEngine;

public class NPCAnimationController : MonoBehaviour
{
    // On crée une liste propre pour l'inspecteur
    public enum NPCState { Idle, Reading, SittingLeft, SittingRight, Phone }

    [Header("Réglages Animation")]
    public NPCState currentState = NPCState.Idle;

    private Animator animator;

    void Start()
    {
        animator = GetComponent<Animator>();
        ApplyAnimation();
    }

    // Cette fonction s'appelle toute seule quand tu changes une valeur dans l'inspecteur
    void OnValidate()
    {
        if (animator == null) animator = GetComponent<Animator>();
        if (animator != null) ApplyAnimation();
    }

    public void ApplyAnimation()
    {
        // On remet tous les paramètres à false d'abord pour éviter les conflits
        animator.SetBool("isReading", false);
        animator.SetBool("IsSittingLeft", false);
        animator.SetBool("IsSittingRight", false);
        animator.SetBool("IsPhone", false);
        animator.SetBool("Idle", false);

        // On active uniquement celui qui correspond au choix de la liste
        switch (currentState)
        {
            case NPCState.Idle:
                animator.SetBool("Idle", true);
                break;
            case NPCState.Reading:
                animator.SetBool("isReading", true);
                break;
            case NPCState.SittingLeft:
                animator.SetBool("IsSittingLeft", true);
                break;
            case NPCState.SittingRight:
                animator.SetBool("IsSittingRight", true);
                break;
            case NPCState.Phone:
                animator.SetBool("IsPhone", true);
                break;
        }
    }
}