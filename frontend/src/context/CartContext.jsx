import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../components/common/Toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const toast = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setIsLoading(true);
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0],
          quantity: quantity,
          maxQuantity: product.maxQuantity || product.stockQuantity || 99
        }];
      }
    });
    
    setIsLoading(false);
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast.info('Đã xóa sản phẩm khỏi giỏ hàng!');
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity) }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    toast.info('Đã xóa tất cả sản phẩm khỏi giỏ hàng!');
  };

  // Add multiple items to cart (for reorder)
  const addMultipleToCart = (items) => {
    setIsLoading(true);

    setCartItems(prevItems => {
      let updatedItems = [...prevItems];

      items.forEach(newItem => {
        const existingItemIndex = updatedItems.findIndex(item => item.id === newItem.id);

        if (existingItemIndex >= 0) {
          // Update quantity if item already exists
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
          };
        } else {
          // Add new item
          updatedItems.push({
            id: newItem.id,
            name: newItem.name,
            price: newItem.price,
            image: newItem.image,
            quantity: newItem.quantity,
            maxQuantity: newItem.maxQuantity || 99
          });
        }
      });

      return updatedItems;
    });

    setIsLoading(false);
    toast.success(`Đã thêm ${items.length} sản phẩm vào giỏ hàng!`);
  };

  // Get cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      subtotal,
      itemCount,
      items: cartItems.length
    };
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addMultipleToCart,
    getCartTotals,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
