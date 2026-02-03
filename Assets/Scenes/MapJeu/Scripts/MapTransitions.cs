using Cinemachine;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MapTransitions : MonoBehaviour
{
    [SerializeField] PolygonCollider2D mapBoundry;
    CinemachineConfiner confiner;
    [SerializeField] Direction direction;
    [SerializeField] Transform teleportTargetPosition;
    enum Direction { Up, Down, Left, Right, Teleport}

    private void Awake()
    {
        confiner = FindAnyObjectByType<CinemachineConfiner>();
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if(collision.gameObject.CompareTag("Player"))
        {
            FadeTransition(collision.gameObject);
        }
    }

    async void FadeTransition(GameObject player)
    {
        await ScreenFader.Instance.FadeOut();
        confiner.m_BoundingShape2D = mapBoundry;
        UpdatePlayerPosition(player);
        await ScreenFader.Instance.FadeIn();
    }

    private void UpdatePlayerPosition(GameObject player)
    {
        if(direction == Direction.Teleport)
        {
            player.transform.position = teleportTargetPosition.position;
            return;
        }

        Vector3 newPos = player.transform.position;

        switch(direction)
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
