import React, { createContext, useContext, useState, useEffect } from "react";
import { login, logout, getCurrentUser } from "../azure";

const SiteContext = createContext();

export function SiteProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
        setCartItems([]);
      }
    }
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          // Only admin role can access admin panel
          setIsAdmin(userData?.role === "admin");
        } catch (error) {
          console.error("Auth check failed:", error);
          // Token expired or invalid, clear it
          localStorage.removeItem("authToken");
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const response = await login(username, password);
      const { token, user: userData } = response;
      
      // Only allow admin role to access admin panel
      if (userData.role !== "admin") {
        throw new Error("Only admin accounts can access this panel.");
      }
      
      // Store token
      localStorage.setItem("authToken", token);
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local state regardless of API call success
      localStorage.removeItem("authToken");
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  // Legacy support for backward compatibility
  const loginAsCreator = async (password) => {
    // Try to use default admin username or prompt for username
    const result = await handleLogin("admin", password);
    return result.success;
  };

  const logoutCreator = () => {
    handleLogout();
  };

  // Legacy support
  const isCreatorAuthed = isAdmin;

  // Cart management functions
  const addToCart = (product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <SiteContext.Provider
      value={{
        // New authentication system
        user,
        isAuthenticated,
        isAdmin,
        loading,
        login: handleLogin,
        logout: handleLogout,
        
        // Cart management
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        
        // Legacy support for backward compatibility
        isCreatorAuthed,
        loginAsCreator,
        logoutCreator,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within SiteProvider");
  }
  return context;
}
