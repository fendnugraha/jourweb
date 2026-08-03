"use client";

import React, { useState, useMemo } from "react";
import { ShoppingCart, Search, Plus, Minus, Trash2, Check, Receipt, Printer, CheckCircle2, Coffee, User, Store, ChevronRight, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatRupiah } from "@/app/utils/format";

export default function PointOfSale({
    stockItems,
    onPOSCheckout,
    currency = "Rp ",
    accounts = ["Cash", "Bank BCA", "Bank Mandiri", "Bank BRI", "Other Account"],
    allowOverdraft = false,
    enableTax = false,
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Voucher & SP");
    const [cart, setCart] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [paymentAccount, setPaymentAccount] = useState("Cash");
    const [isPrinting, setIsPrinting] = useState(false);

    // State Modal Preview & Receipt
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [lastReceipt, setLastReceipt] = useState(null);

    // 1. Build POS catalog
    const posProducts = useMemo(() => {
        const inventoryProducts = stockItems.map((item) => {
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

        return [...inventoryProducts];
    }, [stockItems]);

    // 2. Filter products
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
                const currentStockVal = product.currentStock;
                if (currentQtyInCart >= currentStockVal) {
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
                        stockItemId: "stockItemId" in product ? product.stockItemId : undefined,
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
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const tax = useMemo(() => {
        return enableTax ? subtotal * 0.08 : 0;
    }, [subtotal, enableTax]);

    const total = useMemo(() => {
        return subtotal + tax;
    }, [subtotal, tax]);

    // Buka Modal Preview Pesanan
    const handleOpenPreview = (e) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setIsPreviewOpen(true);
    };

    // Eksekusi Checkout sesungguhnya dari Modal Preview
    const handleFinalCheckout = () => {
        if (cart.length === 0) return;

        const receiptId = "REC-" + Math.floor(100000 + Math.random() * 900000);
        const date = new Date();
        const formattedDate = date.toISOString().split("T")[0];
        const formattedTime = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const memo = `POS Sale #${receiptId} (${customerName || "Walk-in customer"})`;
        const transaction = {
            description: memo,
            amount: parseFloat(total.toFixed(2)),
            type: "income",
            category: "Sales",
            date: formattedDate,
            account: paymentAccount,
        };

        // Invoke checkout callback
        onPOSCheckout(transaction, cart);

        // Save receipt data
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

        // Tutup modal preview & buka modal bukti transaksi/receipt
        setIsPreviewOpen(false);
        setIsReceiptOpen(true);
    };

    const handleNewOrder = () => {
        setCart([]);
        setCustomerName("");
        setPaymentAccount("Cash");
        setIsReceiptOpen(false);
        setIsPrinting(false);
    };

    const getPaymentLabel = (method) => {
        return method;
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            setIsPrinting(false);
        }, 2000);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-12" id="pos-terminal-system">
            {/* LEFT SECTION: Product Catalog Selection (Col span 7) */}
            <div className="lg:col-span-7 space-y-4">
                {/* Search and Category filters */}
                <div className="p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-3">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Search className="h-4 w-4" />
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search POS catalog..."
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-500 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100 font-sans"
                        />
                    </div>

                    {/* Catalog Filter Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1" role="tablist" aria-label="POS Catalog Categories">
                        {["all", "Voucher & SP", "Accessories", "Kabel Data", "Charger", "Earphone"].map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                role="tab"
                                aria-selected={selectedCategory === cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                    selectedCategory === cat
                                        ? "bg-indigo-600 text-white shadow-xs"
                                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80"
                                }`}
                            >
                                {cat === "all" ? "All Items" : cat === "Voucher & SP" ? "Voucher & SP" : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 max-h-145 overflow-y-auto pr-1">
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
                                type="button"
                                whileTap={{ scale: isOutOfStock || isLimitReached ? 1 : 0.97 }}
                                onClick={() => addToCart(product)}
                                disabled={isOutOfStock || isLimitReached}
                                className={`relative p-3.5 rounded-xl border text-left flex flex-col justify-between h-32.5 bg-white dark:bg-slate-900 transition-all ${
                                    isOutOfStock
                                        ? "border-rose-100 dark:border-rose-950/30 opacity-55 cursor-not-allowed bg-rose-50/10"
                                        : isLimitReached
                                          ? "border-amber-100 dark:border-amber-950/30 bg-amber-50/5 cursor-default"
                                          : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-xs cursor-pointer group"
                                }`}
                            >
                                <div className="w-full">
                                    <div className="flex justify-between items-start gap-1">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{product.category}</span>
                                        {product.isCafeMenu ? (
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                                                <Coffee className="h-2 w-2" /> Fresh
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-1.5 py-0.2 text-[9px] font-bold text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                                                <Store className="h-2 w-2" /> Stock
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mt-1 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {product.name}
                                    </h4>
                                </div>

                                <div className="flex items-end justify-between mt-auto pt-2 w-full border-t border-slate-200 dark:border-slate-600/40">
                                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{formatRupiah(product.price)}</span>

                                    <div className="text-right">
                                        {isOutOfStock ? (
                                            <span className="text-[10px] font-bold text-rose-500 flex items-center gap-0.5">Out of stock</span>
                                        ) : isLimitReached ? (
                                            <span className="text-[10px] font-bold text-amber-500">Cart Max ({currentStock})</span>
                                        ) : isStockItem ? (
                                            <span className={`text-[10px] font-medium ${currentStock <= 5 ? "text-rose-500 font-semibold" : "text-slate-400"}`}>
                                                {currentStock} left {cartQty > 0 && `(${cartQty} in cart)`}
                                            </span>
                                        ) : (
                                            cartQty > 0 && <span className="text-[10px] font-bold text-indigo-500">{cartQty} in cart</span>
                                        )}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}

                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">No matching POS products found in catalog.</div>
                    )}
                </div>
            </div>

            {/* RIGHT SECTION: Cart Area & Payment Selection (Col span 5) */}
            <div className="lg:col-span-5 flex flex-col h-full">
                <form
                    onSubmit={handleOpenPreview}
                    className="p-5 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between min-h-145 shadow-xs"
                >
                    {/* Cart Header */}
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-indigo-500" />
                            Active Register Cart
                            {cart.length > 0 && (
                                <span className="ml-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                                </span>
                            )}
                        </h3>
                    </div>

                    {/* Cart items list */}
                    <div className="flex-1 overflow-y-auto max-h-55 mb-4 space-y-2.5 pr-1">
                        <AnimatePresence initial={false}>
                            {cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-200/45 dark:bg-slate-800/15 dark:border-slate-800"
                                >
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</h5>
                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{formatRupiah(item.price)} each</p>
                                    </div>

                                    {/* Quantity adjustments */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => updateCartQty(item.id, -1)}
                                            className="rounded-lg border border-slate-200 p-1 bg-white hover:bg-slate-100 text-slate-600 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-6 text-center font-mono text-xs font-bold text-slate-800 dark:text-slate-100">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateCartQty(item.id, 1)}
                                            className="rounded-lg border border-slate-200 p-1 bg-white hover:bg-slate-100 text-slate-600 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        type="button"
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {cart.length === 0 && (
                            <div className="h-36 flex flex-col items-center justify-center text-center p-4">
                                <ShoppingCart className="h-8 w-8 text-slate-300 mb-2 animate-bounce" />
                                <p className="text-xs text-slate-400 font-medium">Cart is currently empty</p>
                                <p className="text-[10px] text-slate-400/80 mt-0.5 max-w-50">
                                    Select café goods or inventory stock products from the left to start checkout.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Customer reference */}
                    <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4 mb-4">
                        <div className="space-y-1">
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
                                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-600 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    {/* Pricing calculations & Preview button */}
                    <div className="bg-slate-50 p-4 rounded-xl dark:bg-slate-950/40 border border-slate-100/50 dark:border-slate-800/50 space-y-2">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span className="font-mono">
                                {currency}
                                {subtotal.toLocaleString()}
                            </span>
                        </div>
                        {/* <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Local Sales Tax (8%)</span>
                            <span className="font-mono">
                                {currency}
                                {tax.toLocaleString()}
                            </span>
                        </div> */}
                        <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
                        <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-50">
                            <span>Total Due</span>
                            <span className="font-mono text-base text-indigo-600 dark:text-indigo-400">
                                {currency}
                                {total.toLocaleString()}
                            </span>
                        </div>

                        {/* TOMBOL UNTUK BUKA PREVIEW */}
                        <button
                            type="submit"
                            disabled={cart.length === 0}
                            className={`w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition-colors ${
                                cart.length === 0
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
                                    : "bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-md"
                            }`}
                        >
                            <Eye className="h-4 w-4" />
                            Preview & Ringkasan Pesanan
                        </button>
                    </div>
                </form>

                {/* MODAL 1: PREVIEW BARANG SEBELUM CHECKOUT */}
                <AnimatePresence>
                    {isPreviewOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsPreviewOpen(false)}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity dark:bg-slate-950/85"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
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
                                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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

                                {/* Items List Preview */}
                                <div className="flex-1 overflow-y-auto py-3 my-2 space-y-2 max-h-52">
                                    {cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs"
                                        >
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

                                {/* Pricing Breakdown */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                                    <div className="flex justify-between text-slate-500">
                                        <span>Subtotal</span>
                                        <span className="font-mono">
                                            {currency}
                                            {subtotal.toLocaleString()}
                                        </span>
                                    </div>
                                    {enableTax && (
                                        <div className="flex justify-between text-slate-500">
                                            <span>Pajak (8%)</span>
                                            <span className="font-mono">
                                                {currency}
                                                {tax.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <span>Total Bayar</span>
                                        <span className="font-mono text-indigo-600 dark:text-indigo-400">
                                            {currency}
                                            {total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="grid grid-cols-2 gap-3 mt-5">
                                    <button
                                        type="button"
                                        onClick={() => setIsPreviewOpen(false)}
                                        className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        Kembali & Ubah
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleFinalCheckout}
                                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Checkout Sekarang
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* MODAL 2: RECEIPT SUCCESS DIALOG */}
                <AnimatePresence>
                    {isReceiptOpen && lastReceipt && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleNewOrder}
                                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity dark:bg-slate-950/85"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
                            >
                                <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mb-2">
                                        <Receipt className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wide">BRILink THREEKOMUNIKA</h2>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">128 Sourdough Lane, Hearthstone CA</p>
                                    <div className="mt-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 py-1 px-2.5 rounded-lg inline-flex items-center gap-1 text-[10px] font-bold">
                                        <Check className="h-3 w-3" /> Sale Finalized & Registered
                                    </div>
                                </div>

                                <div className="py-4 space-y-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50">
                                    <div className="flex justify-between">
                                        <span>Receipt No:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{lastReceipt.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Timestamp:</span>
                                        <span>{lastReceipt.timestamp}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Customer:</span>
                                        <span className="truncate max-w-37.5">{lastReceipt.customer}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Payment Method:</span>
                                        <span>{getPaymentLabel(lastReceipt.payment)}</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto py-4 space-y-2.5 max-h-55">
                                    <table className="w-full text-[11px] font-mono">
                                        <thead>
                                            <tr className="text-slate-400 border-b border-dashed border-slate-200 dark:border-slate-800 pb-1">
                                                <th className="text-left font-normal py-1">Item Description</th>
                                                <th className="text-center font-normal py-1">Qty</th>
                                                <th className="text-right font-normal py-1">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
                                            {lastReceipt.items.map((item) => (
                                                <tr key={item.id} className="text-slate-700 dark:text-slate-300">
                                                    <td className="py-1.5 pr-2 max-w-40 truncate">{item.name}</td>
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

                                <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>
                                            {currency}
                                            {lastReceipt.subtotal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (8%):</span>
                                        <span>
                                            {currency}
                                            {lastReceipt.tax.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-slate-900 dark:text-slate-55 font-bold text-sm pt-1 border-t border-slate-100 dark:border-slate-800/50">
                                        <span>Grand Total:</span>
                                        <span>
                                            {currency}
                                            {lastReceipt.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-center pt-5 mt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                                    <p>Thank you for supporting our craft bakery & kitchen!</p>
                                    <p className="mt-0.5">Please visit us again soon.</p>
                                    {isPrinting && (
                                        <p className="text-indigo-500 dark:text-indigo-400 font-semibold mt-2 animate-pulse">
                                            Sending invoice payload to network printer...
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-5">
                                    <button
                                        type="button"
                                        onClick={handlePrint}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <Printer className="h-3.5 w-3.5" />
                                        Print Invoice
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNewOrder}
                                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-xs transition-colors"
                                    >
                                        New POS Order
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
