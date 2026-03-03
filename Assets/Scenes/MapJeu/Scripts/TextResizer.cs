using UnityEngine;
using TMPro;

public class TextResizer : MonoBehaviour
{
    [Header("Références")]
    public TextMeshProUGUI dialogueText;
    
    [Header("Réglages")]
    public float step = 2f;      // Valeur d'augmentation/diminution
    public float minSize = 12f;
    public float maxSize = 60f;
    public float defaultSize = 24f;

    private string saveKey = "UserTextSize";

    void Start()
    {
        // Charger la taille sauvegardée ou utiliser la taille par défaut
        float savedSize = PlayerPrefs.GetFloat(saveKey, defaultSize);
        ApplySize(savedSize);
    }

    public void IncreaseSize()
    {
        if (dialogueText == null) return;
        float newSize = dialogueText.fontSize + step;
        if (newSize <= maxSize) ApplyAndSave(newSize);
    }

    public void DecreaseSize()
    {
        if (dialogueText == null) return;
        float newSize = dialogueText.fontSize - step;
        if (newSize >= minSize) ApplyAndSave(newSize);
    }

    private void ApplyAndSave(float size)
    {
        ApplySize(size);
        PlayerPrefs.SetFloat(saveKey, size);
        PlayerPrefs.Save(); 
    }

    private void ApplySize(float size)
    {
        dialogueText.fontSize = size;
    }
}
