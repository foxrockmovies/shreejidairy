// Enhanced Shopping Cart System for Shreeji Dairy & Sweets
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
            themeToggle.textContent = document.body.dataset.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
            localStorage.setItem('theme', document.body.dataset.theme);
        });

        // Load theme preference from localStorage
        if (localStorage.getItem('theme')) {
            document.body.dataset.theme = localStorage.getItem('theme');
            themeToggle.textContent = document.body.dataset.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
    }

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Cart State Management
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCounter = document.querySelector('.cart-counter');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryElement = document.getElementById('delivery');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkout-modal');
    const modalClose = document.getElementById('modal-close');
    const cancelCheckout = document.getElementById('cancel-checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const successModal = document.getElementById('success-modal');
    const successClose = document.getElementById('success-close');

    // Form Fields
    const firstName = document.getElementById('first-name');
    const lastName = document.getElementById('last-name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const payment = document.getElementById('payment');

    // Initialize the page
    renderCartItems();
    setupEventListeners();

    // Main Functions
    function renderCartItems() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any delicious sweets to your cart yet. Browse our collection and find something sweet!</p>
                    <a href="index.html" class="continue-shopping">Continue Shopping</a>
                </div>
            `;
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        if (checkoutBtn) checkoutBtn.disabled = false;

        cartItems.forEach((item, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/200'}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <h3 class="cart-item-title">${item.name}</h3>
                        <span class="cart-item-price">${item.price}</span>
                    </div>
                    <p class="cart-item-description">${item.description || 'Premium Indian sweet crafted with care'}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                        </div>
                        <button class="remove-item" data-index="${index}">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });

        updateCartSummary();
    }

    function updateCartSummary() {
        const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
        const tax = subtotal * 0.05;
        const delivery = subtotal > 0 ? 50 : 0;
        const total = subtotal + tax + delivery;

        if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        if (taxElement) taxElement.textContent = `₹${tax.toFixed(2)}`;
        if (deliveryElement) deliveryElement.textContent = `₹${delivery.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;

        // Update cart counter
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        if (cartCounter) cartCounter.setAttribute('data-count', totalItems);
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }

    function setupEventListeners() {
        // Quantity control event delegation
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target.closest('.quantity-btn');
                if (!target) return;
                
                const index = target.getAttribute('data-index');
                if (target.classList.contains('plus')) {
                    increaseQuantity(index);
                } else if (target.classList.contains('minus')) {
                    decreaseQuantity(index);
                }
            });

            // Remove item event delegation
            cartItemsContainer.addEventListener('click', (e) => {
                const target = e.target.closest('.remove-item');
                if (!target) return;
                
                const index = target.getAttribute('data-index');
                removeItem(index);
            });
        }

        // Checkout modal
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (checkoutModal) {
                    checkoutModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }

        // Modal close handlers
        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (cancelCheckout) cancelCheckout.addEventListener('click', closeModal);
        if (successClose) successClose.addEventListener('click', closeSuccessModal);

        // Form submission
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Validate form
                if (!validateForm()) return;
                
                // Show loading state
                const submitBtn = checkoutForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                try {
                    // Process order (simulate API call)
                    const orderData = getOrderData();
                    const response = await processOrderAPI(orderData);
                    
                    if (response.success) {
                        // Clear the cart
                        cartItems = [];
                        saveCart();
                        
                        // Close checkout modal and show success modal
                        closeModal();
                        showSuccessModal(response.orderId, orderData.total);
                        
                        // Reset form
                        checkoutForm.reset();
                    } else {
                        showErrorModal(response.message || 'Order processing failed. Please try again.');
                    }
                } catch (error) {
                    showErrorModal('An error occurred. Please try again later.');
                    console.error('Order processing error:', error);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            });
        }

        // Input validation on blur
        [firstName, lastName, email, phone, address, payment].forEach(field => {
            if (field) {
                field.addEventListener('blur', () => validateField(field));
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.classList.remove('active');
                }
            });
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }

    function increaseQuantity(index) {
        if (cartItems[index]) {
            cartItems[index].quantity += 1;
            saveCart();
            renderCartItems();
            showNotification(`${cartItems[index].name} quantity increased`);
        }
    }

    function decreaseQuantity(index) {
        if (cartItems[index] && cartItems[index].quantity > 1) {
            cartItems[index].quantity -= 1;
            saveCart();
            renderCartItems();
            showNotification(`${cartItems[index].name} quantity decreased`);
        }
    }

    function removeItem(index) {
        if (cartItems[index]) {
            const removedItem = cartItems[index].name;
            cartItems.splice(index, 1);
            saveCart();
            renderCartItems();
            showNotification(`${removedItem} removed from cart`);
        }
    }

    function closeModal() {
        if (checkoutModal) {
            checkoutModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    function closeSuccessModal() {
        if (successModal) {
            successModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    function validateForm() {
        let isValid = true;
        
        // Validate each field
        isValid = validateField(firstName) && isValid;
        isValid = validateField(lastName) && isValid;
        isValid = validateField(email) && isValid;
        isValid = validateField(phone) && isValid;
        isValid = validateField(address) && isValid;
        isValid = validateField(payment) && isValid;
        
        return isValid;
    }

    function validateField(field) {
        if (!field) return false;
        
        let isValid = true;
        let errorMessage = '';
        
        field.classList.remove('error');
        
        // Check if field is empty
        if (!field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        } 
        // Field-specific validation
        else if (field === email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        } 
        else if (field === phone && !/^[0-9]{10}$/.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit phone number';
        }
        
        if (!isValid) {
            field.classList.add('error');
            showFieldError(field, errorMessage);
        } else {
            clearFieldError(field);
        }
        
        return isValid;
    }

    function showFieldError(field, message) {
        // Remove existing error message
        clearFieldError(field);
        
        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--ruby)';
        errorElement.style.fontSize = '0.9rem';
        errorElement.style.marginTop = '0.5rem';
        
        // Insert after the field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    function clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function getOrderData() {
        const subtotal = parseFloat(subtotalElement.textContent.replace('₹', ''));
        const tax = parseFloat(taxElement.textContent.replace('₹', ''));
        const delivery = parseFloat(deliveryElement.textContent.replace('₹', ''));
        const total = parseFloat(totalElement.textContent.replace('₹', ''));
        
        return {
            customer: {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                phone: phone.value,
                address: address.value
            },
            paymentMethod: payment.value,
            items: [...cartItems],
            subtotal,
            tax,
            delivery,
            total,
            date: new Date().toISOString(),
            orderId: 'ORD-' + Date.now().toString().slice(-8)
        };
    }

    // Simulate API call
    async function processOrderAPI(orderData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate random success/failure
                const isSuccess = Math.random() > 0.1; // 90% success rate
                
                if (isSuccess) {
                    resolve({
                        success: true,
                        orderId: orderData.orderId,
                        message: 'Order processed successfully'
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Payment processing failed. Please try again.'
                    });
                }
            }, 1500); // Simulate network delay
        });
    }

    function showSuccessModal(orderId, total) {
        if (!successModal) return;
        
        // Update success message with order details
        const successMessage = successModal.querySelector('p');
        if (successMessage) {
            successMessage.textContent = `Your order #${orderId} has been placed successfully! Total: ₹${total.toFixed(2)}`;
        }
        
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function showErrorModal(message) {
        // Create or show error modal
        let errorModal = document.getElementById('error-modal');
        
        if (!errorModal) {
            errorModal = document.createElement('div');
            errorModal.id = 'error-modal';
            errorModal.className = 'modal-overlay active';
            errorModal.innerHTML = `
                <div class="modal-content">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h2>Order Failed</h2>
                    <p>${message}</p>
                    <button class="btn btn-primary" id="error-close">OK</button>
                </div>
            `;
            document.body.appendChild(errorModal);
            
            // Add styles for error modal
            const style = document.createElement('style');
            style.textContent = `
                .error-icon {
                    font-size: 5rem;
                    color: var(--ruby);
                    margin-bottom: 2rem;
                }
                .error-icon i {
                    animation: pulse 0.5s ease;
                }
            `;
            document.head.appendChild(style);
            
            // Add close handler
            document.getElementById('error-close').addEventListener('click', () => {
                errorModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
        
        errorModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'var(--gold)';
        notification.style.color = 'var(--chocolate)';
        notification.style.padding = '1rem 2rem';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.zIndex = '2000';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.fontFamily = 'Montserrat, sans-serif';
        notification.style.fontWeight = '600';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Product Page Specific Functionality (for index.html)
    if (document.querySelector('.add-to-cart')) {
        setupProductPage();
    }

    function setupProductPage() {
        // Product data
        const products = [
            {
                id: 1,
                name: 'Moti Choor Ladoo',
                price: 600,
                originalPrice: 750,
                category: 'Premium Sweets',
                description: 'Our signature Motichur Laddu is a symphony of tiny golden pearls, delicately bound with aromatic sugar syrup and infused with saffron.',
                image: 'https://i.pinimg.com/736x/f4/bf/b3/f4bfb3c12ed421c1d59b75479868f956.jpg'
            },
            {
                id: 2,
                name: 'Kesar Malai Penda',
                price: 300,
                originalPrice: 400,
                category: 'Royal Sweets',
                description: 'Crafted from the richest khoya and infused with premium Kashmiri saffron, our Kesar Peda melts luxuriously on the palate.',
                image: 'https://kandoisweets.com/cdn/shop/files/Kesar-Malai-Penda.jpg?v=1721793313&width=800'
            },
            {
                id: 3,
                name: 'Thabdi Peda',
                price: 300,
                originalPrice: 350,
                category: 'Gourmet Sweets',
                description: 'Our Thabdi Penda is a textural masterpiece - a caramelized crust giving way to a creamy, ghee-laden interior.',
                image: 'https://i.ytimg.com/vi/Dsk3vGuMg5E/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBgE8zMJ519Koggxlf_TL2k-SARdA'
            },
            {
                id: 4,
                name: 'Kaju Katri',
                price: 300,
                originalPrice: 400,
                category: 'Diamond Collection',
                description: 'Each diamond-shaped Kaju Katri is a testament to our craftsmanship, featuring premium cashews ground to perfection.',
                image: 'https://kandoisweets.com/cdn/shop/files/kajukatri.jpg?v=1720434317&width=800'
            },
            {
                id: 5,
                name: 'Kesar Kaju Katri',
                price: 300,
                originalPrice: 450,
                category: 'Diamond Collection',
                description: 'Our limited-edition Kesar Kaju Katri elevates the classic with premium Kashmiri saffron infusion.',
                image: 'https://kandoisweets.com/cdn/shop/files/CE646010-C9F6-475A-B5B6-7AB0A5C74963.png?v=1721673279&width=900'
            },
            {
                id: 6,
                name: 'Kathiyawadi Penda',
                price: 300,
                originalPrice: 350,
                category: 'Heritage Sweets',
                description: 'This traditional Saurashtrian specialty features a unique granular texture that slowly melts on the tongue.',
                image: 'https://b.zmtcdn.com/data/dish_photos/f8f/2f87a56aa901448f408a122824cbef8f.jpg'
            },
            {
                id: 7,
                name: 'Rajbhog Shrikhand',
                price: 300,
                originalPrice: 400,
                category: 'Royal Dessert',
                description: 'Our signature Rajbhog Shrikhand is a regal blend of hung curd infused with saffron-soaked milk.',
                image: 'https://i.pinimg.com/736x/b2/b5/95/b2b595bd59fdabfe6ea9c989909b2d72.jpg'
            },
            {
                id: 8,
                name: 'Eliachi Shrikhand',
                price: 300,
                originalPrice: 350,
                category: 'Aromatic Dessert',
                description: 'Premium green cardamom from Kerala lends its distinctive floral aroma to our Eliachi Shrikhand.',
                image: 'https://i.pinimg.com/736x/ec/5c/c2/ec5cc27d5b73ae18bf6a1c7a308b3453.jpg'
            },
            {
                id: 9,
                name: 'Kaju Badam Shrikhand',
                price: 300,
                originalPrice: 400,
                category: 'Nut Delight',
                description: 'A luxurious blend of California almonds and premium cashews folded into our silky shrikhand base.',
                image: 'https://pradeepsweets.com/wp-content/uploads/2024/05/Dry-Fruit-Shrikhand.jpg'
            },
            {
                id: 10,
                name: "Shreeji's Buttermilk",
                price: 300,
                originalPrice: 350,
                category: 'Digestive Elixir',
                description: 'Our traditional chaas is cultured for 12 hours with select probiotic strains.',
                image: 'https://i.pinimg.com/736x/51/80/a6/5180a6161d4a3daef0c1387874b6c66a.jpg'
            },
            {
                id: 11,
                name: 'Cold Coco',
                price: 300,
                originalPrice: 350,
                category: 'Chocolate Indulgence',
                description: 'Our signature Cold Coco blends single-origin cocoa with chilled milk for a silky, luxurious chocolate experience.',
                image: 'https://www.kansarrecipes.com/wp-content/uploads/2023/02/cold-coco-in-glass.jpg'
            },
            {
                id: 12,
                name: 'Lassi',
                price: 300,
                originalPrice: 350,
                category: 'Classic Refreshment',
                description: 'Our traditional sweet lassi is made with creamy yogurt from our dairy, blended to perfection.',
                image: 'https://i.pinimg.com/736x/af/38/e9/af38e9eebb22926d01a28b3293bfac29.jpg'
            }
        ];

        // Add to cart functionality with animation
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('.product-title').textContent;
                const product = products.find(p => p.name === productName);
                
                if (!product) return;

                // Check if item already exists in cart
                const existingItem = cartItems.find(item => item.name === product.name);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cartItems.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        description: product.description,
                        image: product.image
                    });
                }

                saveCart();
                renderCartItems();

                // Animation effects
                animateAddToCart(this, productCard);
                showNotification(`${product.name} added to cart!`);
            });
        });

        function animateAddToCart(button, productCard) {
            // Button pulse effect
            button.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                button.style.animation = '';
            }, 500);

            // Flying cart icon effect
            if (!cartCounter) return;

            const cartIcon = document.createElement('i');
            cartIcon.className = 'fas fa-shopping-bag';
            cartIcon.style.position = 'fixed';
            cartIcon.style.color = 'var(--gold)';
            cartIcon.style.fontSize = '20px';
            cartIcon.style.zIndex = '1000';
            cartIcon.style.pointerEvents = 'none';

            const rect = button.getBoundingClientRect();
            const startX = rect.left + rect.width/2;
            const startY = rect.top + rect.height/2;

            cartIcon.style.left = `${startX}px`;
            cartIcon.style.top = `${startY}px`;
            cartIcon.style.transform = 'translate(-50%, -50%)';

            document.body.appendChild(cartIcon);

            const endX = cartCounter.getBoundingClientRect().left + 15;
            const endY = cartCounter.getBoundingClientRect().top + 15;

            const animation = cartIcon.animate([
                { left: `${startX}px`, top: `${startY}px`, opacity: 1 },
                { left: `${endX}px`, top: `${endY}px`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            });

            animation.onfinish = () => {
                cartIcon.remove();
            };
        }
    }

    // Lazy load images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.removeAttribute('loading');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px 0px 200px 0px' });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
});

