class AdminPanel {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.loadDashboard();
        this.setupCommuniqueForm();
        this.setupProductForm();
        this.loadCommuniquesList();
        this.loadProductsList();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.admin-nav a[data-section]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Désactiver tous les liens et sections
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
                
                // Activer le lien et la section sélectionnés
                link.classList.add('active');
                const sectionId = link.getAttribute('data-section');
                document.getElementById(sectionId).classList.add('active');
            });
        });
    }

    loadDashboard() {
        const communiques = JSON.parse(localStorage.getItem('communiques') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        // Mettre à jour les statistiques
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length >= 2) {
            statNumbers[0].textContent = communiques.length;
            statNumbers[1].textContent = products.length;
        }
    }

    setupCommuniqueForm() {
        const form = document.getElementById('communiqueForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const communique = {
                title: document.getElementById('communiqueTitle').value,
                content: document.getElementById('communiqueContent').value,
                date: document.getElementById('communiqueDate').value,
                createdAt: new Date().toISOString()
            };

            // Sauvegarder dans localStorage
            const communiques = JSON.parse(localStorage.getItem('communiques') || '[]');
            communiques.push(communique);
            localStorage.setItem('communiques', JSON.stringify(communiques));

            // Réinitialiser le formulaire
            form.reset();
            
            // Recharger la liste
            this.loadCommuniquesList();
            this.loadDashboard();
            
            // Notification
            this.showNotification('Communiqué publié avec succès !', 'success');
        });
    }

    setupProductForm() {
        const form = document.getElementById('productForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const product = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                stock: parseInt(document.getElementById('productStock').value),
                images: this.handleImageUpload(document.getElementById('productImages').files),
                createdAt: new Date().toISOString()
            };

            // Sauvegarder dans localStorage
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            products.push(product);
            localStorage.setItem('products', JSON.stringify(products));

            // Réinitialiser le formulaire
            form.reset();
            
            // Recharger la liste
            this.loadProductsList();
            this.loadDashboard();
            
            // Notification
            this.showNotification('Article ajouté avec succès !', 'success');
        });
    }

    handleImageUpload(files) {
        const imagePromises = [];
        
        for (let file of files) {
            const promise = new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(file);
            });
            imagePromises.push(promise);
        }
        
        // Pour la démonstration, retourner des URLs par défaut si pas d'images
        if (imagePromises.length === 0) {
            return ['https://via.placeholder.com/400x300?text=Article'];
        }
        
        return Promise.all(imagePromises);
    }

    loadCommuniquesList() {
        const communiques = JSON.parse(localStorage.getItem('communiques') || '[]');
        const container = document.getElementById('communiques-list');
        if (!container) return;

        if (communiques.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Aucun communiqué publié</p>
                </div>
            `;
            return;
        }

        container.innerHTML = communiques.map((communique, index) => `
            <div class="list-item">
                <div class="item-header">
                    <h4>${communique.title}</h4>
                    <span class="item-date">${new Date(communique.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <p>${communique.content.substring(0, 100)}...</p>
                <div class="item-actions">
                    <button onclick="adminPanel.deleteCommunique(${index})" class="btn-delete">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadProductsList() {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const container = document.getElementById('products-admin-list');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>Aucun article dans le magasin</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map((product, index) => `
            <div class="admin-product-card">
                <div class="admin-product-image">
                    <img src="${(product.images && product.images[0]) || 'https://via.placeholder.com/400x300?text=Article'}" alt="${product.name}">
                </div>
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="admin-product-details">
                        <span class="price">${product.price} €</span>
                        <span class="stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                            Stock: ${product.stock}
                        </span>
                    </div>
                    <div class="item-actions">
                        <button onclick="adminPanel.editProduct(${index})" class="btn-edit">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                        <button onclick="adminPanel.deleteProduct(${index})" class="btn-delete">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    deleteCommunique(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce communiqué ?')) {
            const communiques = JSON.parse(localStorage.getItem('communiques') || '[]');
            communiques.splice(index, 1);
            localStorage.setItem('communiques', JSON.stringify(communiques));
            this.loadCommuniquesList();
            this.loadDashboard();
            this.showNotification('Communiqué supprimé avec succès !', 'success');
        }
    }

    deleteProduct(index) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            const products = JSON.parse(localStorage.getItem('products') || '[]');
            products.splice(index, 1);
            localStorage.setItem('products', JSON.stringify(products));
            this.loadProductsList();
            this.loadDashboard();
            this.showNotification('Article supprimé avec succès !', 'success');
        }
    }

    editProduct(index) {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const product = products[index];
        
        // Remplir le formulaire avec les données du produit
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        
        // Faire défiler vers le formulaire
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
        
        // Supprimer l'ancien produit
        products.splice(index, 1);
        localStorage.setItem('products', JSON.stringify(products));
        this.loadProductsList();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialiser le panneau d'administration
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});