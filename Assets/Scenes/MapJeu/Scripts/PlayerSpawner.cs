using UnityEngine;
using Cinemachine; // Vérifie bien le "Unity." devant

public class PlayerSpawner : MonoBehaviour
{
    public GameObject[] tousLesAvatars;
    public CinemachineVirtualCamera vcam;

    void Start()
    {
        int index = SelectionManager.SelectedAvatarIndex;

        if (index >= 0 && index < tousLesAvatars.Length)
        {
            // 1. On crée le personnage et on le stocke dans une variable 'player'
            GameObject player = Instantiate(tousLesAvatars[index], transform.position, Quaternion.identity);

            // 2. On dit à la caméra de suivre ce nouveau 'player'
            if (vcam != null)
            {
                vcam.Follow = player.transform;
            }
        }
    }
}