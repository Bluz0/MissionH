using UnityEngine;
using TMPro;

public class GlobalSizeController : MonoBehaviour
{
    [Header("Réglages des Multiplicateurs")]
    public float scaleSmall = 0.7f;  // Taille réduite (70%)
    public float scaleNormal = 1.0f; // Taille normale (100%)
    public float scaleLarge = 1.4f;  // Taille augmentée (140%)

    private float currentScale = 1.0f;
    private const string SaveKey = "GlobalTextScale";

    void Awake()
    {
        currentScale = PlayerPrefs.GetFloat(SaveKey, 1.0f);
    }

    void Start()
    {
        ApplyToAll(); // Applique la taille sauvegardée au lancement
    }

    // Fonctions pour les 3 boutons
    public void SetSmall() { currentScale = scaleSmall; ApplyToAll(); }
    public void SetNormal() { currentScale = scaleNormal; ApplyToAll(); }
    public void SetLarge() { currentScale = scaleLarge; ApplyToAll(); }

    private void ApplyToAll()
    {
        // Sauvegarde
        PlayerPrefs.SetFloat(SaveKey, currentScale);
        PlayerPrefs.Save();

        // Mise à jour de TOUS les textes avec le script Follower
        GlobalTextFollower[] followers = Object.FindObjectsByType<GlobalTextFollower>();
        foreach (GlobalTextFollower f in followers)
        {
            f.ApplyScale(currentScale);
        }

        Debug.Log($"Taille globale réglée sur : {currentScale * 100}%");
    }
}
