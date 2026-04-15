using UnityEngine;
using TMPro;

/// <summary>
/// Gère l'affichage du HUD du joueur :
/// - heure du jeu
/// - argent du joueur
/// - mise à jour automatique de l'affichage
/// </summary>
public class HUDController : MonoBehaviour
{
    /// <summary>
    /// Texte affichant l'heure dans le HUD.
    /// </summary>
    public TMP_Text timeText;

    /// <summary>
    /// Texte affichant l'argent du joueur dans le HUD.
    /// </summary>
    public TMP_Text moneyText;

    /// <summary>
    /// Heure actuelle du jeu (exprimée en heures décimales).
    /// Exemple : 12.5 = 12h30.
    /// </summary>
    private float time = 12f;

    /// <summary>
    /// Argent actuel du joueur.
    /// </summary>
    private int money = 0;

    /// <summary>
    /// Initialise l'affichage du HUD au lancement.
    /// </summary>
    void Start()
    {
        UpdateHUD();
    }

    /// <summary>
    /// Met à jour l'affichage de l'heure et de l'argent.
    /// Convertit l'heure décimale en format HH:MM.
    /// </summary>
    void UpdateHUD()
    {
        // Conversion de l'heure décimale en heures + minutes
        int hours = Mathf.FloorToInt(time);
        int minutes = Mathf.FloorToInt((time - hours) * 60);

        // Mise à jour du texte de l'heure
        timeText.text = $"{hours:00}:{minutes:00}";

        // Mise à jour du texte de l'argent
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
    /// Retire de l'argent au joueur si possible.
    /// Retourne true si la transaction est possible.
    /// </summary>
    public bool SpendMoney(int amount)
    {
        if (money < amount)
            return false;

        money -= amount;
        UpdateHUD();
        return true;
    }

    /// <summary>
    /// Définit directement le montant d'argent du joueur.
    /// </summary>
    public void SetMoney(int value)
    {
        money = value;
        UpdateHUD();
    }

    /// <summary>
    /// Retourne le montant actuel d'argent du joueur.
    /// </summary>
    public int GetMoney()
    {
        return money;
    }

    /// <summary>
    /// Définit une nouvelle heure et met à jour l'affichage.
    /// </summary>
    public void SetTime(float newTime)
    {
        time = newTime;
        UpdateHUD();
    }

    /// <summary>
    /// Retourne l'heure actuelle du jeu.
    /// </summary>
    public float GetTime()
    {
        return time;
    }
}
