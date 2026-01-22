using UnityEngine;
using UnityEngine.SceneManagement;

/*Classe qui permet d'importer les avatars dans une galerie et de naviguer entre eux*/
/* Pour que ca marche, clique sur l'objet AvatarGallery puis glisse ton perso */
public class AvatarGallery : MonoBehaviour
{
    
    public GameObject[] avatarsMenu; 
    private int currentIndex = 0;

    void Start()
    {
        // On s'assure que seul le premier est visible au début
        ActualiserVisuels();
        Load();
    }

    public void Suivant()
    {
        currentIndex++;
        if (currentIndex >= avatarsMenu.Length) currentIndex = 0;
        ActualiserVisuels();
        Save();
    }

    public void Precedent()
    {
        currentIndex--;
        if (currentIndex < 0) currentIndex = avatarsMenu.Length - 1;
        ActualiserVisuels();
    }

    void ActualiserVisuels()
    {
        // On cache tout, puis on affiche seulement celui de l'index actuel
        for (int i = 0; i < avatarsMenu.Length; i++)
        {
            avatarsMenu[i].SetActive(i == currentIndex);
        }
    }

    public void ConfirmerEtJouer()
    {
        SelectionManager.SelectedAvatarIndex = currentIndex;
        SceneManager.LoadScene("map_jeu");
    }

    private void Load()
    {
        currentIndex = PlayerPrefs.GetInt("SelectedAvatarIndex", 0);
        ActualiserVisuels();
    }

    private void Save()
    {
     PlayerPrefs.SetInt("SelectedAvatarIndex", currentIndex);   
    }
}