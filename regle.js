const blocks = document.querySelectorAll('.regle-block');
const mots = document.querySelectorAll('.glossaire-mots span');
const definitions = document.querySelectorAll('.definition-zone p');

mots.forEach(mot => {
    mot.addEventListener('click', () => {
        const target = mot.dataset.mot;

        mots.forEach(m => m.classList.remove('active'));
        mot.classList.add('active');

        definitions.forEach(def => {
            def.classList.toggle('visible', def.dataset.mot === target);
        });
    });
});

document.querySelector("#glossaire .regle-content")
        .addEventListener("click", e => e.stopPropagation());

blocks.forEach(block => {
    block.addEventListener('click', () => {
        const content = block.querySelector('.regle-content');
        content.classList.toggle('active');
        block.classList.toggle('active');

        // Fermer les autres blocs
        blocks.forEach(otherBlock => {
            if (otherBlock !== block) {
                otherBlock.querySelector('.regle-content').classList.remove('active');
                otherBlock.classList.remove('active');
            }
        });
    });
});

// --- LOGIQUE PANIER GLOBALE ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartModal = document.getElementById('cart-modal');
const deliveryModal = document.getElementById('delivery-modal');
const paymentModal = document.getElementById('payment-modal');
const confirmationModal = document.getElementById('confirmation-modal'); // AJOUTÉ

 // FONCTION POUR SAUVEGARDER LE PANIER ENTRE LES PAGES
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// NOUVELLE FONCTION POUR TOUT FERMER
function closeAllModals() {
    if (cartModal) cartModal.style.display = 'none';
    if (deliveryModal) deliveryModal.style.display = 'none';
    if (paymentModal) paymentModal.style.display = 'none';
    if (confirmationModal) confirmationModal.style.display = 'none';

    clearPaymentFields();
    clearDeliveryFields();
}

// FONCTION POUR METTRE A JOUR LES ARTICLES DANS LE PANIER
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    // Supposons que l'icône du panier a un badge #cart-count
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

//FONCTION POUR AJOUTER UN ARTICLE DANS LE PANIER
function addToCart(article, couleur, taille = "M") {
    const existingItem = cart.find(item => item.id === article.id && item.couleur === couleur && item.taille === taille);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: article.id,
            nom: article.nom,
            prix: parseFloat(article.prix),
            img: article.img,
            couleur: couleur,
            taille: taille,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    alert(`"${article.nom} (${couleur}, ${taille})" a été ajouté au panier !`);
    
    // Fermer le modal après ajout
    modal.style.display = 'none';
}

// FONCTION POUR METTRE A JOUR LES CHAMPS DE PAIEMENT
function updatePaymentFields(method) {
    const cbFields = document.getElementById('cb-fields');
    const paypalFields = document.getElementById('paypal-fields');

    // Champs CB (Numéro, Date, CVC)
    const cbInputs = cbFields ? cbFields.querySelectorAll('input') : [];

    // Champ PayPal (Email)
    const paypalEmailInput = document.getElementById('paypal-email');

    // Logique pour la CB
    if (cbFields) cbFields.style.display = (method === 'cb') ? 'block' : 'none';
    cbInputs.forEach(input => {
        if (method === 'cb') {
            input.setAttribute('required', 'required');
        } else {
            input.removeAttribute('required');
        }
    });

    // Logique pour PayPal
    if (paypalFields) paypalFields.style.display = (method === 'paypal') ? 'block' : 'none';
    if (paypalEmailInput) {
        if (method === 'paypal') {
            paypalEmailInput.setAttribute('required', 'required');
        } else {
            paypalEmailInput.removeAttribute('required');
        }
    }
}

// --- FONCTIONS AFFICHAGE PANIER ---
function calculateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
    return total.toFixed(2);
}

