/// <summary>
/// Interface définissant un objet interactif dans le jeu.
/// Tout objet interactif doit :
/// - indiquer s'il peut être interagi avec (CanInteract)
/// - exécuter une action lorsqu'on interagit avec lui (Interact).
/// 
/// Cette interface est utilisée par InteractionDetector pour
/// détecter et déclencher les interactions.
/// </summary>
public interface IInteractable
{
    /// <summary>
    /// Retourne true si l'objet peut être interagi avec.
    /// Permet de désactiver temporairement certaines interactions.
    /// </summary>
    bool CanInteract();

    /// <summary>
    /// Action exécutée lorsque le joueur interagit avec l'objet.
    /// </summary>
    void Interact();
}
