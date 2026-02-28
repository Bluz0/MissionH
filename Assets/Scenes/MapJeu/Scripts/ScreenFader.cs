using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using Cinemachine;
using UnityEngine;

/// <summary>
/// Gère un effet de fondu à l'écran (fade in / fade out) en utilisant un CanvasGroup.
/// Désactive temporairement le damping de la caméra pendant le fondu pour éviter
/// des mouvements brusques ou indésirables.
/// Fonctionne en singleton pour être accessible globalement.
/// </summary>
public class ScreenFader : MonoBehaviour
{
    /// <summary>
    /// Instance unique du ScreenFader.
    /// </summary>
    public static ScreenFader Instance;

    /// <summary>
    /// CanvasGroup utilisé pour contrôler la transparence du fondu.
    /// </summary>
    [SerializeField] CanvasGroup canvasGroup;

    /// <summary>
    /// Durée du fondu (en secondes).
    /// </summary>
    [SerializeField] float fadeDuration = 0.5f;

    /// <summary>
    /// Caméra Cinemachine utilisée pour ajuster le damping pendant le fondu.
    /// </summary>
    [SerializeField] CinemachineVirtualCamera vcam;

    /// <summary>
    /// Référence au composant FramingTransposer de Cinemachine.
    /// </summary>
    CinemachineFramingTransposer transposer;

    /// <summary>
    /// Valeurs originales du damping de la caméra.
    /// </summary>
    Vector3 originalDamping;

    /// <summary>
    /// Initialise le singleton, récupère le transposer et stocke les valeurs de damping.
    /// </summary>
    private void Awake()
    {
        if(Instance == null) Instance = this;
        else Destroy(gameObject);

        transposer = vcam.GetCinemachineComponent<CinemachineFramingTransposer>();
        originalDamping = new Vector3(transposer.m_XDamping, transposer.m_YDamping, transposer.m_ZDamping);
    }

    /// <summary>
    /// Effectue un fondu vers une transparence cible (0 = visible, 1 = noir complet).
    /// Utilise async/await pour un déroulement fluide sans bloquer Unity.
    /// </summary>
    async Task Fade(float targetTransparency)
    {
        float start = canvasGroup.alpha, t = 0;
        while(t < fadeDuration)
        {
            t += Time.deltaTime;
            canvasGroup.alpha = Mathf.Lerp(start, targetTransparency, t / fadeDuration);
            await Task.Yield();
        }
        canvasGroup.alpha = targetTransparency;
    }

    /// <summary>
    /// Effectue un fade-out (écran noir) puis désactive le damping de la caméra.
    /// </summary>
    public async Task FadeOut()
    {
        await Fade(1);
        SetDamping(Vector3.zero);
    }

    /// <summary>
    /// Effectue un fade-in (retour à l'écran visible) puis restaure le damping original.
    /// </summary>
    public async Task FadeIn()
    {
        await Fade(0);
        SetDamping(originalDamping);
    }

    /// <summary>
    /// Applique de nouvelles valeurs de damping au transposer Cinemachine.
    /// </summary>
    void SetDamping(Vector3 d)
    {
        if(!transposer) return;
        transposer.m_XDamping = d.x;
        transposer.m_YDamping = d.y;
        transposer.m_ZDamping = d.z;
    }
}
