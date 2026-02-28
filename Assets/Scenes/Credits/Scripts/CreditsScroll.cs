using UnityEngine;

/// <summary>
/// Fait défiler les crédits vers le haut à une vitesse constante.
/// À attacher sur un objet UI contenant le texte des crédits.
/// </summary>
public class CreditsScroll : MonoBehaviour
{
    /// <summary>
    /// Vitesse de défilement vertical (en unités par seconde).
    /// </summary>
    public float speed = 50f;

    /// <summary>
    /// Déplace l'objet vers le haut à chaque frame pour créer l'effet de défilement.
    /// </summary>
    void Update()
    {
        transform.Translate(Vector3.up * speed * Time.deltaTime);
    }
}