// FONCTION POUR AFFICHER LE PANIER
function displayCart() {
    const container = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearBtn = document.getElementById('clear-cart-btn');
    
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart-message">Votre panier est vide. Ajoutez quelques articles !</p>';
        checkoutBtn.disabled = true;
        clearBtn.disabled = true;
        cartTotalElement.textContent = '0.00€';
        return;
    }

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <img src="${item.img}" alt="${item.nom}" class="cart-item-img">
            <div class="item-details">
                <h4>${item.nom}</h4>
                <p>Couleur : ${item.couleur} / Taille : ${item.taille}</p>
                <p>Quantité : 
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.itemId}" class="item-quantity-input">
                </p>
            </div>
            <div class="item-price-actions">
                <p class="item-price">${(item.prix * item.quantity).toFixed(2)}€</p>
                <button data-id="${item.itemId}" class="remove-item-btn">&times;</button>
            </div>
        `;
        container.appendChild(itemElement);
    });

    const total = calculateTotal();
    cartTotalElement.textContent = `${total}€`;
    checkoutBtn.disabled = false;
    clearBtn.disabled = false;

    // Ajouter les écouteurs pour la suppression et la mise à jour de quantité
    container.querySelectorAll('.remove-item-btn').forEach(button => {
        button.addEventListener('click', removeItem);
    });
    container.querySelectorAll('.item-quantity-input').forEach(input => {
        input.addEventListener('change', updateQuantity);
    });
}

// --- FONCTIONS ACTIONS PANIER ---
function removeItem(e) {
    const itemIdToRemove = e.target.dataset.id;
    cart = cart.filter(item => item.itemId !== itemIdToRemove);
    saveCart();
    updateCartCount();
    displayCart();
}

// FONCTION POUR METTRE A JOUR LA QUANTITE DES ARTICLES DANS LE PANIER
function updateQuantity(e) {
    const itemIdToUpdate = e.target.dataset.id;
    const newQuantity = parseInt(e.target.value);

    if (newQuantity < 1) {
        e.target.value = 1; 
        return; 
    }

    const itemIndex = cart.findIndex(item => item.itemId === itemIdToUpdate);
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        saveCart();
        updateCartCount();
        displayCart(); 
    }
}

// FONCTION POUR VIDER LE PANIER
function clearCart() {
    if (confirm("Êtes-vous sûr de vouloir vider complètement votre panier ?")) {
        cart = [];
        saveCart();
        updateCartCount();
        displayCart();
        alert("Votre panier a été vidé.");
        cartModal.style.display = 'none';
    }
}

// FONCTION POUR CHANGER DE METHODE DE PAIEMENT
function clearPaymentFields() {
    const cardNumber = document.getElementById('card-number');
    const expiryDate = document.getElementById('expiry-date');
    const cvc = document.getElementById('cvc');
    const paypalEmail = document.getElementById('paypal-email');
    
    if (cardNumber) cardNumber.value = '';
    if (expiryDate) expiryDate.value = '';
    if (cvc) cvc.value = '';
    if (paypalEmail) paypalEmail.value = '';
    
    // Réinitialiser la méthode de paiement sur CB par défaut 
    const paymentMethod = document.getElementById('payment-method');
    if (paymentMethod) paymentMethod.value = 'cb';
}

// FONCTION POUR VIDER LES CHAMPS D'INFORMATION
function clearDeliveryFields() {
    // --- CHAMPS DE LIVRAISON ---
    const deliveryName = document.getElementById('delivery-name');
    const deliveryEmail = document.getElementById('delivery-email');
    const deliveryPhone = document.getElementById('delivery-phone');
    const deliveryAddress = document.getElementById('delivery-address');
    const deliveryCity = document.getElementById('delivery-city');
    const deliveryZip = document.getElementById('delivery-zip');
    
    if (deliveryName) deliveryName.value = '';
    if (deliveryEmail) deliveryEmail.value = '';
    if (deliveryPhone) deliveryPhone.value = '';
    if (deliveryAddress) deliveryAddress.value = '';
    if (deliveryCity) deliveryCity.value = '';
    if (deliveryZip) deliveryZip.value = '';
    
    // Le champ pays (country) doit être inclus
    const deliveryCountry = document.getElementById('delivery-country');
    if (deliveryCountry) deliveryCountry.value = ''; 
}

// --- ÉVÉNEMENTS GLOBAUX MODALES ---

// Ouvrir le panier
document.addEventListener('DOMContentLoaded', () => {
    const openCartBtn = document.getElementById('open-cart-modal');
    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            displayCart();
            cartModal.style.display = 'flex';
        });
    }
    const initialMethod = document.getElementById('payment-method')?.value || 'cb';
    updatePaymentFields(initialMethod);
});

// Fermer les modales
document.getElementById('close-cart-modal')?.addEventListener('click', () => cartModal.style.display = 'none');
document.getElementById('close-delivery-modal')?.addEventListener('click', () => deliveryModal.style.display = 'none');
document.getElementById('close-payment-modal')?.addEventListener('click', () => paymentModal.style.display = 'none');
document.getElementById('close-confirmation-modal')?.addEventListener('click', () => confirmationModal.style.display = 'none'); // AJOUTÉ

// Clic en dehors des modales
document.addEventListener('click', (e) => {
    if (e.target.id === 'cart-modal') cartModal.style.display = 'none';
    if (e.target.id === 'delivery-modal') deliveryModal.style.display = 'none';
    if (e.target.id === 'payment-modal') paymentModal.style.display = 'none';
    if (e.target.id === 'confirmation-modal') closeAllModals(); // AJOUTÉ
});

// Vider le panier
document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);

// --- PROCESSUS DE COMMANDE ---

// 1. Démarrer la commande (Panier -> Livraison)
document.getElementById('checkout-btn')?.addEventListener('click', () => {
    cartModal.style.display = 'none';
    deliveryModal.style.display = 'flex';
});

// 2. Livraison -> Paiement
document.getElementById('delivery-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    // Les données de livraison peuvent être utilisées/stockées ici si besoin

    deliveryModal.style.display = 'none';
    
    document.getElementById('final-total').textContent = `${calculateTotal()}€`;
    paymentModal.style.display = 'flex';
});

// 3. Gestion de l'affichage des champs de paiement
document.getElementById('payment-method')?.addEventListener('change', (e) => {
    const method = e.target.value;
    const cbFields = document.getElementById('cb-fields');
    const paypalFields = document.getElementById('paypal-fields');

    if (cbFields) cbFields.style.display = (method === 'cb') ? 'block' : 'none';
    if (paypalFields) paypalFields.style.display = (method === 'paypal') ? 'block' : 'none';
});


// 1. Démarrer la commande (Panier -> Livraison)
document.getElementById('checkout-btn')?.addEventListener('click', () => {
    cartModal.style.display = 'none'; // Ferme le panier
    deliveryModal.style.display = 'flex'; // Ouvre la livraison
});

// 2. Livraison -> Paiement
document.getElementById('delivery-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Récupération des données (peut être stocké si nécessaire)
    const deliveryInfo = {
        name: document.getElementById('delivery-name').value,
        email: document.getElementById('delivery-email').value,
        phone: document.getElementById('delivery-phone').value,
        address: document.getElementById('delivery-address').value,
        city: document.getElementById('delivery-city').value,
        zip: document.getElementById('delivery-zip').value,
        country: document.getElementById('delivery-country').value, // NOUVEAU CHAMP PAYS
    };
    
    // Ferme la modale de livraison
    deliveryModal.style.display = 'none';
    
    // Ouvre la modale de paiement et met à jour le total
    document.getElementById('final-total').textContent = `${calculateTotal()}€`;
    paymentModal.style.display = 'flex';
});

// 3. Gestion de l'affichage des champs de paiement (reste identique)
document.getElementById('payment-method')?.addEventListener('change', (e) => {
    updatePaymentFields(e.target.value);

    const method = e.target.value;
    const cbFields = document.getElementById('cb-fields');
    const paypalFields = document.getElementById('paypal-fields');

    // Champs CB (Numéro, Date, CVC)
    const cbInputs = cbFields ? cbFields.querySelectorAll('input') : [];
    
    // Champ PayPal (Email)
    const paypalEmailInput = document.getElementById('paypal-email');

    // --- 1. Affichage et Gestion de 'required' ---
    
    // Logique pour la CB
    if (cbFields) cbFields.style.display = (method === 'cb') ? 'block' : 'none';
    cbInputs.forEach(input => {
        // Active 'required' uniquement si la CB est sélectionnée
        if (method === 'cb') {
            input.setAttribute('required', 'required');
        } else {
            input.removeAttribute('required');
        }
    });

    // Logique pour PayPal
    if (paypalFields) paypalFields.style.display = (method === 'paypal') ? 'block' : 'none';
    if (paypalEmailInput) {
        // Active 'required' uniquement si PayPal est sélectionné
        if (method === 'paypal') {
            paypalEmailInput.setAttribute('required', 'required');
        } else {
            paypalEmailInput.removeAttribute('required');
        }
    }
});

// 4. Finalisation de la commande (Paiement -> Validation) (reste identique)
document.getElementById('payment-form')?.addEventListener('submit', (e) => {
    // 1. Récupérer le montant final AVANT de vider le panier
    const paymentForm = document.getElementById('payment-form');
    
    // Cette étape s'assure que la validation HTML s'est bien exécutée
    // pour tous les champs requis et visibles.
    if (!paymentForm.checkValidity()) {
        // Le navigateur affiche déjà le message d'erreur natif.
        return; 
    }
    
    // Si nous arrivons ici, soit :
    // 1. C'est CB, et la validation native HTML a réussi.
    // 2. C'est PayPal, et la validation JS a réussi.

    // On empêche la soumission classique pour pouvoir effectuer les étapes de confirmation.
    e.preventDefault(); 

    // --- PROCESSUS DE VALIDATION ET AFFICHAGE SI TOUT EST VALIDE ---

    // 1. Récupérer le montant final AVANT de vider le panier
    const finalAmount = calculateTotal();
    
    // 2. Vider le panier
    cart = [];
    saveCart();
    updateCartCount();

    // 3. Fermer la modale de paiement
    paymentModal.style.display = 'none';

    clearPaymentFields();

    // 4. Afficher la modale de confirmation INSTANTANÉMENT
    if (confirmationModal) {
        document.getElementById('final-paid-amount').textContent = `${finalAmount}€`;
        confirmationModal.style.display = 'flex';
    }

    // 5. FERMER TOUTES LES MODALES APRÈS UN DÉLAI DE 3 SECONDES (3000 ms)
    setTimeout(() => {
        closeAllModals(); 
    }, 3000);
});

// 5. Paiement -> Retour à la Livraison (NOUVEAU)
document.getElementById('back-to-delivery-btn')?.addEventListener('click', () => {
    paymentModal.style.display = 'none'; // Ferme le paiement
    deliveryModal.style.display = 'flex'; // Retourne à la livraison
});

document.addEventListener('DOMContentLoaded', () => {
    const expiryDateInput = document.getElementById('expiry-date');

    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Supprime tous les caractères non numériques

            // Limite la saisie aux 4 chiffres maximum
            if (value.length > 4) {
                value = value.slice(0, 4);
            }
            
            // Ajoute la barre '/' après le deuxième chiffre
            if (value.length >= 3) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }

            e.target.value = value;
        });
    }
});

// ====== VARIABLES DOM ======
const articlesGrid = document.querySelector('.articles-grid');
const paginationContainer = document.querySelector('.pagination');
const articlesPerPage = 12;
let currentPage = 1;
let currentSort = null;
let currentFilter = null;

const sortButton = document.getElementById("sort-button");
const sortList = document.getElementById("sort-list");
const filterButton = document.getElementById("filter-button");
const filterList = document.getElementById("filter-list");

// Elements du modal
const modal = document.getElementById('article-modal');
const modalImg = document.getElementById('modal-img');
const modalClose = document.querySelector('.modal-close');
//const addToCart = document.getElementById('add-to-cart');
//const addToCartBtn = document.getElementById('add-to-cart');

// ====== AFFICHAGE ARTICLES ======
function displayArticles(page = 1) {
    let filteredArticles = articlesDataAccessoire.slice();

    if (currentFilter === 'homme') filteredArticles = filteredArticles.filter(a => a.homme);
    if (currentFilter === 'femme') filteredArticles = filteredArticles.filter(a => a.femme);
    if (currentFilter === 'mixte') filteredArticles = filteredArticles.filter(a => a.mixte);

    if (currentSort === 'price-asc') filteredArticles.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix));
    else if (currentSort === 'price-desc') filteredArticles.sort((a, b) => parseFloat(b.prix) - parseFloat(a.prix));


    const startIndex = (page - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const articlesToDisplay = filteredArticles.slice(startIndex, endIndex);

    articlesGrid.innerHTML = '';
    articlesToDisplay.forEach(article => {
        const card = document.createElement('div');
        card.classList.add('article-card');
        card.innerHTML = `
            <img src="${article.img}" alt="${article.nom}">
            <div class="article-info">
                <div class="left-info">
                    <h3>${article.nom}</h3>
                    <select class="article-couleur">${article.couleurs.map(c => `<option>${c}</option>`).join('')}</select>
                    <p>${article.prix}€</p>
                </div>
                <div class="right-info"><span class="heart">♡</span></div>
            </div>
            <button class="view-button">Voir l'article</button>
        `;
        articlesGrid.appendChild(card);

        // Passer l'article complet au clic sur Voir l'article
        const viewBtn = card.querySelector('.view-button');
        viewBtn.addEventListener('click', () => openModal(article));
    });
    setupPagination(filteredArticles.length);
}

// ====== PAGINATION ======
function setupPagination(totalItems) {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / articlesPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.classList.add('page-btn');
        if (i === currentPage) btn.classList.add('active');

        btn.addEventListener('click', () => {
            currentPage = i;
            displayArticles(currentPage);
        });

        paginationContainer.appendChild(btn);
    }
}

// ====== MODAL ======
function setupModalThumbnails(article) {
    const thumbContainer = document.getElementById("modal-thumbnails");
    const restoreBtn = document.getElementById("restore-image");
    Array.from(thumbContainer.querySelectorAll("img")).forEach(img => img.remove());

    const thumbImages = [article.img, article.img2, article.img3].filter(Boolean).slice(0, 3);
    thumbImages.forEach(src => {
        const thumb = document.createElement("img");
        thumb.src = src;
        thumb.addEventListener("click", () => {
            modalImg.src = src;
            restoreBtn.style.display = (src === article.img) ? "none" : "inline-block";
        });
        thumbContainer.insertBefore(thumb, restoreBtn);
    });

    restoreBtn.onclick = () => {
        modalImg.src = article.img;
        restoreBtn.style.display = "none";
    };
}

function openModal(article) {
    modal.style.display = 'flex';
    modalImg.src = article.img;
    setupModalThumbnails(article);

    const infoContainer = document.getElementById('modal-info');

    infoContainer.innerHTML = `
        <h3>${article.nom}</h3>
        <p>Prix : ${article.prix}€</p>
        <p>Couleurs : 
            <select id="modal-couleur">
                ${article.couleurs.map(c => `<option>${c}</option>`).join('')}
            </select>
        </p>
        <p>Taille : 
            <select id="modal-taille">
                <option value="S">S</option>
                <option value="M" selected>M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
            </select>
        </p>
    `;

    // NOUVEL ÉVÉNEMENT POUR L'AJOUT AU PANIER DANS LE MODAL
    document.getElementById('add-to-cart').onclick = () => {
        const couleur = document.getElementById('modal-couleur').value;
        const taille = document.getElementById('modal-taille').value;
        addToCart(article, couleur, taille);
    };
}

// ====== GESTION DROPDOWNS ======
sortButton.addEventListener("click", e => {
    e.stopPropagation();
    sortList.style.display = (sortList.style.display === "block") ? "none" : "block";
    filterList.style.display = "none";
});

sortList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
        currentSort = li.dataset.value;
        currentPage = 1;
        sortList.style.display = "none";
        displayArticles(currentPage);
    });
});

filterButton.addEventListener("click", e => {
    e.stopPropagation();
    filterList.style.display = (filterList.style.display === "block") ? "none" : "block";
    sortList.style.display = "none";
});

filterList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
        currentFilter = li.dataset.filter;
        currentPage = 1;
        filterList.style.display = "none";
        displayArticles(currentPage);
    });
});

document.addEventListener("click", () => {
    sortList.style.display = "none";
    filterList.style.display = "none";
});

modalClose.addEventListener('click', e => {
    e.stopPropagation();
    modal.style.display = 'none';
});

modal.addEventListener('click', e => {
    if (!e.target.closest('.modal-content')) modal.style.display = 'none';
});

// ====== INIT ======
displayArticles(currentPage);
updateCartCount();
