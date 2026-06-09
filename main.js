class ParishWebsite {
    constructor() {
        this.api = window.parishAPI;
        this.init();
    }

    async init() {
        this.setupNavigation();
        this.setupScrollAnimations();
        this.updateDateTime();
        await this.loadAllContent();
        this.setupProductSliders();
        this.setupOrderButtons();
        this.setupHamburgerMenu();
    }

    setupNavigation() {
        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Active state on scroll
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-menu a');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-card').forEach(card => {
            observer.observe(card);
        });
    }

    async updateDateTime() {
        const now = new Date();
        
        // Format de la date en français
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateStr = now.toLocaleDateString('fr-FR', options);
        
        // Mettre à jour l'affichage
        document.getElementById('currentDate').textContent = dateStr;
        document.getElementById('currentTime').textContent = 
            now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        // Obtenir et afficher le temps liturgique
        const liturgicalTime = await this.api.getLiturgicalTime();
        document.getElementById('liturgicalTime').textContent = liturgicalTime.fullDescription;

        // Mettre à jour l'année dans le footer
        document.getElementById('year').textContent = now.getFullYear();
    }

    async loadAllContent() {
        // Charger les lectures
        const readings = await this.api.getDailyReadings();
        this.displayReadings(readings);

        // Charger les saints
        const saints = await this.api.getSaintsOfDay();
        this.displaySaints(saints);

        // Charger le bréviaire
        const breviary = await this.api.getBreviary();
        this.displayBreviary(breviary);

        // Charger l'explication de l'évangile
        const explanation = await this.api.getGospelExplanation();
        this.displayGospelExplanation(explanation);

        // Charger les communiqués
        this.loadCommuniques();

        // Charger les produits du magasin
        this.loadProducts();
    }

    displayReadings(readings) {
        const container = document.getElementById('readings');
        if (!container) return;

        container.innerHTML = `
            <div class="reading-item">
                <h4><i class="fas fa-book"></i> Première Lecture</h4>
                <p>${readings.premiere || 'Non disponible'}</p>
            </div>
            <div class="reading-item">
                <h4><i class="fas fa-music"></i> Psaume</h4>
                <p>${readings.psaume || 'Non disponible'}</p>
            </div>
            ${readings.deuxieme ? `
            <div class="reading-item">
                <h4><i class="fas fa-book-open"></i> Deuxième Lecture</h4>
                <p>${readings.deuxieme}</p>
            </div>` : ''}
            <div class="reading-item highlight">
                <h4><i class="fas fa-cross"></i> Évangile</h4>
                <p>${readings.evangile || 'Non disponible'}</p>
            </div>
        `;
    }

    displaySaints(saints) {
        const container = document.getElementById('saintsCelebrated');
        if (!container) return;

        container.innerHTML = saints.map(saint => `
            <div class="saint-item">
                <h4><i class="fas fa-crown"></i> ${saint.nom}</h4>
                <p>${saint.description}</p>
            </div>
        `).join('');
    }

    displayBreviary(breviary) {
        const container = document.getElementById('breviary');
        if (!container) return;

        container.innerHTML = `
            <h4>${breviary.office}</h4>
            ${breviary.lectures.map(lecture => `
                <div class="breviary-item">
                    <p>${lecture}</p>
                </div>
            `).join('')}
        `;
    }

    displayGospelExplanation(explanation) {
        const container = document.getElementById('gospelExplanation');
        if (container) {
            container.innerHTML = `<p>${explanation}</p>`;
        }
    }

    loadCommuniques() {
        // Charger depuis localStorage
        const communiques = JSON.parse(localStorage.getItem('communiques') || '[]');
        const today = new Date().toISOString().split('T')[0];
        
        const todayCommunique = communiques.find(c => c.date === today);
        
        const container = document.getElementById('communique-content');
        if (!container) return;

        if (todayCommunique) {
            container.innerHTML = `
                <h3>${todayCommunique.title}</h3>
                <p>${todayCommunique.content}</p>
                <small>Publié le ${new Date(todayCommunique.date).toLocaleDateString('fr-FR')}</small>
            `;
        } else {
            container.innerHTML = `
                <p class="no-content">Aucun communiqué pour aujourd'hui.</p>
            `;
        }
    }

    loadProducts() {
        // Charger les produits depuis localStorage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        const container = document.getElementById('products-grid');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-store-alt"></i>
                    <p>Aucun article disponible pour le moment.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map((product, index) => `
            <div class="product-card" data-id="${index}">
                <div class="product-slider" id="slider-${index}">
                    ${(product.images || ['default-product.jpg']).map((img, imgIndex) => `
                        <img src="${img}" alt="${product.name}" class="${imgIndex === 0 ? 'active' : ''}">
                    `).join('')}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">${product.price} €</div>
                    <span class="product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? 'En stock' : 'Rupture de stock'}
                    </span>
                    <button class="btn-order" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> Commander
                    </button>
                </div>
            </div>
        `).join('');

        // Initialiser les sliders de produits
        this.setupProductSliders();
    }

    setupProductSliders() {
        document.querySelectorAll('.product-slider').forEach(slider => {
            const images = slider.querySelectorAll('img');
            if (images.length <= 1) return;

            let currentIndex = 0;

            setInterval(() => {
                images[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % images.length;
                images[currentIndex].classList.add('active');
            }, 10000); // Changement toutes les 10 secondes
        });
    }

    setupOrderButtons() {
        document.querySelectorAll('.btn-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.product-price').textContent;
                
                this.showOrderModal(productName, productPrice);
            });
        });
    }

    showOrderModal(productName, productPrice) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Commander un article</h2>
                <div class="order-details">
                    <p><strong>Article :</strong> ${productName}</p>
                    <p><strong>Prix :</strong> ${productPrice}</p>
                </div>
                <form id="orderForm">
                    <div class="form-group">
                        <label for="customerName">Votre nom</label>
                        <input type="text" id="customerName" required>
                    </div>
                    <div class="form-group">
                        <label for="customerPhone">Téléphone</label>
                        <input type="tel" id="customerPhone" required>
                    </div>
                    <div class="form-group">
                        <label for="customerEmail">Email</label>
                        <input type="email" id="customerEmail">
                    </div>
                    <div class="form-group">
                        <label for="quantity">Quantité</label>
                        <input type="number" id="quantity" min="1" value="1" required>
                    </div>
                    <button type="submit" class="btn-submit">
                        <i class="fas fa-paper-plane"></i> Envoyer la commande
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermer le modal
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        // Gérer la soumission du formulaire
        modal.querySelector('#orderForm').onsubmit = (e) => {
            e.preventDefault();
            alert('Commande envoyée avec succès ! Nous vous contacterons bientôt.');
            modal.remove();
        };
    }

    setupHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }
    }
}

// Initialiser le site quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.parishWebsite = new ParishWebsite();
});