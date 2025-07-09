document.addEventListener('DOMContentLoaded', () => {
    // Cart state management
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Dark mode functionality
    const darkModeToggle = document.querySelector('#dark-mode-toggle');
    const body = document.body;
    
    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });

    // Cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.querySelector('.subtotal');
    const taxElement = document.querySelector('.tax');
    const totalElement = document.querySelector('.total');
    const checkoutButton = document.querySelector('.proceed-to-checkout');
    const checkoutModal = document.querySelector('#checkout-modal');
    const closeModal = document.querySelector('.close-modal');
    const checkoutForm = document.querySelector('#checkout-form');
    const successModal = document.querySelector('#success-modal');
    const continueShopping = document.querySelector('.continue-shopping');

    // Product data
    const products = [
        { id: 1, name: 'Moti Choor Ladoo', price: 750, category: 'Premium Sweets' },
        { id: 2, name: 'Kesar Malai Penda', price: 400, category: 'Royal Sweets' },
        { id: 3, name: 'Thabdi Peda', price: 350, category: 'Gourmet Sweets' },
        { id: 4, name: 'Kaju Katri', price: 400, category: 'Diamond Collection' },
        { id: 5, name: 'Kesar Kaju Katri', price: 450, category: 'Diamond Collection' },
        { id: 6, name: 'Kathiyawadi Penda', price: 350, category: 'Heritage Sweets' },
        { id: 7, name: 'Rajbhog Shrikhand', price: 400, category: 'Royal Dessert' },
        { id: 8, name: 'Eliachi Shrikhand', price: 350, category: 'Aromatic Dessert' },
        { id: 9, name: 'Kaju Badam Shrikhand', price: 400, category: 'Nut Delight' },
        { id: 10, name: 'Shreeji\'s Buttermilk', price: 350, category: 'Digestive Elixir' },
        { id: 11, name: 'Cold Coco', price: 350, category: 'Chocolate Indulgence' },
        { id: 12, name: 'Lassi', price: 350, category: 'Classic Refreshment' }
    ];

    // Add to cart functionality
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            const product = products.find(p => p.id === productId);
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            alert(`${product.name} added to cart!`);
        });
    });

    // Update cart display
    function updateCartDisplay() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h4 class="font-bold">${item.name}</h4>
                        <p class="text-gray-600">${item.category}</p>
                        <p>₹${item.price} × ${item.quantity}</p>
                    </div>
                    <div>
                        <button class="remove-item" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        const delivery = 50;
        const tax = subtotal * 0.05;
        const total = subtotal + delivery + tax;

        if (subtotalElement) subtotalElement.textContent = `₹${subtotal}`;
        if (taxElement) taxElement.textContent = `₹${tax.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;

        // Add remove item functionality
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                cart = cart.filter(item => item.id !== productId);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            });
        });
    }

    // Checkout modal functionality
    if (checkoutButton && checkoutModal) {
        checkoutButton.addEventListener('click', () => {
            checkoutModal.style.display = 'block';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            checkoutModal.style.display = 'none';
        });
    }

    // Handle checkout form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic form validation
            const formData = new FormData(checkoutForm);
            const requiredFields = ['first-name', 'last-name', 'email', 'phone', 'address', 'payment-method'];
            
            let isValid = true;
            requiredFields.forEach(field => {
                if (!formData.get(field)) {
                    isValid = false;
                    alert(`Please fill in ${field.replace('-', ' ')}`);
                }
            });

            if (isValid) {
                checkoutModal.style.display = 'none';
                successModal.style.display = 'block';
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            }
        });
    }

    // Continue shopping
    if (continueShopping) {
        continueShopping.addEventListener('click', () => {
            successModal.style.display = 'none';
            window.location.href = 'index.html';
        });
    }

    // Initial cart display
    updateCartDisplay();

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
});