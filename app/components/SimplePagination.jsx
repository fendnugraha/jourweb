import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";

const SimplePagination = ({ totalItems, itemsPerPage, currentPage, onPageChange, className }) => {
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Handle page change
    const goToPage = (page) => {
        if (page > 0 && page <= totalPages) {
            onPageChange(page); // Pass back the new page to the parent component
        }
    };

    // Generate the page numbers to display
    const generatePageNumbers = () => {
        const pageNumbers = [];
        const range = 2; // Number of pages to display before and after the current page

        if (totalPages <= 5) {
            // If there are less than or equal to 5 pages, display all pages
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show the first page
            pageNumbers.push(1);

            // Add ellipsis if necessary
            if (currentPage - range > 2) {
                pageNumbers.push("...");
            }

            // Add pages before and after the current page within the range
            for (let i = Math.max(2, currentPage - range); i <= Math.min(totalPages - 1, currentPage + range); i++) {
                pageNumbers.push(i);
            }

            // Add ellipsis if necessary
            if (currentPage + range < totalPages - 1) {
                pageNumbers.push("...");
            }

            // Always show the last page
            if (totalPages > 1) {
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    return (
        <>
            <div className={`flex justify-end text-xs gap-1 items-center mt-3 ${className}`}>
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-white dark:text-slate-700 bg-slate-600 dark:bg-slate-400 rounded-lg py-1 px-4 disabled:text-slate-300 disabled:bg-slate-400 disabled:dark:bg-slate-600 cursor-pointer focus:scale-95"
                >
                    <ChevronLeftIcon size={16} />
                </button>
                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-white dark:text-slate-700 bg-slate-600 dark:bg-slate-400 rounded-lg py-1 px-4 disabled:text-slate-300 disabled:bg-slate-400 disabled:dark:bg-slate-600 cursor-pointer focus:scale-95"
                >
                    <ChevronRightIcon size={16} />
                </button>
            </div>
        </>
    );
};

export default SimplePagination;
