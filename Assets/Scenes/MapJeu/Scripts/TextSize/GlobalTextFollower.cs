using UnityEngine;
using TMPro;

public class GlobalTextFollower : MonoBehaviour
{
    private TextMeshProUGUI _textMesh;
    private float _baseSize;
    private bool _isInitialized = false;

    void Awake() => Initialize();

    void Initialize()
    {
        if (_isInitialized) return;
        _textMesh = GetComponent<TextMeshProUGUI>();
        if (_textMesh != null)
        {
            _baseSize = _textMesh.fontSize;
            _isInitialized = true;
        }
    }

    void OnEnable()
    {
        // On récupère le multiplicateur sauvegardé (défaut : 1.0)
        float savedScale = PlayerPrefs.GetFloat("GlobalTextScale", 1.0f);
        ApplyScale(savedScale);
    }

    public void ApplyScale(float scaleFactor)
    {
        if (!_isInitialized) Initialize();
        if (_textMesh != null)
        {
            _textMesh.fontSize = _baseSize * scaleFactor;
        }
    }
}
