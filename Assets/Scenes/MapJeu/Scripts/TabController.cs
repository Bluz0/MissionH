using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Gère un système d’onglets :
/// - active la page correspondant à l’onglet sélectionné
/// - change la couleur des onglets pour indiquer celui qui est actif.
/// </summary>
public class TabController : MonoBehaviour
{
    /// <summary>
    /// Images représentant les onglets (utilisées pour changer la couleur).
    /// </summary>
    public Image[] tabImages;

    /// <summary>
    /// Pages associées à chaque onglet.
    /// </summary>
    public GameObject[] pages;

    /// <summary>
    /// Active automatiquement le premier onglet au démarrage.
    /// </summary>
    void Start()
    {
        ActivateTab(0);
    }

    /// <summary>
    /// Active l’onglet correspondant à l’index donné :
    /// - désactive toutes les pages
    /// - met tous les onglets en gris
    /// - active la page choisie
    /// - met l’onglet sélectionné en blanc.
    /// </summary>
    public void ActivateTab(int tabNo)
    {
        for(int i = 0; i < pages.Length; i++)
        {
            pages[i].SetActive(false);
            tabImages[i].color = Color.grey;
        }
        pages[tabNo].SetActive(true);
        tabImages[tabNo].color = Color.white;
    }
}
