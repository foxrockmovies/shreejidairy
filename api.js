// Mock API service for development
const MOCK_PRODUCTS = [
    // Your product data here
];

export const fetchProducts = async () => {
    return new Promise(resolve => {
        setTimeout(() => resolve(MOCK_PRODUCTS), 500);
    });
};

export const processPayment = async (paymentData) => {
    return new Promise(resolve => {
        setTimeout(() => resolve({ 
            success: true, 
            transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
        }), 1000);
    });
};

export const submitOrder = async (orderData) => {
    return new Promise(resolve => {
        setTimeout(() => resolve({
            success: true,
            orderId: 'ORD-' + Date.now().toString().slice(-8),
            date: new Date().toISOString()
        }), 800);
    });
};