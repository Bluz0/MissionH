using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Gère la musique du jeu :
/// - système de singleton pour persister entre les scènes
/// - contrôle du volume via un slider
/// - lecture automatique d'une musique au lancement.
/// </summary>
public class MusicManager : MonoBehaviour
{
    /// <summary>
    /// Instance unique du MusicManager (singleton).
    /// </summary>
    public static MusicManager Instance;

    /// <summary>
    /// Source audio utilisée pour jouer la musique.
    /// </summary>
    private AudioSource musicSource;

    /// <summary>
    /// Slider permettant de régler le volume de la musique.
    /// </summary>
    [SerializeField] private Slider musicSlider;

    /// <summary>
    /// Musique jouée automatiquement au lancement du jeu.
    /// </summary>
    [SerializeField] private AudioClip startMusic; // musique qui joue au lancement

    /// <summary>
    /// Initialise le singleton, récupère l'AudioSource
    /// et empêche la destruction de l'objet lors des changements de scène.
    /// </summary>
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;

            musicSource = GetComponent<AudioSource>();

            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    /// <summary>
    /// Configure le slider si présent et lance la musique de démarrage.
    /// </summary>
    private void Start()
    {
        // Applique le slider si présent
        if (musicSlider != null)
        {
            musicSlider.onValueChanged.AddListener(OnSliderValueChanged);
            musicSource.volume = musicSlider.value;
        }

        // Lance la musique automatiquement
        if (startMusic != null)
            PlayMusic(startMusic, musicSource.volume);
    }

    /// <summary>
    /// Joue une musique donnée avec un volume optionnel.
    /// </summary>
    public void PlayMusic(AudioClip clip, float volume = 1f)
    {
        musicSource.clip = clip;
        musicSource.loop = true;
        musicSource.volume = volume;
        musicSource.Play();
    }

    /// <summary>
    /// Arrête la musique en cours.
    /// </summary>
    public void StopMusic()
    {
        musicSource.Stop();
    }

    /// <summary>
    /// Callback appelé lorsque le slider change de valeur.
    /// Met à jour le volume de la musique.
    /// </summary>
    private void OnSliderValueChanged(float value)
    {
        musicSource.volume = value;
    }

    /// <summary>
    /// Modifie le volume global de la musique depuis n'importe quel script.
    /// Met aussi à jour le slider si présent.
    /// </summary>
    public static void SetVolume(float volume)
    {
        Instance.musicSource.volume = volume;

        if (Instance.musicSlider != null)
            Instance.musicSlider.value = volume;
    }
}
