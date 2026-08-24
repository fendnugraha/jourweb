/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    Trash2,
    Check,
    Receipt,
    Printer,
    CheckCircle2,
    Coffee,
    User,
    Store,
    ChevronRight,
    Eye,
    X,
    ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Helper format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(number);
};

// ==========================================
// 1. KOMPONEN KERANJANG
// ==========================================
function CartFormContent({
    cart,
    totalItemsCount,
    customerName,
    setCustomerName,
    subtotal,
    total,
    currency,
    updateCartQty,
    removeFromCart,
    handleOpenPreview,
}) {
    return (
        <div className="flex flex-col justify-start h-fit space-y-3">
            {/* Header Cart */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize tracking-wider flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-indigo-500" />
                    Keranjang Belanja
                    {totalItemsCount > 0 && (
                        <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {totalItemsCount} Item{totalItemsCount > 1 && "s"}
                        </span>
                    )}
                </h3>
            </div>

            {/* Cart items list */}
            <div className="flex-1 overflow-y-auto max-h-60 lg:max-h-70 my-2 space-y-2.5 pr-1">
                <AnimatePresence initial={false}>
                    {cart.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800/40 dark:border-slate-800"
                        >
                            <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</h5>
                                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{formatRupiah(item.price)}</p>
                            </div>

                            {/* Quantity adjustments */}
                            <div className="flex items-center gap-2">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => updateCartQty(item.id, -1)}
                                    className="rounded-lg border border-slate-200 p-1 bg-white hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                                >
                                    <Minus className="h-3 w-3" />
                                </motion.button>
                                <span className="w-6 text-center font-mono text-xs font-bold text-slate-800 dark:text-slate-100">{item.quantity}</span>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => updateCartQty(item.id, 1)}
                                    className="rounded-lg border border-slate-200 p-1 bg-white hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                                >
                                    <Plus className="h-3 w-3" />
                                </motion.button>
                            </div>

                            {/* Delete button */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                            </motion.button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {cart.length === 0 && (
                    <div className="h-36 flex flex-col items-center justify-center text-center p-4">
                        <ShoppingCart className="h-8 w-8 text-slate-300 mb-2" />
                        <p className="text-xs text-slate-400 font-medium">Keranjang Masih Kosong</p>
                        <p className="text-[10px] text-slate-400/80 mt-0.5 max-w-50">Pilih produk di katalog untuk ditambahkan ke keranjang</p>
                    </div>
                )}
            </div>

            {/* Customer input */}
            <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                <label
                    htmlFor="customer-name"
                    className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1"
                >
                    <User className="h-3 w-3" /> Customer Reference
                </label>
                <input
                    id="customer-name"
                    type="text"
                    placeholder="Walk-in Customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-100"
                />
            </div>

            {/* Pricing calculations & Action */}
            <div className="bg-slate-50 p-3.5 rounded-xl dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-mono">
                        {currency}
                        {subtotal.toLocaleString()}
                    </span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-50">
                    <span>Total Bayar</span>
                    <span className="font-mono text-base text-indigo-600 dark:text-indigo-400">
                        {currency}
                        {total.toLocaleString()}
                    </span>
                </div>

                <motion.button
                    whileTap={{ scale: cart.length === 0 ? 1 : 0.98 }}
                    type="button"
                    onClick={handleOpenPreview}
                    disabled={cart.length === 0}
                    className={`w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition-colors ${
                        cart.length === 0
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
                            : "bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-md"
                    }`}
                >
                    <Eye className="h-4 w-4" />
                    Preview & Ringkasan Pesanan
                </motion.button>
            </div>
        </div>
    );
}

// ==========================================
// 2. KOMPONEN UTAMA PointOfSale
// ==========================================
export default function PointOfSale({ stockItems = [], onPOSCheckout = () => {}, currency = "Rp ", allowOverdraft = false, enableTax = false }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Voucher & SP");
    const [isHydrated, setIsHydrated] = useState(false);

    // Initial state dari localStorage
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState("");

    const [paymentAccount, setPaymentAccount] = useState("Cash");
    const [isPrinting, setIsPrinting] = useState(false);

    // State Modal Mobile Sheet, Preview & Receipt
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [lastReceipt, setLastReceipt] = useState(null);

    // 1. Load data dari localStorage saat kompone di-mount (Client-side)
    useEffect(() => {
        const savedCart = localStorage.getItem("pos_cart_items");
        const savedCustomer = localStorage.getItem("pos_customer_name");

        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Gagal membaca cart dari localStorage", e);
            }
        }

        if (savedCustomer) {
            setCustomerName(savedCustomer);
        }

        setIsHydrated(true);
    }, []);

    // 2. Simpan cart ke localStorage saat ada perubahan
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem("pos_cart_items", JSON.stringify(cart));
        }
    }, [cart, isHydrated]);

    // 3. Simpan customerName ke localStorage saat ada perubahan
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem("pos_customer_name", customerName);
        }
    }, [customerName, isHydrated]);

    // Build POS catalog
    const posProducts = useMemo(() => {
        return stockItems.map((item) => {
            const retailPrice = item.price > 0 ? item.price : Math.round((item.cost * 1.8) / 100) * 100;
            return {
                id: item.id,
                name: item.name,
                price: retailPrice,
                cost: item.cost,
                category: item.category,
                isCafeMenu: item.category === "Voucher & SP",
                stockItemId: item.id,
                currentStock: item.quantity,
                sku: item.sku,
            };
        });
    }, [stockItems]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return posProducts.filter((product) => {
            const skuVal = "sku" in product ? product.sku : "";
            const matchesSearch =
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) || (skuVal && skuVal.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [posProducts, searchQuery, selectedCategory]);

    // Cart operations
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);

            if (!allowOverdraft && !product.isCafeMenu && "currentStock" in product) {
                const currentQtyInCart = existing ? existing.quantity : 0;
                if (currentQtyInCart >= product.currentStock) {
                    return prevCart;
                }
            }

            if (existing) {
                return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            } else {
                return [
                    ...prevCart,
                    {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        cost: product.cost,
                        quantity: 1,
                        isCafeMenu: product.isCafeMenu,
                        stockItemId: product.stockItemId,
                    },
                ];
            }
        });
    };

    const updateCartQty = (id, delta) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === id);
            if (!existing) return prevCart;

            const newQty = existing.quantity + delta;
            if (newQty <= 0) {
                return prevCart.filter((item) => item.id !== id);
            }

            if (!allowOverdraft && !existing.isCafeMenu && existing.stockItemId) {
                const matchedStockItem = stockItems.find((s) => s.id === existing.stockItemId);
                if (matchedStockItem && newQty > matchedStockItem.quantity) {
                    return prevCart;
                }
            }

            return prevCart.map((item) => (item.id === id ? { ...item, quantity: newQty } : item));
        });
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    // Financial calculations
    const totalItemsCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const tax = useMemo(() => {
        return enableTax ? subtotal * 0.08 : 0;
    }, [subtotal, enableTax]);

    const total = useMemo(() => {
        return subtotal + tax;
    }, [subtotal, tax]);

    const handleOpenPreview = (e) => {
        if (e) e.preventDefault();
        if (cart.length === 0) return;
        setIsMobileCartOpen(false);
        setIsPreviewOpen(true);
    };

    const handleFinalCheckout = () => {
        if (cart.length === 0) return;

        const receiptId = "REC-" + Math.floor(100000 + Math.random() * 900000);
        const date = new Date();
        const formattedDate = date.toISOString().split("T")[0];
        const formattedTime = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        const memo = `POS Sale #${receiptId} (${customerName || "Walk-in customer"})`;
        const transaction = {
            description: memo,
            amount: parseFloat(total.toFixed(2)),
            type: "income",
            category: "Sales",
            date: formattedDate,
            account: paymentAccount,
        };

        onPOSCheckout(transaction, cart);

        setLastReceipt({
            id: receiptId,
            timestamp: `${formattedDate} ${formattedTime}`,
            customer: customerName || "Walk-in Customer",
            items: [...cart],
            subtotal,
            tax,
            total,
            payment: paymentAccount,
        });

        // Bersihkan storage setelah checkout berhasil
        localStorage.removeItem("pos_cart_items");
        localStorage.removeItem("pos_customer_name");

        setIsPreviewOpen(false);
        setIsReceiptOpen(true);
    };

    const handleNewOrder = () => {
        setCart([]);
        setCustomerName("");
        setPaymentAccount("Cash");
        localStorage.removeItem("pos_cart_items");
        localStorage.removeItem("pos_customer_name");
        setIsReceiptOpen(false);
        setIsPrinting(false);
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            setIsPrinting(false);
        }, 2000);
    };

    const cartProps = {
        cart,
        totalItemsCount,
        customerName,
        setCustomerName,
        subtotal,
        total,
        currency,
        updateCartQty,
        removeFromCart,
        handleOpenPreview,
    };

    return (
        <div className="relative pb-36 lg:pb-0" id="pos-terminal-system">
            <div className="grid gap-6 lg:grid-cols-12">
                {/* LEFT SECTION: Catalog */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Search & Categories */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-3">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Search className="h-4 w-4" />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search POS catalog..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-sans"
                            />
                        </div>

                        {/* Catalog Filter Buttons */}
                        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-4 -mx-4 sm:mx-0 sm:px-0">
                            {["all", "Voucher & SP", "Accessories", "Kabel Data", "Charger", "Earphone"].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                                        selectedCategory === cat
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    }`}
                                >
                                    {cat === "all" ? "All Items" : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[calc(100vh-280px)] lg:max-h-145 overflow-y-auto pr-1">
                        {filteredProducts.map((product) => {
                            const isStockItem = !product.isCafeMenu;
                            const currentStock = "currentStock" in product ? product.currentStock : Infinity;
                            const inCart = cart.find((item) => item.id === product.id);
                            const cartQty = inCart ? inCart.quantity : 0;
                            const isOutOfStock = isStockItem && currentStock <= 0;
                            const isLimitReached = isStockItem && cartQty >= currentStock;

                            return (
                                <motion.button
                                    key={product.id}
                                    whileTap={{ scale: isOutOfStock || isLimitReached ? 1 : 0.96 }}
                                    onClick={() => addToCart(product)}
                                    disabled={isOutOfStock || isLimitReached}
                                    className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between h-32 bg-white dark:bg-slate-900 transition-all ${
                                        isOutOfStock
                                            ? "border-rose-100 dark:border-rose-950/30 opacity-50 cursor-not-allowed bg-rose-50/10"
                                            : isLimitReached
                                              ? "border-amber-100 dark:border-amber-950/30 bg-amber-50/5 cursor-default"
                                              : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-xs cursor-pointer"
                                    }`}
                                >
                                    <div className="w-full">
                                        <div className="flex justify-between items-start gap-1">
                                            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 truncate">{product.category}</span>
                                            {product.isCafeMenu ? (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[8px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 shrink-0">
                                                    <Coffee className="h-2 w-2" /> Fresh
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-1.5 py-0.2 text-[8px] font-bold text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 shrink-0">
                                                    <Store className="h-2 w-2" /> Stock
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mt-1 leading-snug">
                                            {product.name}
                                        </h4>
                                    </div>

                                    <div className="flex items-end justify-between mt-auto pt-2 w-full border-t border-slate-100 dark:border-slate-800">
                                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                            {formatRupiah(product.price)}
                                        </span>

                                        <div className="text-right">
                                            {isOutOfStock ? (
                                                <span className="text-[9px] font-bold text-rose-500">Habis</span>
                                            ) : isLimitReached ? (
                                                <span className="text-[9px] font-bold text-amber-500">Max ({currentStock})</span>
                                            ) : isStockItem ? (
                                                <span
                                                    className={`text-[9px] font-medium ${currentStock <= 5 ? "text-rose-500 font-semibold" : "text-slate-400"}`}
                                                >
                                                    Sisa {currentStock}
                                                </span>
                                            ) : (
                                                cartQty > 0 && <span className="text-[9px] font-bold text-indigo-500">{cartQty} di cart</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT SECTION: Cart Desktop */}
                <div className="hidden lg:block lg:col-span-5 h-fit">
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 h-full min-h-145 shadow-xs">
                        <CartFormContent {...cartProps} />
                    </div>
                </div>
            </div>

            {/* MOBILE FLOATING BOTTOM BAR */}
            <div className="lg:hidden fixed bottom-16 sm:bottom-20 left-3 right-3 z-40">
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsMobileCartOpen(true)}
                    className="w-full bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between border border-slate-800 dark:border-indigo-500 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative p-2 bg-white/10 rounded-xl">
                            <ShoppingCart className="h-5 w-5 text-white" />
                            {totalItemsCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                                    {totalItemsCount}
                                </span>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-slate-300 dark:text-indigo-200 font-medium uppercase tracking-wider">
                                {totalItemsCount} Item Dipesan
                            </p>
                            <p className="font-mono text-sm font-bold text-white">{formatRupiah(total)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-xl text-xs font-semibold">
                        <span>Lihat Keranjang</span>
                        <ChevronUp className="h-4 w-4" />
                    </div>
                </motion.button>
            </div>

            {/* MOBILE DRAWER / BOTTOM SHEET CART */}
            <AnimatePresence>
                {isMobileCartOpen && (
                    <motion.div
                        key="mobile-cart-drawer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end"
                    >
                        <div onClick={() => setIsMobileCartOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 250 }}
                            className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col z-10"
                        >
                            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3 shrink-0" />

                            <button
                                type="button"
                                onClick={() => setIsMobileCartOpen(false)}
                                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex-1 overflow-y-auto pt-1">
                                <CartFormContent {...cartProps} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL PREVIEW */}
            <AnimatePresence>
                {isPreviewOpen && (
                    <motion.div
                        key="preview-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div onClick={() => setIsPreviewOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col z-10"
                        >
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                        <Eye className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Ringkasan Pesanan</h3>
                                        <p className="text-[10px] text-slate-400">Periksa item sebelum menyelesaikan transaksi</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="py-3 text-xs space-y-1 text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                                <p>
                                    <span className="text-slate-400">Pelanggan:</span> {customerName || "Walk-in Customer"}
                                </p>
                                <p>
                                    <span className="text-slate-400">Metode Pembayaran:</span> {paymentAccount}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto py-3 my-2 space-y-2 max-h-52">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">
                                                {formatRupiah(item.price)} x {item.quantity}
                                            </p>
                                        </div>
                                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                            {currency}
                                            {(item.price * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="font-mono">
                                        {currency}
                                        {subtotal.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <span>Total Bayar</span>
                                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                                        {currency}
                                        {total.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                                >
                                    Kembali & Ubah
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={handleFinalCheckout}
                                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md cursor-pointer"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Checkout
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RECEIPT MODAL */}
            <AnimatePresence>
                {isReceiptOpen && lastReceipt && (
                    <motion.div
                        key="receipt-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div onClick={handleNewOrder} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col z-10"
                        >
                            <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-2">
                                    <Receipt className="h-5 w-5" />
                                </div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">BRILink THREEKOMUNIKA</h2>
                                <div className="mt-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 py-1 px-2.5 rounded-lg inline-flex items-center gap-1 text-[10px] font-bold">
                                    <Check className="h-3 w-3" /> Transaksi Berhasil
                                </div>
                            </div>

                            <div className="py-3 space-y-1 font-mono text-[11px] text-slate-500 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between">
                                    <span>No Receipt:</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{lastReceipt.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Waktu:</span>
                                    <span>{lastReceipt.timestamp}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Pelanggan:</span>
                                    <span>{lastReceipt.customer}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto py-3 space-y-2 max-h-48">
                                <table className="w-full text-[11px] font-mono">
                                    <thead>
                                        <tr className="text-slate-400 border-b border-dashed border-slate-200 dark:border-slate-800 pb-1">
                                            <th className="text-left font-normal py-1">Item</th>
                                            <th className="text-center font-normal py-1">Qty</th>
                                            <th className="text-right font-normal py-1">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
                                        {lastReceipt.items.map((item) => (
                                            <tr key={item.id} className="text-slate-700 dark:text-slate-300">
                                                <td className="py-1.5 pr-2 truncate max-w-32">{item.name}</td>
                                                <td className="py-1.5 text-center">{item.quantity}</td>
                                                <td className="py-1.5 text-right font-semibold">
                                                    {currency}
                                                    {(item.price * item.quantity).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1">
                                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 text-sm">
                                    <span>Grand Total:</span>
                                    <span>
                                        {currency}
                                        {lastReceipt.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={handlePrint}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                                >
                                    <Printer className="h-3.5 w-3.5" />
                                    Cetak Struk
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={handleNewOrder}
                                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer"
                                >
                                    Order Baru
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
