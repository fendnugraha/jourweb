import * as XLSX from "xlsx";

/**
 * Utility reusable untuk export data ke file Excel (.xlsx)
 *
 * @param {Array<Object>} data - Array of objects data yang ingin diexport
 * @param {string} fileName - Nama file output (tanpa atau dengan ekstensi .xlsx)
 * @param {string} sheetName - Nama sheet di dalam file Excel (default: "Sheet1")
 */
export const exportToExcel = (data, fileName = "export_data", sheetName = "Sheet1") => {
    if (!data || data.length === 0) {
        console.warn("Export Excel dibatalkan: Data kosong.");
        return;
    }

    try {
        // 1. Buat worksheet dari data JSON
        const worksheet = XLSX.utils.json_to_sheet(data);

        // 2. Buat workbook baru
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // 3. Pastikan ekstensi file berakhiran .xlsx
        const finalFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;

        // 4. Trigger download file di browser
        XLSX.writeFile(workbook, finalFileName);
    } catch (error) {
        console.error("Gagal melakukan export Excel:", error);
    }
};
