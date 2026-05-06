using UnityEngine;
using TMPro;

public class HUDController : MonoBehaviour
{
    // Instance statique pour y accéder de partout (Singleton)
    public static HUDController Instance;

    [Header("Réglages Time")]
    public bool timePasses = true;      // Le temps défile-t-il ?
    public float timeSpeed = 0.01f;     // Vitesse du temps (0.01 = réaliste, plus haut = plus rapide)

    [Header("Références HUD")]
    public TMP_Text timeText;
    public TMP_Text moneyText;

    [Header("Références MENU (Optionnel)")]
    public TMP_Text menuTimeText;       // Glisse ici le texte qui est dans ton menu
    public TMP_Text menuMoneyText;      // Glisse ici le texte d'argent dans ton menu

    private float time = 8f;            // Départ à 08:00
    private int money = 0;

    void Awake()
    {
        // Initialisation du Singleton
        if (Instance == null) Instance = this;
    }

    void Start()
    {
        UpdateHUD();
    }

    void Update()
    {
        if (timePasses)
        {
            // Le temps avance. 24.0f permet de revenir à 00:00 après minuit
            time += Time.deltaTime * timeSpeed;
            if (time >= 24f) time = 0f;

            UpdateHUD();
        }
    }

    public void UpdateHUD()
    {
        int hours = Mathf.FloorToInt(time);
        int minutes = Mathf.FloorToInt((time - hours) * 60);
        string timeString = $"{hours:00}:{minutes:00}";

        // Mise à jour HUD
        if (timeText != null) timeText.text = timeString;
        if (moneyText != null) moneyText.text = money.ToString();

        if (menuTimeText != null) menuTimeText.text = timeString;
        if (menuMoneyText != null) menuMoneyText.text = money.ToString();
    }

    // --- Gestion de l'Argent ---
    public void AddMoney(int amount)
    {
        money += amount;
        UpdateHUD();
    }

    public bool SpendMoney(int amount)
    {
        if (money < amount) return false;
        money -= amount;
        UpdateHUD();
        return true;
    }

    // --- Getters ---
    public int GetMoney() => money;
    public float GetTime() => time;

    /// <summary>
    /// Définit directement le montant d'argent (utilisé par la sauvegarde).
    /// </summary>
    public void SetMoney(int value)
    {
        money = value;
        UpdateHUD();
    }

    /// <summary>
    /// Définit directement l'heure (utilisé par la sauvegarde).
    /// </summary>
    public void SetTime(float newTime)
    {
        time = newTime;
        UpdateHUD();
    }
}