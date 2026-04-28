using UnityEngine;
using System.Collections;

public class TutorialManager : MonoBehaviour
{
    [Header("Configuration")]
    public NPC guideNPC; // Glisse ici ton PNJ de tuto
    public string tutorialSaveKey = "TutorialCompleted";
    public bool forceTutoEveryTime = false; // Pour tes tests

    void Start()
    {
        // On vérifie si le joueur a déjà fait le tuto
        bool alreadyDone = PlayerPrefs.GetInt(tutorialSaveKey, 0) == 1;

        if (!alreadyDone || forceTutoEveryTime)
        {
            StartCoroutine(StartTutoRoutine());
        }
    }

    IEnumerator StartTutoRoutine()
    {
        // On attend un tout petit peu que la scène soit bien chargée (comme pour le spawn)
        yield return new WaitForSeconds(0.5f);

        if (guideNPC != null)
        {
            Debug.Log("Lancement automatique du tutoriel...");
            guideNPC.Interact(); // On force l'interaction

            // On sauvegarde que le tuto est lancé/fait
            PlayerPrefs.SetInt(tutorialSaveKey, 1);
            PlayerPrefs.Save();
        }
    }
}