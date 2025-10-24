import { createContext, useContext, useState, useEffect } from 'react';

// Types
interface CartItem {
	id: number;
	name: string;
	price: number;
	checked: boolean;
	image: string;
	qty: number;
	weight: number;
}

interface CartContextType {
	cartItems: CartItem[];
	addToCart: (product: { id: number; name: string; price: number; image: string; weight?: number }) => void;
	removeFromCart: (id: number) => void;
	updateQty: (id: number, change: number) => void;
	toggleCheck: (id: number) => void;
	selectAll: (checked: boolean) => void;
	deleteSelected: () => void;
	getTotalItems: () => number;
	getCheckedItems: () => CartItem[];
	getTotal: () => number;
	getTotalWeight: () => number;
	clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);

	// Load cart from localStorage on mount
	useEffect(() => {
		const savedCart = localStorage.getItem('shopping-cart');
		if (savedCart) {
			try {
				setCartItems(JSON.parse(savedCart));
			} catch (e) {
				console.error('Failed to load cart:', e);
			}
		}
	}, []);

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		if (cartItems.length > 0) {
			localStorage.setItem('shopping-cart', JSON.stringify(cartItems));
		} else {
			localStorage.removeItem('shopping-cart');
		}
	}, [cartItems]);

	const addToCart = (product: { id: number; name: string; price: number; image: string; weight?: number }) => {
		setCartItems((prev) => {
			const existing = prev.find((item) => item.id === product.id);
			if (existing) {
				return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
			}
			return [
				...prev,
				{
					id: product.id,
					name: product.name,
					price: product.price,
					image: product.image,
					qty: 1,
					checked: true,
					weight: product.weight || 1
				}
			];
		});
	};

	const removeFromCart = (id: number) => {
		setCartItems((prev) => prev.filter((item) => item.id !== id));
	};

	const updateQty = (id: number, change: number) => {
		setCartItems((prev) =>
			prev.map((item) => {
				if (item.id === id) {
					const newQty = Math.max(1, item.qty + change);
					return { ...item, qty: newQty };
				}
				return item;
			})
		);
	};

	const toggleCheck = (id: number) => {
		setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
	};

	const selectAll = (checked: boolean) => {
		setCartItems((prev) => prev.map((item) => ({ ...item, checked })));
	};

	const deleteSelected = () => {
		setCartItems((prev) => prev.filter((item) => !item.checked));
	};

	const getTotalItems = () => {
		return cartItems.reduce((sum, item) => sum + item.qty, 0);
	};

	const getCheckedItems = () => {
		return cartItems.filter((item) => item.checked);
	};

	const getTotal = () => {
		return cartItems.filter((item) => item.checked).reduce((sum, item) => sum + item.price * item.qty, 0);
	};

	const getTotalWeight = () => {
		return cartItems.filter((item) => item.checked).reduce((sum, item) => sum + (item.weight || 1) * item.qty, 0);
	};

	const clearCart = () => {
		setCartItems([]);
	};

	return (
		<CartContext.Provider
			value={{
				cartItems,
				addToCart,
				removeFromCart,
				updateQty,
				toggleCheck,
				selectAll,
				deleteSelected,
				getTotalItems,
				getCheckedItems,
				getTotal,
				getTotalWeight,
				clearCart
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

// Hook to use cart
export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
}

// Hanya export CartProvider dan useCart hook
// Tidak ada komponen demo, langsung gunakan di aplikasi Anda
