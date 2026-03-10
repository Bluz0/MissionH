using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Gère un système d’onglets :
/// - active la page correspondant à l’onglet sélectionné
/// - change la couleur des onglets pour indiquer celui qui est actif
/// - déplace les onglets inactifs vers Y = -110
/// - place les onglets inactifs derrière le panel des pages.
/// </summary>
public class TabController : MonoBehaviour
{
    /// <summary>
    /// Images représentant les onglets (pour changer la couleur).
    /// </summary>
    public Image[] tabImages;

    /// <summary>
    /// Pages associées à chaque onglet.
    /// </summary>
    public GameObject[] pages;

    /// <summary>
    /// Les boutons eux-mêmes (RectTransform) pour changer leur position.
    /// </summary>
    public RectTransform[] tabButtons;

    /// <summary>
    /// Panel contenant les pages (sert pour l'ordre d'affichage).
    /// </summary>
    public RectTransform pagesPanel;

    /// <summary>
    /// Position Y de l’onglet actif.
    /// </summary>
    public float activeY = 0f;

    /// <summary>
    /// Position Y des onglets inactifs.
    /// </summary>
    public float inactiveY = -110f;

    void Start()
    {
        ActivateTab(0);
    }

    /// <summary>
    /// Active l’onglet correspondant à l’index donné :
    /// - désactive toutes les pages
    /// - met tous les onglets en gris
    /// - déplace les onglets inactifs vers Y = -110
    /// - place les onglets inactifs derrière le panel pages
    /// - active la page choisie
    /// - met l’onglet sélectionné en blanc et le remet devant.
    /// </summary>
    public void ActivateTab(int tabNo)
    {
        for (int i = 0; i < pages.Length; i++)
        {
            // Désactive toutes les pages
            pages[i].SetActive(false);

            // Onglets inactifs → gris + descendent + derrière
            tabImages[i].color = Color.grey;

            tabButtons[i].anchoredPosition = new Vector2(
                tabButtons[i].anchoredPosition.x,
                inactiveY
            );

            tabButtons[i].SetSiblingIndex(0); // Derrière
        }

        // Active la page choisie
        pages[tabNo].SetActive(true);

        // Onglet actif → blanc + remonte + devant
        tabImages[tabNo].color = Color.white;

        tabButtons[tabNo].anchoredPosition = new Vector2(
            tabButtons[tabNo].anchoredPosition.x,
            activeY
        );

        tabButtons[tabNo].SetSiblingIndex(pagesPanel.GetSiblingIndex() + 1);
    }
}
