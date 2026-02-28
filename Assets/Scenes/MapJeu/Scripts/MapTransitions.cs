using Cinemachine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Gère les transitions entre différentes zones de la carte :
/// - déclenche un fondu via ScreenFader
/// - change les limites de caméra (CinemachineConfiner)
/// - déplace le joueur selon une direction ou vers un point de téléportation.
/// </summary>
public class MapTransitions : MonoBehaviour
{
    /// <summary>
    /// Nouvelle limite de carte à appliquer à la caméra.
    /// </summary>
    [SerializeField] PolygonCollider2D mapBoundry;

    /// <summary>
    /// Référence au CinemachineConfiner pour changer les limites de caméra.
    /// </summary>
    CinemachineConfiner confiner;

    /// <summary>
    /// Direction dans laquelle le joueur doit être déplacé.
    /// </summary>
    [SerializeField] Direction direction;

    /// <summary>
    /// Position cible utilisée uniquement si la direction est Teleport.
    /// </summary>
    [SerializeField] Transform teleportTargetPosition;

    /// <summary>
    /// Liste des directions possibles pour la transition.
    /// </summary>
    enum Direction { Up, Down, Left, Right, Teleport }

    /// <summary>
    /// Récupère le confiner au démarrage.
    /// </summary>
    private void Awake()
    {
        confiner = FindAnyObjectByType<CinemachineConfiner>();
    }

    /// <summary>
    /// Déclenche la transition lorsqu'un joueur entre dans le trigger.
    /// </summary>
    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.gameObject.CompareTag("Player"))
        {
            FadeTransition(collision.gameObject);
        }
    }

    /// <summary>
    /// Effectue un fondu noir, change les limites de caméra,
    /// déplace le joueur, puis effectue un fondu inverse.
    /// </summary>
    async void FadeTransition(GameObject player)
    {
        await ScreenFader.Instance.FadeOut();
        confiner.m_BoundingShape2D = mapBoundry;
        UpdatePlayerPosition(player);
        await ScreenFader.Instance.FadeIn();
    }

    /// <summary>
    /// Déplace le joueur selon la direction définie ou vers un point de téléportation.
    /// </summary>
    private void UpdatePlayerPosition(GameObject player)
    {
        if (direction == Direction.Teleport)
        {
            player.transform.position = teleportTargetPosition.position;
            return;
        }

        Vector3 newPos = player.transform.position;

        switch (direction)
        {
            case Direction.Up:
                newPos.y += 1.5f;
                break;
            case Direction.Down:
                newPos.y -= 1.5f;
                break;
            case Direction.Left:
                newPos.x += 1.5f;
                break;
            case Direction.Right:
                newPos.x -= 1.5f;
                break;
        }

        player.transform.position = newPos;
    }
}
