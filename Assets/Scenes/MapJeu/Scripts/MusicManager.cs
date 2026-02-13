using UnityEngine;
using UnityEngine.UI;

public class MusicManager : MonoBehaviour
{
    public static MusicManager Instance;

    private AudioSource musicSource;

    [SerializeField] private Slider musicSlider;
    [SerializeField] private AudioClip startMusic; // musique qui joue au lancement

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

    public void PlayMusic(AudioClip clip, float volume = 1f)
    {
        musicSource.clip = clip;
        musicSource.loop = true;
        musicSource.volume = volume;
        musicSource.Play();
    }

    public void StopMusic()
    {
        musicSource.Stop();
    }

    private void OnSliderValueChanged(float value)
    {
        musicSource.volume = value;
    }

    public static void SetVolume(float volume)
    {
        Instance.musicSource.volume = volume;

        if (Instance.musicSlider != null)
            Instance.musicSlider.value = volume;
    }
}
