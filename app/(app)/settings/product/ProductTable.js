import Modal from "@/app/components/Modal";
import Notification from "@/app/components/Notification";
import { useCategoryProducts } from "@/app/hooks/useCategoryProduct";
import useProducts from "@/app/hooks/useProducts";
import { formatNumber } from "@/app/utils/format";
import {
  Package,
  Tag,
  DollarSign,
  Coins,
  ShieldCheck,
  Edit2,
  Search,
  Box,
  Plus,
} from "lucide-react";
import { useState } from "react";
import CreateProduct from "./CreateProduct";
import EditProduct from "./EditProduct";
import Dropdown from "@/app/components/Dropdown";

const ProductTable = () => {
  const { products, loading, mutate } = useProducts();
  const { categoryProducts } = useCategoryProducts();
  const [category, setCategory] = useState("all");
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalName, setModalName] = useState("create");
  const [modalTitle, setModalTitle] = useState("");

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categoryProducts.map((cat) => ({ value: cat.name, label: cat.name })),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Notification
        message={notification}
        onClose={() => setNotification(null)}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        {/* Left Side Filters */}
        <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
              <Search className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              aria-label="Search stock item list"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <Dropdown
              id="product-status-filter"
              label="product Status Filter"
              options={categoryOptions}
              selectedValue={category}
              onChange={(val) => setCategory(val)}
              ariaLabel="Filter products by category"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs font-bold shrink-0">
            <Box className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{filteredProducts?.length || 0}</span>
            <span className="text-indigo-500/80 font-medium">Products</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setModalTitle("Create Product");
              setModalName("create");
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Product</span>
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                <th scope="col" className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>Product Name</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Price</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Cost</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Status</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
              {filteredProducts?.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    {/* 1. Nama & Kategori Produk */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {product.name}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-medium text-slate-600 dark:text-slate-400">
                          {product.category || "Uncategorized"}
                        </span>
                      </div>
                    </td>

                    {/* 2. Price (Harga Jual) */}
                    <td className="px-5 py-4 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                      {formatNumber(product.price)}
                    </td>

                    {/* 3. Cost (Harga Modal) */}
                    <td className="px-5 py-4 text-right font-mono text-slate-500 dark:text-slate-400">
                      {formatNumber(product.cost)}
                    </td>

                    {/* 4. Status Badge */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          product.is_active || product.status === "active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            product.is_active || product.status === "active"
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-rose-500"
                          }`}
                        />
                        {product.is_active || product.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    {/* 5. Action Button */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setModalTitle("Edit Product");
                          setModalName("edit");
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty State jika data kosong */
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                      <p className="text-xs font-medium">
                        Tidak ada data produk ditemukan.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        maxWidth="max-w-md"
      >
        {modalName === "create" && (
          <CreateProduct
            isModalOpen={setIsModalOpen}
            categoryProducts={categoryProducts}
            notification={setNotification}
            mutate={mutate}
          />
        )}
        {modalName === "edit" && (
          <EditProduct
            key={selectedProduct?.id}
            product={selectedProduct}
            categoryProducts={categoryProducts}
            isModalOpen={setIsModalOpen}
            notification={setNotification}
            mutate={mutate}
          />
        )}
      </Modal>
    </>
  );
};

export default ProductTable;
