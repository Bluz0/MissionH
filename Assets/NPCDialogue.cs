using UnityEngine;

/// <summary>
/// ScriptableObject contenant toutes les données d’un dialogue de PNJ :
/// - nom du PNJ
/// - portrait
/// - lignes de dialogue
/// - configuration de l’auto‑progression
/// - choix possibles
/// 
/// Ce fichier est utilisé par le système de dialogue pour afficher
/// et enchaîner les lignes, ainsi que pour gérer les embranchements.
/// </summary>
[CreateAssetMenu(fileName = "NewNPCDialogue", menuName = "NPC Dialogue")]
public class NPCDialogue : ScriptableObject
{
    /// <summary>
    /// Nom du PNJ affiché dans l’interface.
    /// </summary>
    public string npcName;

    /// <summary>
    /// Portrait du PNJ affiché dans l’UI.
    /// </summary>
    public Sprite npcPortrait;

    /// <summary>
    /// Lignes de dialogue affichées dans l’ordre.
    /// </summary>
    public string[] dialogueLines;

    /// <summary>
    /// Indique pour chaque ligne si elle doit avancer automatiquement.
    /// </summary>
    public bool[] autoProgressLines;

    /// <summary>
    /// Indique pour chaque ligne si le dialogue doit se terminer après celle‑ci.
    /// </summary>
    public bool[] endDialogueLines;

    /// <summary>
    /// Délai avant de passer automatiquement à la ligne suivante.
    /// </summary>
    public float autoProgressDelay = 1.5f;

    /// <summary>
    /// Vitesse d’écriture du texte (effet machine à écrire).
    /// </summary>
    public float typingSpeed = 0.05f;

    /// <summary>
    /// Son joué à chaque caractère (optionnel).
    /// </summary>
    public AudioClip voiceSound;

    /// <summary>
    /// Pitch appliqué au son de voix.
    /// </summary>
    public float voicePitch = 1f;

    /// <summary>
    /// Liste des choix possibles pour certaines lignes.
    /// </summary>
    public DialogueChoice[] choices;

    /// <summary>
    /// Test récapitulatif en fin de dialogue.
    /// </summary>
    public string recapText;

    /// <summary> Indique pour chaque choix si c'est la bonne réponse (pour les nœuds "player"). </summary>
    public bool[] isCorrectFlags;

    /// <summary>
    /// Indique pour chaque choix si c'est la bonne réponse (pour les nœuds "player").
    /// </summary>
    public int[] nextLineTarget;
}

/// <summary>
/// Représente un ensemble de choix pour une ligne donnée :
/// - dialogueIndex : index de la ligne où les choix apparaissent
/// - choices : texte des choix affichés
/// - nextDialogueIndexes : index des lignes vers lesquelles chaque choix mène.
/// </summary>
[System.Serializable]
public class DialogueChoice
{
    /// <summary>
    /// Index de la ligne où les choix apparaissent.
    /// </summary>
    public int dialogueIndex;

    /// <summary>
    /// Texte des choix affichés.
    /// </summary>
    public string[] choices;
    
    /// <summary>
    /// Index des lignes vers lesquelles chaque choix mène.
    /// </summary>
    public int[] nextDialogueIndexes;

    /// <summary>
    /// Indique pour chaque choix si c'est la bonne réponse (pour les nœuds "player").
    /// </summary>
    public bool[] choicesCorrectness;
}
