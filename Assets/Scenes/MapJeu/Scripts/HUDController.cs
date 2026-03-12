using UnityEngine;
using TMPro;

public class HUDController : MonoBehaviour
{
    public TMP_Text timeText;   // Texte affichant l'heure
    public TMP_Text moneyText;  // Texte affichant l'argent

    private float time = 12f;   // Heure de départ (12:00)
    private int money = 163;    // Argent de départ

    /// <summary>
    /// Initialise l'affichage du HUD au lancement.
    /// </summary>
    void Start()
    {
        UpdateHUD();
    }

    /// <summary>
    /// Met à jour l'affichage de l'heure et de l'argent.
    /// </summary>
    void UpdateHUD()
    {
        int hours = Mathf.FloorToInt(time);
        int minutes = Mathf.FloorToInt((time - hours) * 60);

        timeText.text = $"{hours:00}:{minutes:00}";
        moneyText.text = money.ToString();
    }

    /// <summary>
    /// Ajoute de l'argent au joueur et met à jour le HUD.
    /// </summary>
    public void AddMoney(int amount)
    {
        money += amount;
        UpdateHUD();
    }

    /// <summary>
    /// Définit une nouvelle heure et met à jour le HUD.
    /// </summary>
    public void SetTime(float newTime)
    {
        time = newTime;
        UpdateHUD();
    }
}
