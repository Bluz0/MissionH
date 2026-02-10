using UnityEngine;

public class FollowPlayerUI : MonoBehaviour
{
    public Transform target;
    public Vector3 offset;

    void Update()
    {
        if (target == null) return;
        Vector3 screenPos = Camera.main.WorldToScreenPoint(target.position + offset);
        transform.position = screenPos;
    }
}
