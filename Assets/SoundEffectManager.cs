using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Gère tous les effets sonores du jeu :
/// - système de singleton pour un accès global
/// - trois AudioSource séparés (normal, random pitch, voix)
/// - récupération des sons via SoundEffectLibrary
/// - gestion du volume via un slider
/// - fonctions statiques pour jouer des sons depuis n'importe quel script.
/// </summary>
public class SoundEffectManager : MonoBehaviour
{
    /// <summary>
    /// Instance unique du SoundEffectManager (singleton).
    /// </summary>
    public static SoundEffectManager Instance;

    /// <summary>
    /// AudioSource principal pour les sons normaux.
    /// </summary>
    private AudioSource audioSource;

    /// <summary>
    /// AudioSource utilisé pour jouer des sons avec pitch aléatoire.
    /// </summary>
    private AudioSource randomPitchAudioSource;

    /// <summary>
    /// AudioSource dédié aux voix (dialogues).
    /// </summary>
    private AudioSource voiceAudioSource;

    /// <summary>
    /// Référence à la bibliothèque de sons.
    /// </summary>
    private SoundEffectLibrary soundEffectLibrary;

    /// <summary>
    /// Slider permettant de régler le volume des effets sonores.
    /// </summary>
    [SerializeField] private Slider sfxSlider;

    /// <summary>
    /// Initialise le singleton, récupère les AudioSource et la bibliothèque de sons.
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
    /// Joue un son depuis un groupe donné.
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
    /// Joue un son de voix avec un pitch personnalisé.
    /// </summary>
    public static void PlayVoice(AudioClip audioClip, float pitch = 1f)
    {
        if (Instance == null || audioClip == null) return;

        Instance.voiceAudioSource.pitch = pitch;
        Instance.voiceAudioSource.PlayOneShot(audioClip);
    }

    /// <summary>
    /// Callback appelé lorsque le slider change de valeur.
    /// Met à jour le volume des trois AudioSource.
    /// </summary>
    private void OnSliderValueChanged(float value)
    {
        audioSource.volume = value;
        randomPitchAudioSource.volume = value;
        voiceAudioSource.volume = value;
    }

    /// <summary>
    /// Change le volume global des effets sonores et met à jour le slider si présent.
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
