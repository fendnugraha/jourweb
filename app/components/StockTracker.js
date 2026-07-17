"use client";

import React, { useState } from "react";
import { Search, Plus, ArrowUpDown, AlertTriangle, ArrowUp, ArrowDown, Edit2, AlertCircle } from "lucide-react";
import Dropdown from "./Dropdown";
import Modal from "./Modal";
import ConfirmDialog from "./ConfirmDialog";
import { STOCK_CATEGORIES } from "../utils/types";

export default function StockTracker({ stockItems, onAddStockItem, onEditStockItem, onDeleteStockItem, currency = "Rp " }) {
    // --- Search & Filter State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // --- Sorting State ---
    const [sortField, setSortField] = useState("quantity");
    const [sortOrder, setSortOrder] = useState("asc");

    // --- Modal States ---
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // --- Delete Confirmation State ---
    const [itemToDelete, setItemToDelete] = useState(null);

    // --- New Stock Item Form State ---
    const [newName, setNewName] = useState("");
    const [newSku, setNewSku] = useState("");
    const [newCategory, setNewCategory] = useState(STOCK_CATEGORIES[0]);
    const [newQuantity, setNewQuantity] = useState("");
    const [newMinQuantity, setNewMinQuantity] = useState("");
    const [newCost, setNewCost] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [formError, setFormError] = useState("");

    // --- Edit Form State ---
    const [editName, setEditName] = useState("");
    const [editSku, setEditSku] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editQuantity, setEditQuantity] = useState("");
    const [editMinQuantity, setEditMinQuantity] = useState("");
    const [editCost, setEditCost] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editError, setEditError] = useState("");

    // --- Sorting & Filtering Logic ---
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc"); // Default ascending
        }
    };

    const filteredItems = stockItems
        .filter((item) => {
            const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());

            const matchCategory = categoryFilter === "all" || item.category === categoryFilter;

            const isLow = item.quantity <= item.minQuantity;
            const matchStatus = statusFilter === "all" || (statusFilter === "low" ? isLow : !isLow);

            return matchSearch && matchCategory && matchStatus;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortField === "name") {
                comparison = a.name.localeCompare(b.name);
            } else if (sortField === "sku") {
                comparison = a.sku.localeCompare(b.sku);
            } else if (sortField === "category") {
                comparison = a.category.localeCompare(b.category);
            } else if (sortField === "quantity") {
                comparison = a.quantity - b.quantity;
            } else if (sortField === "cost") {
                comparison = a.cost - b.cost;
            } else if (sortField === "assetValue") {
                comparison = a.quantity * a.cost - b.quantity * b.cost;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });

    // --- Stock Quick Adjustment Handlers (+/- triggers) ---
    const adjustStockQty = (item, amount) => {
        const updatedQty = Math.max(0, item.quantity + amount);
        onEditStockItem({
            ...item,
            quantity: updatedQty,
        });
    };

    // --- Form Submit Handlers ---
    const handleAddSubmit = (e) => {
        e.preventDefault();
        setFormError("");

        if (!newName.trim() || !newSku.trim()) {
            setFormError("Please fill out Name and SKU fields");
            return;
        }

        const qty = parseInt(newQuantity);
        const minQty = parseInt(newMinQuantity);
        const costBasis = parseFloat(newCost);
        const priceBasis = parseFloat(newPrice || "0");

        if (isNaN(qty) || qty < 0) {
            setFormError("Quantity must be a valid number greater or equal to 0");
            return;
        }
        if (isNaN(minQty) || minQty < 0) {
            setFormError("Alert Threshold must be a valid number greater or equal to 0");
            return;
        }
        if (isNaN(costBasis) || costBasis < 0) {
            setFormError("Unit cost must be a valid number greater or equal to 0");
            return;
        }

        onAddStockItem({
            name: newName.trim(),
            sku: newSku.toUpperCase().trim(),
            category: newCategory,
            quantity: qty,
            minQuantity: minQty,
            cost: costBasis,
            price: priceBasis,
        });

        // Reset fields
        setNewName("");
        setNewSku("");
        setNewCategory(STOCK_CATEGORIES[0]);
        setNewQuantity("");
        setNewMinQuantity("");
        setNewCost("");
        setNewPrice("");
        setIsAddOpen(false);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        setEditError("");

        if (!editingItem) return;
        if (!editName.trim() || !editSku.trim()) {
            setEditError("Name and SKU cannot be blank");
            return;
        }

        const qty = parseInt(editQuantity);
        const minQty = parseInt(editMinQuantity);
        const costBasis = parseFloat(editCost);
        const priceBasis = parseFloat(editPrice || "0");

        if (isNaN(qty) || qty < 0) {
            setEditError("Quantity must be 0 or more");
            return;
        }
        if (isNaN(minQty) || minQty < 0) {
            setEditError("Threshold must be 0 or more");
            return;
        }
        if (isNaN(costBasis) || costBasis < 0) {
            setEditError("Cost basis must be 0 or more");
            return;
        }

        onEditStockItem({
            id: editingItem.id,
            name: editName.trim(),
            sku: editSku.toUpperCase().trim(),
            category: editCategory,
            quantity: qty,
            minQuantity: minQty,
            cost: costBasis,
            price: priceBasis,
        });

        setEditingItem(null);
    };

    // Open Edit Modal with populated data
    const startEdit = (item) => {
        setEditingItem(item);
        setEditName(item.name);
        setEditSku(item.sku);
        setEditCategory(item.category);
        setEditQuantity(item.quantity.toString());
        setEditMinQuantity(item.minQuantity.toString());
        setEditCost(item.cost.toString());
        setEditPrice(item.price.toString());
        setEditError("");
    };

    // Dropdown Options
    const categoryOptions = [{ value: "all", label: "All Categories" }, ...STOCK_CATEGORIES.map((cat) => ({ value: cat, label: cat }))];

    const formCategoryOptions = STOCK_CATEGORIES.map((cat) => ({ value: cat, label: cat }));

    const statusFilterOptions = [
        { value: "all", label: "All Statuses" },
        { value: "low", label: "Low Stock Alerts Only" },
        { value: "normal", label: "Adequate Stock Level" },
    ];

    return (
        <div className="space-y-6" id="stock-inventory-section">
            {/* Filters & Control Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side Filters */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    {/* Search SKU/Name */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by SKU or Name..."
                            aria-label="Search stock item list"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div>
                        <Dropdown
                            id="stock-category-filter"
                            label="Stock Category Filter"
                            options={categoryOptions}
                            selectedValue={categoryFilter}
                            onChange={(val) => setCategoryFilter(val)}
                            ariaLabel="Filter inventory by category"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div>
                        <Dropdown
                            id="stock-status-filter"
                            label="Stock Status Filter"
                            options={statusFilterOptions}
                            selectedValue={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            ariaLabel="Filter inventory by stocking safety status"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div>
                    <button
                        type="button"
                        onClick={() => setIsAddOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        New Inventory Item
                    </button>
                </div>
            </div>

            {/* Stock Ledger/Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-auto" aria-label="Small Business Real-time Stock Inventory Grid">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none dark:bg-slate-950/45 dark:text-slate-400">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-4"
                                    aria-sort={sortField === "name" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSort("name")}
                                        className="flex items-center gap-1 hover:text-slate-800 focus:outline-hidden focus-visible:underline dark:hover:text-slate-200"
                                    >
                                        Item Name
                                        <ArrowUpDown className={`h-3 w-3 ${sortField === "name" ? "text-indigo-500" : "text-slate-400"}`} />
                                    </button>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4"
                                    aria-sort={sortField === "sku" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSort("sku")}
                                        className="flex items-center gap-1 hover:text-slate-800 focus:outline-hidden focus-visible:underline dark:hover:text-slate-200"
                                    >
                                        SKU Code
                                        <ArrowUpDown className={`h-3 w-3 ${sortField === "sku" ? "text-indigo-500" : "text-slate-400"}`} />
                                    </button>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4"
                                    aria-sort={sortField === "category" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSort("category")}
                                        className="flex items-center gap-1 hover:text-slate-800 focus:outline-hidden focus-visible:underline dark:hover:text-slate-200"
                                    >
                                        Category
                                        <ArrowUpDown className={`h-3 w-3 ${sortField === "category" ? "text-indigo-500" : "text-slate-400"}`} />
                                    </button>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-center"
                                    aria-sort={sortField === "quantity" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSort("quantity")}
                                        className="inline-flex items-center gap-1 hover:text-slate-800 focus:outline-hidden focus-visible:underline dark:hover:text-slate-200"
                                    >
                                        Stock Level
                                        <ArrowUpDown className={`h-3 w-3 ${sortField === "quantity" ? "text-indigo-500" : "text-slate-400"}`} />
                                    </button>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-right"
                                    aria-sort={sortField === "cost" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSort("cost")}
                                        className="inline-flex items-center gap-1 hover:text-slate-800 focus:outline-hidden focus-visible:underline dark:hover:text-slate-200"
                                    >
                                        Unit Cost
                                        <ArrowUpDown className={`h-3 w-3 ${sortField === "cost" ? "text-indigo-500" : "text-slate-400"}`} />
                                    </button>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 text-right"
                                    aria-sort={sortField === "assetValue" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSort("assetValue")}
                                        className="inline-flex items-center gap-1 hover:text-slate-800 focus:outline-hidden focus-visible:underline dark:hover:text-slate-200"
                                    >
                                        Total Asset Value
                                        <ArrowUpDown className={`h-3 w-3 ${sortField === "assetValue" ? "text-indigo-500" : "text-slate-400"}`} />
                                    </button>
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">
                                    Inventory Adjust / Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        No matching stock items found. Try a different query or add a new stock item!
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const isLow = item.quantity <= item.minQuantity;
                                    const totalAssetVal = item.quantity * item.cost;

                                    return (
                                        <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors duration-150">
                                            {/* Name */}
                                            <td className="px-6 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <span>{item.name}</span>
                                                    {isLow && (
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded-sm bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100 animate-pulse dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400"
                                                            role="alert"
                                                            aria-label={`Low stock alert. Current level is ${item.quantity}, threshold is ${item.minQuantity}`}
                                                        >
                                                            <AlertTriangle className="h-3 w-3" />
                                                            LOW
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* SKU */}
                                            <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-xs">{item.sku}</td>

                                            {/* Category */}
                                            <td className="px-6 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">{item.category}</td>

                                            {/* Stock Quantity Adjust controls */}
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* Decrement Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustStockQty(item, -1)}
                                                        disabled={item.quantity === 0}
                                                        aria-label={`Decrease stock for ${item.name} by 1`}
                                                        className="rounded-xl border border-slate-200 p-1 bg-white hover:bg-slate-100 text-slate-600 focus:outline-hidden disabled:opacity-30 disabled:pointer-events-none dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                                                    >
                                                        <ArrowDown className="h-3.5 w-3.5" />
                                                    </button>

                                                    {/* Level indicator */}
                                                    <span
                                                        className={`w-12 text-center font-mono font-semibold ${isLow ? "text-rose-500 dark:text-rose-400 font-bold" : "text-slate-800 dark:text-slate-200"}`}
                                                    >
                                                        {item.quantity}
                                                    </span>

                                                    {/* Increment Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustStockQty(item, 1)}
                                                        aria-label={`Increase stock for ${item.name} by 1`}
                                                        className="rounded-xl border border-slate-200 p-1 bg-white hover:bg-slate-100 text-slate-600 focus:outline-hidden dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                                                    >
                                                        <ArrowUp className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Unit Cost */}
                                            <td className="px-6 py-3.5 text-right whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                                                {currency}
                                                {item.cost.toLocaleString()}
                                            </td>

                                            {/* Total Asset Value */}
                                            <td className="px-6 py-3.5 text-right whitespace-nowrap font-mono font-medium text-slate-800 dark:text-slate-200">
                                                {currency}
                                                {totalAssetVal.toLocaleString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-3.5 whitespace-nowrap text-center text-xs">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(item)}
                                                        className="inline-flex items-center gap-1 rounded-md p-1 text-indigo-600 hover:bg-indigo-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-950/20"
                                                        aria-label={`Edit details for ${item.name}`}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setItemToDelete(item.id)}
                                                        className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-red-400"
                                                        aria-label={`Delete stock item: ${item.name}`}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD STOCK ITEM MODAL --- */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Stock Item">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    {formError && (
                        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label htmlFor="stock-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Inventory Item Name
                        </label>
                        <input
                            id="stock-name"
                            type="text"
                            required
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. High-Gluten Sourdough Flour"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="stock-sku" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                SKU / Catalog Code
                            </label>
                            <input
                                id="stock-sku"
                                type="text"
                                required
                                value={newSku}
                                onChange={(e) => setNewSku(e.target.value)}
                                placeholder="e.g. INGR-FL-02"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category</label>
                            <Dropdown
                                id="stock-add-category"
                                label="Stock Category selection"
                                options={formCategoryOptions}
                                selectedValue={newCategory}
                                onChange={(val) => setNewCategory(val)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="stock-qty" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Initial Stock Qty
                            </label>
                            <input
                                id="stock-qty"
                                type="number"
                                required
                                value={newQuantity}
                                onChange={(e) => setNewQuantity(e.target.value)}
                                placeholder="0"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="stock-threshold" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Low Stock Threshold
                            </label>
                            <input
                                id="stock-threshold"
                                type="number"
                                required
                                value={newMinQuantity}
                                onChange={(e) => setNewMinQuantity(e.target.value)}
                                placeholder="e.g. 10"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="stock-cost" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Wholesale Cost (Rp / Unit)
                            </label>
                            <input
                                id="stock-cost"
                                type="number"
                                step="0.01"
                                required
                                value={newCost}
                                onChange={(e) => setNewCost(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="stock-price" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Retail Price (Rp / Unit) <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                id="stock-price"
                                type="number"
                                step="0.01"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsAddOpen(false)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                        >
                            Register Item
                        </button>
                    </div>
                </form>
            </Modal>

            {/* --- EDIT STOCK ITEM MODAL --- */}
            <Modal isOpen={editingItem !== null} onClose={() => setEditingItem(null)} title="Update Inventory Item Details">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    {editError && (
                        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{editError}</span>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label htmlFor="stock-edit-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Inventory Item Name
                        </label>
                        <input
                            id="stock-edit-name"
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="stock-edit-sku" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                SKU / Catalog Code
                            </label>
                            <input
                                id="stock-edit-sku"
                                type="text"
                                required
                                value={editSku}
                                onChange={(e) => setEditSku(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category</label>
                            <Dropdown
                                id="stock-edit-category"
                                label="Stock Edit Category selection"
                                options={formCategoryOptions}
                                selectedValue={editCategory}
                                onChange={(val) => setEditCategory(val)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="stock-edit-qty" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Stock Quantity
                            </label>
                            <input
                                id="stock-edit-qty"
                                type="number"
                                required
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="stock-edit-threshold" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Low Stock Threshold
                            </label>
                            <input
                                id="stock-edit-threshold"
                                type="number"
                                required
                                value={editMinQuantity}
                                onChange={(e) => setEditMinQuantity(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label htmlFor="stock-edit-cost" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Wholesale Cost (Rp / Unit)
                            </label>
                            <input
                                id="stock-edit-cost"
                                type="number"
                                step="0.01"
                                required
                                value={editCost}
                                onChange={(e) => setEditCost(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="stock-edit-price" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Retail Price (Rp / Unit)
                            </label>
                            <input
                                id="stock-edit-price"
                                type="number"
                                step="0.01"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setEditingItem(null)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* --- CONFIRMATION POPOVER FOR INVENTORY DELETES --- */}
            <ConfirmDialog
                isOpen={itemToDelete !== null}
                onClose={() => setItemToDelete(null)}
                onConfirm={() => {
                    if (itemToDelete) {
                        onDeleteStockItem(itemToDelete);
                        setItemToDelete(null);
                    }
                }}
                title="Delete Stock Item"
                description="Are you absolutely sure you want to delete this stock inventory item? Removing it will clear all catalog information and valuation statistics, which is irreversible."
            />
        </div>
    );
}
