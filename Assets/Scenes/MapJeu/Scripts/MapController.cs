using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class MapController : MonoBehaviour
{
    [Header("Références UI")]
    public RectTransform mapImage;          // L'image de la carte (UI → RectTransform)
    public RectTransform playerIcon;        // L'icône du joueur sur la carte
    public RectTransform markersParent;     // Parent qui contiendra les labels des bâtiments
    public GameObject labelPrefab;          // Prefab TMP_Text utilisé pour afficher les noms


    [Header("Réglages Affichage")]
    [Tooltip("Taille de la police pour les noms de bâtiments")]
    public float fontSize = 24f;

    [Header("Références Monde")]
    public Transform player;                // Référence au joueur dans la scène
    public Vector2 worldMin;                // Coordonnées du coin bas-gauche de la map dans le monde
    public Vector2 worldMax;                // Coordonnées du coin haut-droit de la map dans le monde

    /// <summary>
    /// Appelé automatiquement lorsque la page de la carte devient active.
    /// - Met à jour la position du joueur sur la carte
    /// - Génère les labels des bâtiments
    /// </summary>
    void OnEnable()
    {
        UpdatePlayerPosition();
        GenerateMarkers();
    }

    void Update()
    {
        UpdatePlayerPosition();
    }

    /// <summary>
    /// Convertit la position du joueur dans le monde en position sur l'image de la carte.
    /// Place ensuite l'icône du joueur à cet endroit.
    /// </summary>
    void UpdatePlayerPosition()
    {
        if (player == null) return;

        Vector2 pos = player.position;

        float normalizedX = Mathf.InverseLerp(worldMin.x, worldMax.x, pos.x);
        float normalizedY = Mathf.InverseLerp(worldMin.y, worldMax.y, pos.y);

        float mapX = (normalizedX - 0.5f) * mapImage.rect.width;
        float mapY = (normalizedY - 0.5f) * mapImage.rect.height;

        playerIcon.anchoredPosition = new Vector2(mapX, mapY);
    }

    /// <summary>
    /// Génère les labels des bâtiments :
    /// - Supprime les anciens labels
    /// - Trouve tous les MapMarker dans la scène
    /// - Convertit leur position monde → position sur la carte
    /// - Instancie un label pour chacun
    /// </summary>
    void GenerateMarkers()
    {
        foreach (Transform child in markersParent)
            Destroy(child.gameObject);

        foreach (MapMarker marker in FindObjectsByType<MapMarker>())
        {
            GameObject label = Instantiate(labelPrefab, markersParent);

            TMP_Text textComponent = label.GetComponent<TMP_Text>();

            textComponent.text = marker.buildingName;
            textComponent.fontSize = fontSize;

            textComponent.fontStyle = FontStyles.Bold;

            Vector2 pos = marker.transform.position;

            float normalizedX = Mathf.InverseLerp(worldMin.x, worldMax.x, pos.x);
            float normalizedY = Mathf.InverseLerp(worldMin.y, worldMax.y, pos.y);

            float mapX = (normalizedX - 0.5f) * mapImage.rect.width;
            float mapY = (normalizedY - 0.5f) * mapImage.rect.height;

            label.GetComponent<RectTransform>().anchoredPosition = new Vector2(mapX, mapY);
        }
    }
}
