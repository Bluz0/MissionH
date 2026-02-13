using UnityEngine;

/// <summary>
/// Contient toutes les données nécessaires pour gérer un dialogue d’un NPC.
/// Utilisé comme ScriptableObject pour séparer les données du code.
/// </summary>
[CreateAssetMenu(fileName = "NewNPCDialogue", menuName = "NPC Dialogue")]
public class NPCDialogue : ScriptableObject
{
    /// <summary>
    /// Nom du personnage affiché dans l’interface de dialogue.
    /// </summary>
    public string npcName;

    /// <summary>
    /// Portrait du NPC affiché pendant le dialogue.
    /// </summary>
    public Sprite npcPortrait;

    /// <summary>
    /// Liste des lignes de dialogue affichées dans l’ordre.
    /// </summary>
    public string[] dialogueLines;

    /// <summary>
    /// Indique pour chaque ligne si elle doit avancer automatiquement.
    /// </summary>
    public bool[] autoProgressLines;

    /// <summary>
    /// Indique quelles lignes mettent fin au dialogue.
    /// </summary>
    public bool[] endDialogueLines;

    /// <summary>
    /// Délai avant de passer automatiquement à la ligne suivante.
    /// </summary>
    public float autoProgressDelay = 1.5f;

    /// <summary>
    /// Vitesse d’affichage du texte (effet de "typing").
    /// </summary>
    public float typingSpeed = 0.05f;

    /// <summary>
    /// Son joué pendant la frappe du texte.
    /// </summary>
    public AudioClip voiceSound;

    /// <summary>
    /// Hauteur (pitch) du son de voix.
    /// </summary>
    public float voicePitch = 1f;

    /// <summary>
    /// Choix disponibles pour certaines lignes de dialogue.
    /// </summary>
    public DialogueChoice[] choices;
}

/// <summary>
/// Représente un ensemble de choix proposés au joueur
/// et les index des dialogues vers lesquels ils mènent.
/// </summary>
[System.Serializable]
public class DialogueChoice
{
    /// <summary>
    /// Index de la ligne de dialogue où les choix apparaissent.
    /// </summary>
    public int dialogueIndex;

    /// <summary>
    /// Texte des choix affichés au joueur.
    /// </summary>
    public string[] choices;

    /// <summary>
    /// Index des lignes de dialogue vers lesquelles chaque choix mène.
    /// </summary>
    public int[] nextDialogueIndexes;
}
