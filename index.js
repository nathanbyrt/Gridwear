document.addEventListener('DOMContentLoaded', () => {
    // === FONCTION D'ANIMATION DE TEXTE (ton code existant) ===
    function renderAnimatedText(section, delimiter) {
        if (section && section.dataset.text) {
            const originalText = section.dataset.text; 
            const lines = originalText.split(delimiter); 
            
            section.innerHTML = ''; 
            
            lines.forEach(line => {
                const lineDiv = document.createElement('div');
                lineDiv.classList.add('line');
                
                // Découper la ligne en mots
                const words = line.split(' ');
                
                words.forEach((word, wordIndex) => {
                    for (const char of word) {
                        const span = document.createElement('span');
                        span.classList.add('letter');
                        span.textContent = char;
                        lineDiv.appendChild(span);
                    }
                    
                    // Ajoute un espace après chaque mot sauf le dernier
                    if (wordIndex < words.length - 1) {
                        const space = document.createElement('span');
                        space.textContent = ' ';
                        lineDiv.appendChild(space);
                    }
                });
                
                section.appendChild(lineDiv);
            });
        }
    }

    // Application sur .section-gray avec "/" comme séparateur
    renderAnimatedText(document.querySelector('.section-gray'), '\\');

    // Application sur .section-yellow-pink avec "\retouralaligne" comme séparateur
    renderAnimatedText(document.querySelector('.section-yellow-pink'), '\\');


    // === SLIDER INFINI ROBUSTE SANS TROUS ===
    const container = document.querySelector('.slider-container');
    const track = document.querySelector('.slider-track');

    if (!container || !track) return;

    // Récupère la marge droite appliquée aux images (parseFloat)
    const firstImg = track.querySelector('.slider-image');
    const computed = firstImg ? getComputedStyle(firstImg) : null;
    const marginRight = computed ? parseFloat(computed.marginRight || 0) : 0;

    // Calcule la largeur totale actuelle des éléments présents
    function calcTrackWidth() {
        let w = 0;
        Array.from(track.children).forEach(child => {
            w += child.offsetWidth + marginRight;
        });
        return w;
    }

    // Duplique les images jusqu'à couvrir au moins containerWidth * 2 (sécurité)
    function populateTrack() {
        const containerWidth = container.clientWidth;
        // On vise une largeur >= containerWidth * 2 pour assurer continuité
        const targetWidth = containerWidth * 2;
        let currentWidth = calcTrackWidth();

        // Si la piste est trop courte, on clone séquentiellement les éléments originaux
        // On clone à partir d'une snapshot des éléments initiaux pour éviter clones infinis
        const originalItems = Array.from(track.children).slice(0); // snapshot

        let idx = 0;
        while (currentWidth < targetWidth) {
            const nodeToClone = originalItems[idx % originalItems.length];
            const clone = nodeToClone.cloneNode(true);
            track.appendChild(clone);
            currentWidth += clone.offsetWidth + marginRight;
            idx++;
            // safety break (au cas où)
            if (idx > originalItems.length * 50) break;
        }
    }

    // Initialise la piste pour éviter tout trou visible
    populateTrack();

    // Paramètres d'animation
    const speed = 0.2; // pixels par frame (ajuste selon besoin)
    let position = 0;

    function step() {
        position -= speed;

        const first = track.children[0];
        if (!first) {
            requestAnimationFrame(step);
            return;
        }

        const firstWidth = first.offsetWidth + marginRight;

        // Si la première image est complètement sortie à gauche
        if (-position >= firstWidth) {
            // Retirer la première et la replacer à la fin
            track.appendChild(first);
            // Ajuster la position pour compenser le déplacement de l'élément
            position += firstWidth;
        }

        // Appliquer la transformation
        track.style.transform = `translateX(${position}px)`;

        requestAnimationFrame(step);
    }

    // Lancement
    step();

});
