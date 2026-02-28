using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Gère l'état de pause du jeu via une variable statique.
/// Permet à n'importe quel script de mettre le jeu en pause ou de le reprendre.
/// </summary>
public class PauseController : MonoBehaviour
{
    /// <summary>
    /// Indique si le jeu est actuellement en pause.
    /// Accessible en lecture uniquement.
    /// </summary>
    public static bool IsGamePaused { get; private set; } = false;

    /// <summary>
    /// Modifie l'état de pause du jeu.
    /// true = pause activée, false = pause désactivée.
    /// </summary>
    public static void SetPause(bool pause)
    {
        IsGamePaused = pause;
    }
}
