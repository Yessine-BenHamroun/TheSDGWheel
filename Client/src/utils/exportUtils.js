// Utility functions for converting data to different export formats

// Convert array of objects to CSV format
export const convertToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    return { content: '', filename: `${filename}.csv` };
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas, quotes, or newlines
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  return {
    content: csvContent,
    filename: `${filename}.csv`,
    mimeType: 'text/csv'
  };
};

// Convert data to JSON format
export const convertToJSON = (data, filename = 'export') => {
  const jsonContent = JSON.stringify(data, null, 2);
  
  return {
    content: jsonContent,
    filename: `${filename}.json`,
    mimeType: 'application/json'
  };
};

// Convert multiple datasets to a combined format
export const convertMultipleDatasets = (datasets, format = 'json', baseFilename = 'sustainability_export') => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${baseFilename}_${timestamp}`;

  if (format === 'csv') {
    // For CSV, we'll create separate files for each dataset
    const csvFiles = [];
    
    Object.entries(datasets).forEach(([key, data]) => {
      if (data && data.length > 0) {
        const csvResult = convertToCSV(data, `${filename}_${key}`);
        csvFiles.push({
          name: key,
          ...csvResult
        });
      }
    });

    return csvFiles;
  } else if (format === 'json') {
    // For JSON, combine all datasets into one file
    return [convertToJSON(datasets, filename)];
  }

  return [];
};

// Download file utility
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ Downloaded: ${filename}`);
    return true;
  } catch (error) {
    console.error('❌ Download failed:', error);
    return false;
  }
};

// Download multiple files
export const downloadMultipleFiles = async (files) => {
  if (files.length === 1) {
    // Single file download
    const file = files[0];
    return downloadFile(file.content, file.filename, file.mimeType);
  }

  // Multiple files - download each with a small delay
  let success = true;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = downloadFile(file.content, file.filename, file.mimeType);
    success = success && result;
    
    // Small delay between downloads to prevent browser blocking
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return success;
};

// Format data for display
export const formatDataForDisplay = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  // Handle dates
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(formatDataForDisplay);
  }
  
  // Handle objects
  const formatted = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof Date) {
      formatted[key] = value.toISOString();
    } else if (value === null || value === undefined) {
      formatted[key] = '';
    } else if (typeof value === 'object' && value !== null) {
      // Convert nested objects to strings for CSV compatibility
      formatted[key] = JSON.stringify(value);
    } else {
      formatted[key] = value;
    }
  });
  
  return formatted;
};

// Get file size estimate
export const getFileSizeEstimate = (data, format = 'json') => {
  if (!data) return '0 KB';
  
  let content = '';
  if (format === 'json') {
    content = JSON.stringify(data);
  } else if (format === 'csv' && Array.isArray(data)) {
    const csvResult = convertToCSV(data);
    content = csvResult.content;
  }
  
  const bytes = new Blob([content]).size;
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
