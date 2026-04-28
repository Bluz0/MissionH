using UnityEngine;
using UnityEngine.SceneManagement; // Obligatoire
using System.Collections;

public class AutoStartTutorial : MonoBehaviour
{
    public NPC guideNPC;
    public float delayAfterLoad = 1.5f;

    private void OnEnable()
    {
        // On s'abonne à l'événement de chargement de scène
        SceneManager.sceneLoaded += OnSceneLoaded;
    }

    private void OnDisable()
    {
        // On se désabonne pour éviter les fuites de mémoire
        SceneManager.sceneLoaded -= OnSceneLoaded;
    }

    // Cette fonction est appelée automatiquement dès que la scène est chargée
    private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        // On vérifie qu'on est bien dans la scène de jeu (optionnel)
        StartCoroutine(ForcedStartRoutine());
    }

    IEnumerator ForcedStartRoutine()
    {
        // Attente de sécurité pour l'initialisation des scripts et de l'API
        yield return new WaitForSeconds(delayAfterLoad);

        // On cherche le PNJ s'il n'est pas assigné (sécurité supplémentaire)
        if (guideNPC == null)
        {
            guideNPC = GameObject.Find("GuideTuto")?.GetComponent<NPC>();
        }

        if (guideNPC != null)
        {
            // IMPORTANT : On vérifie si le PNJ a fini de charger son dialogue
            // On attend tant que le dialogue n'est pas "Loaded"
            float timer = 0;
            while (!guideNPC.CanInteract() && timer < 5f)
            {
                timer += Time.deltaTime;
                yield return null;
            }

            Debug.Log("Scène chargée et PNJ prêt : Lancement Tuto !");
            guideNPC.Interact();
        }
        else
        {
            Debug.LogError("TutorialManager : Le PNJ Guide est introuvable dans la scène !");
        }
    }
}