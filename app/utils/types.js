export const INITIAL_TRANSACTIONS = [
    {
        id: "t1",
        description: "Organic Flour Batch Delivery",
        amount: 450000,
        type: "expense",
        category: "Ingredients",
        date: "2026-07-02",
        account: "Bank BCA",
    },
    { id: "t2", description: "Catering: Wedding Cake Order #402", amount: 1200000, type: "income", category: "Sales", date: "2026-07-04", account: "Bank BCA" },
    {
        id: "t3",
        description: "Monthly Retail Store Utilities",
        amount: 310000,
        type: "expense",
        category: "Utilities",
        date: "2026-07-05",
        account: "Bank Mandiri",
    },
    { id: "t4", description: "Grass-fed Butter & Dairy Supply", amount: 280000, type: "expense", category: "Ingredients", date: "2026-07-06", account: "Cash" },
    {
        id: "t5",
        description: "Custom Pastry Shop Counter Box Packaging",
        amount: 190000,
        type: "expense",
        category: "Packaging",
        date: "2026-07-08",
        account: "Bank BRI",
    },
    { id: "t6", description: "Daily Café Walk-in Pastry Sales", amount: 840000, type: "income", category: "Sales", date: "2026-07-10", account: "Cash" },
    {
        id: "t7",
        description: "Social Media Local Advertising Campaign",
        amount: 150000,
        type: "expense",
        category: "Marketing",
        date: "2026-07-12",
        account: "Bank BCA",
    },
    {
        id: "t8",
        description: "Pre-ordered Wholesale Croissant Contract",
        amount: 650000,
        type: "income",
        category: "Sales",
        date: "2026-07-14",
        account: "Bank Mandiri",
    },
    {
        id: "t9",
        description: "Industrial Oven Maintenance Service",
        amount: 220000,
        type: "expense",
        category: "Equipment Maintenance",
        date: "2026-07-15",
        account: "Bank BRI",
    },
];

export const ACCOUNTS = ["Cash", "Bank BCA", "Bank Mandiri", "Bank BRI", "Other Account"];

export const INITIAL_STOCK = [
    { id: "s1", name: "Premium Unbleached Bread Flour", sku: "FLR-O-001", category: "Ingredients", quantity: 24, minQuantity: 10, cost: 18500, price: 0 },
    {
        id: "s2",
        name: "European Style Unsalted Butter (Blocks)",
        sku: "DAI-B-004",
        category: "Ingredients",
        quantity: 8,
        minQuantity: 15,
        cost: 35000,
        price: 0,
    }, // Under-stocked!
    { id: "s3", name: "Madagascar Bourbon Vanilla Extract", sku: "EXT-V-012", category: "Ingredients", quantity: 4, minQuantity: 3, cost: 75000, price: 0 },
    { id: "s4", name: "Signature Baker Gift Box (Large)", sku: "PKG-B-201", category: "Packaging", quantity: 150, minQuantity: 50, cost: 1200, price: 4500 },
    { id: "s5", name: "Pre-made Royal Sourdough Starter", sku: "SDR-S-002", category: "Ingredients", quantity: 12, minQuantity: 5, cost: 5000, price: 15000 },
    { id: "s6", name: "Organic Cane Sugar (Bulk Sacks)", sku: "SGR-C-010", quantity: 30, minQuantity: 12, category: "Ingredients", cost: 12000, price: 0 },
    { id: "s7", name: "Premium Dark Chocolate Callets 70%", sku: "CHCO-D-500", category: "Ingredients", quantity: 6, minQuantity: 10, cost: 42000, price: 0 }, // Under-stocked!
];

export const INITIAL_BUDGETS = [
    { category: "Ingredients", limit: 1200000 },
    { category: "Utilities", limit: 400000 },
    { category: "Packaging", limit: 300000 },
    { category: "Marketing", limit: 250000 },
    { category: "Equipment Maintenance", limit: 500000 },
];

export const TRANSACTION_CATEGORIES = [
    "Sales",
    "Ingredients",
    "Utilities",
    "Packaging",
    "Marketing",
    "Equipment Maintenance",
    "Rent & Lease",
    "Insurance",
    "Software/SaaS",
    "Other",
];

export const STOCK_CATEGORIES = ["Ingredients", "Packaging", "Equipments", "Retail Products", "Other"];