// Additional utility functions
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// API Configuration
const API_CONFIG = {
    BASE_URL: 'https://your-api-endpoint.com/api',
    PRODUCTS: '/products',
    CREATE_ORDER: '/orders',
    PROCESS_PAYMENT: '/payments'
};

// Enhanced cart.js with API integrations
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    
    // Add payment method change handler
    if (payment) {
        payment.addEventListener('change', (e) => {
            document.getElementById('card-payment-fields').style.display = 'none';
            document.getElementById('upi-payment-fields').style.display = 'none';
            
            if (e.target.value === 'card') {
                document.getElementById('card-payment-fields').style.display = 'block';
            } else if (e.target.value === 'upi') {
                document.getElementById('upi-payment-fields').style.display = 'block';
            }
        });
    }

    // Fetch products from API
    async function fetchProducts() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PRODUCTS}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            // Fallback to local products if API fails
            return [
                // ... your existing product data ...
            ];
        }
    }

    // Process payment through API
    async function processPayment(paymentData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PROCESS_PAYMENT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) throw new Error('Payment processing failed');
            return await response.json();
        } catch (error) {
            console.error('Payment error:', error);
            throw error;
        }
    }

    // Submit order to API
    async function submitOrder(orderData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CREATE_ORDER}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) throw new Error('Order submission failed');
            return await response.json();
        } catch (error) {
            console.error('Order submission error:', error);
            throw error;
        }
    }

    // Enhanced form submission handler
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateForm()) return;
            
            const submitBtn = checkoutForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            try {
                const orderData = getOrderData();
                
                // Process payment first
                const paymentResult = await processPayment({
                    method: orderData.paymentMethod,
                    amount: orderData.total,
                    currency: 'INR',
                    ...(orderData.paymentMethod === 'card' ? {
                        cardNumber: document.getElementById('card-number').value,
                        expiry: document.getElementById('card-expiry').value,
                        cvc: document.getElementById('card-cvc').value
                    } : {}),
                    ...(orderData.paymentMethod === 'upi' ? {
                        upiId: document.getElementById('upi-id').value
                    } : {})
                });
                
                if (!paymentResult.success) {
                    throw new Error(paymentResult.message || 'Payment failed');
                }
                
                // Then submit order
                const orderResult = await submitOrder(orderData);
                
                // Clear cart on success
                cartItems = [];
                saveCart();
                
                // Show success with order details
                showSuccessModal(orderResult.orderId, orderData.total);
                
                // Reset form
                checkoutForm.reset();
                closeModal();
            } catch (error) {
                showErrorModal(error.message || 'Order processing failed. Please try again.');
                console.error('Checkout error:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // Enhanced getOrderData function
    function getOrderData() {
        const subtotal = parseFloat(subtotalElement.textContent.replace('₹', ''));
        const tax = parseFloat(taxElement.textContent.replace('₹', ''));
        const delivery = parseFloat(deliveryElement.textContent.replace('₹', ''));
        const total = parseFloat(totalElement.textContent.replace('₹', ''));
        
        return {
            customer: {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                phone: phone.value,
                address: address.value
            },
            paymentMethod: payment.value,
            paymentDetails: payment.value === 'card' ? {
                last4: document.getElementById('card-number').value.slice(-4)
            } : payment.value === 'upi' ? {
                upiId: document.getElementById('upi-id').value
            } : {},
            items: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal,
            tax,
            delivery,
            total,
            date: new Date().toISOString()
        };
    }

    // Initialize with API products if needed
    if (window.location.pathname.includes('index.html')) {
        fetchProducts().then(products => {
            // Update your product display logic here
        });
    }
});