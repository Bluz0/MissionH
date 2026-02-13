using System;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Gère une bibliothèque de groupes d'effets sonores et permet
/// de récupérer un clip audio aléatoire selon un nom donné.
/// </summary>
public class SoundEffectLibrary : MonoBehaviour
{
    /// <summary>
    /// Liste des groupes d'effets sonores définis dans l'inspecteur.
    /// Chaque groupe possède un nom et plusieurs AudioClips.
    /// </summary>
    [SerializeField] private SoundEffectGroup[] soundEffectGroups;

    /// <summary>
    /// Dictionnaire interne permettant d'accéder rapidement aux clips
    /// via leur nom de groupe.
    /// </summary>
    private Dictionary<string, List<AudioClip>> soundDictionary;

    /// <summary>
    /// Initialise le dictionnaire au démarrage du script.
    /// </summary>
    private void Awake()
    {
        InitializeDictionary();
    }

    /// <summary>
    /// Remplit le dictionnaire avec les groupes d'effets sonores.
    /// La clé est le nom du groupe, la valeur est la liste des clips.
    /// </summary>
    private void InitializeDictionary()
    {
        soundDictionary = new Dictionary<string, List<AudioClip>>();

        foreach (SoundEffectGroup soundEffectGroup in soundEffectGroups)
        {
            soundDictionary[soundEffectGroup.name] = soundEffectGroup.audioClips;
        }
    }

    /// <summary>
    /// Retourne un clip audio aléatoire appartenant au groupe correspondant au nom donné.
    /// Renvoie null si le groupe n'existe pas ou s'il ne contient aucun clip.
    /// </summary>
    public AudioClip GetRandomClip(string name)
    {
        if (soundDictionary.ContainsKey(name))
        {
            List<AudioClip> audioClips = soundDictionary[name];

            if (audioClips.Count > 0)
            {
                return audioClips[UnityEngine.Random.Range(0, audioClips.Count)];
            }
        }

        return null;
    }
}

/// <summary>
/// Représente un groupe d'effets sonores identifié par un nom
/// et contenant une liste de clips audio.
/// </summary>
[System.Serializable]
public struct SoundEffectGroup
{
    /// <summary>
    /// Nom du groupe d'effets sonores.
    /// </summary>
    public string name;

    /// <summary>
    /// Liste des clips audio associés à ce groupe.
    /// </summary>
    public List<AudioClip> audioClips;
}
