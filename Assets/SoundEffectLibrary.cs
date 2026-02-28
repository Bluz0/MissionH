using System;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Bibliothèque de sons permettant :
/// - de regrouper des effets sonores par catégories
/// - d'accéder rapidement à un son aléatoire d'un groupe donné
/// 
/// Le script construit un dictionnaire à partir des groupes définis dans l'inspecteur.
/// </summary>
public class SoundEffectLibrary : MonoBehaviour
{
    /// <summary>
    /// Liste des groupes de sons définis dans l'inspecteur.
    /// Chaque groupe contient un nom et plusieurs AudioClips.
    /// </summary>
    [SerializeField] private SoundEffectGroup[] soundEffectGroups;

    /// <summary>
    /// Dictionnaire interne permettant d'accéder aux sons via leur nom de groupe.
    /// </summary>
    private Dictionary<string, List<AudioClip>> soundDictionary;

    /// <summary>
    /// Initialise le dictionnaire au démarrage.
    /// </summary>
    private void Awake()
    {
        InitializeDictionary();
    }

    /// <summary>
    /// Construit le dictionnaire en associant chaque nom de groupe à sa liste de sons.
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
    /// Retourne un clip audio aléatoire appartenant au groupe spécifié.
    /// Renvoie null si le groupe n'existe pas ou est vide.
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
/// Structure représentant un groupe d'effets sonores :
/// - un nom unique
/// - une liste de clips audio.
/// </summary>
[System.Serializable]
public struct SoundEffectGroup
{
    public string name;
    public List<AudioClip> audioClips;
}
