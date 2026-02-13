using UnityEngine;
using UnityEngine.UI;

public class SoundEffectManager : MonoBehaviour
{
    public static SoundEffectManager Instance;

    private AudioSource audioSource;
    private AudioSource randomPitchAudioSource;
    private AudioSource voiceAudioSource;

    private SoundEffectLibrary soundEffectLibrary;

    [SerializeField] private Slider sfxSlider;

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

    public static void PlayVoice(AudioClip audioClip, float pitch = 1f)
    {
        if (Instance == null || audioClip == null) return;

        Instance.voiceAudioSource.pitch = pitch;
        Instance.voiceAudioSource.PlayOneShot(audioClip);
    }

    private void OnSliderValueChanged(float value)
    {
        audioSource.volume = value;
        randomPitchAudioSource.volume = value;
        voiceAudioSource.volume = value;
    }

    public static void SetVolume(float volume)
    {
        Instance.audioSource.volume = volume;
        Instance.randomPitchAudioSource.volume = volume;
        Instance.voiceAudioSource.volume = volume;

        if (Instance.sfxSlider != null)
            Instance.sfxSlider.value = volume;
    }
}
