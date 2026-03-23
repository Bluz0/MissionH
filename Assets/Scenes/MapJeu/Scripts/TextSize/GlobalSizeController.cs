using UnityEngine;

public class GlobalSizeController : MonoBehaviour
{
    public float step = 2f;
    public float minOffset = -10f;
    public float maxOffset = 20f;

    private float currentOffset = 0f;

    void Awake()
    {
        currentOffset = PlayerPrefs.GetFloat("TextSizeOffset", 0f);
    }

    public void Increase()
    {
        if (currentOffset + step <= maxOffset)
        {
            currentOffset += step;
            ApplyToAll();
        }
    }

    public void Decrease()
    {
        if (currentOffset - step >= minOffset)
        {
            currentOffset -= step;
            ApplyToAll();
        }
    }

    private void ApplyToAll()
    {
        // On sauvegarde AVANT d'appliquer
        PlayerPrefs.SetFloat("TextSizeOffset", currentOffset);
        PlayerPrefs.Save();

        // On cherche TOUS les scripts (actifs et inactifs si possible)
        // Note: FindObjectsByType ne trouve que les objets ACTIFS par défaut
        GlobalTextFollower[] followers = Object.FindObjectsByType<GlobalTextFollower>(FindObjectsSortMode.None);
        
        foreach (GlobalTextFollower f in followers)
        {
            f.ApplyOffset(currentOffset);
        }
    }
}
