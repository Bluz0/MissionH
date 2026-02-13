/// <summary>
/// Définit le comportement de base pour tout objet pouvant être interactif.
/// Les classes qui implémentent cette interface doivent préciser :
/// - si l’objet peut être interagi avec (CanInteract)
/// - ce qui se passe lors de l’interaction (Interact)
/// </summary>
public interface IInteractable
{
    bool CanInteract();
    void Interact();
}
