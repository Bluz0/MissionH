using UnityEngine;
using TMPro;

public class GlobalTextFollower : MonoBehaviour
{
    private TextMeshProUGUI _textMesh;
    private float _baseSize;
    private bool _isInitialized = false;

    void Awake()
    {
        Initialize();
    }

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

    // Elle s'exécute dès que l'objet devient actif dans la scène
    void OnEnable()
    {
        if (!_isInitialized) Initialize();
        
        // On va chercher la sauvegarde directement
        float savedOffset = PlayerPrefs.GetFloat("TextSizeOffset", 0f);
        ApplyOffset(savedOffset);
    }

    public void ApplyOffset(float offset)
    {
        if (_textMesh != null)
        {
            _textMesh.fontSize = _baseSize + offset;
        }
    }
}
