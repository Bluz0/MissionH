using UnityEngine;

/// <summary>
/// Fait défiler automatiquement le contenu des crédits vers le haut
/// à une vitesse constante définie par la variable speed.
/// </summary>
public class CreditsScroll : MonoBehaviour
{
    /// <summary>
    /// Vitesse de défilement vertical des crédits.
    /// </summary>
    public float speed = 50f;

    /// <summary>
    /// Déplace l'objet vers le haut à chaque frame
    /// pour créer l'effet de défilement.
    /// </summary>
    void Update()
    {
        transform.Translate(Vector3.up * speed * Time.deltaTime);
    }
}
