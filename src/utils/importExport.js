// Utility functions for import/export data

export const exportToJSON = (data, filename) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (err) {
        reject(new Error("File không đúng định dạng JSON"));
      }
    };
    reader.onerror = () => reject(new Error("Không thể đọc file"));
    reader.readAsText(file);
  });
};

export const exportToCSV = (data, filename, headers) => {
  // Convert data to CSV format
  const csvRows = [];

  // Add headers
  if (headers) {
    csvRows.push(headers.join(","));
  }

  // Add data rows
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle special characters and commas
      if (value === null || value === undefined) return "";
      const strValue = String(value);
      if (
        strValue.includes(",") ||
        strValue.includes('"') ||
        strValue.includes("\n")
      ) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    });
    csvRows.push(values.join(","));
  });

  const csvStr = csvRows.join("\n");
  const blob = new Blob(["\uFEFF" + csvStr], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const createBackup = (data, name) => {
  const backup = {
    timestamp: new Date().toISOString(),
    version: "1.0",
    name: name,
    data: data,
  };
  exportToJSON(backup, `backup_${name}`);
};
