using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Gère la lecture des effets sonores dans le jeu.
/// Utilise un système de singleton pour être accessible globalement.
/// Permet de jouer des sons normaux, des sons avec pitch aléatoire,
/// ainsi que des voix, tout en gérant le volume via un slider.
/// </summary>
public class SoundEffectManager : MonoBehaviour
{
    /// <summary>
    /// Instance unique du gestionnaire d'effets sonores.
    /// </summary>
    public static SoundEffectManager Instance;

    /// <summary>
    /// Source audio principale pour les effets sonores normaux.
    /// </summary>
    private AudioSource audioSource;

    /// <summary>
    /// Source audio utilisée pour jouer des sons avec un pitch aléatoire.
    /// </summary>
    private AudioSource randomPitchAudioSource;

    /// <summary>
    /// Source audio dédiée aux voix.
    /// </summary>
    private AudioSource voiceAudioSource;

    /// <summary>
    /// Référence à la bibliothèque d'effets sonores.
    /// </summary>
    private SoundEffectLibrary soundEffectLibrary;

    /// <summary>
    /// Slider permettant de régler le volume des effets sonores.
    /// </summary>
    [SerializeField] private Slider sfxSlider;

    /// <summary>
    /// Initialise le singleton, récupère les AudioSources
    /// et empêche la destruction de l'objet lors des changements de scène.
    /// </summary>
    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;

            AudioSource[] audioSources = GetComponents<AudioSource>();

            audioSource = audioSources[0];
            randomPitchAudioSource = audioSources[1];
            voiceAudioSource = audioSources[2];

            soundEffectLibrary = GetComponent<SoundEffectLibrary>();

            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    /// <summary>
    /// Initialise le slider si présent et synchronise le volume.
    /// </summary>
    private void Start()
    {
        if (sfxSlider != null)
        {
            sfxSlider.onValueChanged.AddListener(OnSliderValueChanged);

            audioSource.volume = sfxSlider.value;
            randomPitchAudioSource.volume = sfxSlider.value;
            voiceAudioSource.volume = sfxSlider.value;
        }
    }

    /// <summary>
    /// Joue un effet sonore selon son nom.
    /// Peut jouer avec un pitch aléatoire si demandé.
    /// </summary>
    public static void Play(string soundName, bool randomPitch = false)
    {
        if (Instance == null) return;

        AudioClip clip = Instance.soundEffectLibrary.GetRandomClip(soundName);
        if (clip == null) return;

        if (randomPitch)
        {
            Instance.randomPitchAudioSource.pitch = Random.Range(1f, 1.5f);
            Instance.randomPitchAudioSource.PlayOneShot(clip);
        }
        else
        {
            Instance.audioSource.PlayOneShot(clip);
        }
    }

    /// <summary>
    /// Joue un clip audio de voix avec un pitch ajustable.
    /// </summary>
    public static void PlayVoice(AudioClip audioClip, float pitch = 1f)
    {
        if (Instance == null || audioClip == null) return;

        Instance.voiceAudioSource.pitch = pitch;
        Instance.voiceAudioSource.PlayOneShot(audioClip);
    }

    /// <summary>
    /// Callback appelé lorsque le slider change de valeur.
    /// Met à jour le volume de toutes les sources audio.
    /// </summary>
    private void OnSliderValueChanged(float value)
    {
        audioSource.volume = value;
        randomPitchAudioSource.volume = value;
        voiceAudioSource.volume = value;
    }

    /// <summary>
    /// Définit le volume global des effets sonores
    /// et met à jour le slider si présent.
    /// </summary>
    public static void SetVolume(float volume)
    {
        Instance.audioSource.volume = volume;
        Instance.randomPitchAudioSource.volume = volume;
        Instance.voiceAudioSource.volume = volume;

        if (Instance.sfxSlider != null)
            Instance.sfxSlider.value = volume;
    }
}
