export const validateField = (value, colName, schema) => {
    // Find the column schema for the given column name
    const column = schema.columns.find(col => col.name === colName);

    // Check if column is defined
    if (!column) return 'Column schema not found';

    // Validation for strings with minimum and maximum length
    if (column.type === 'string') {
        // Check if value is empty or invalid for strings
        if (typeof value !== 'string' || value.trim() === '') {
            return `${colName} must be a non-empty string`;
        }

        // Check if the string meets the minimum length requirement (e.g., 2 characters)
        if (value.length < 2) {
            return `${colName} must be at least 2 characters long`;
        }

        // Check if the string exceeds the maximum length requirement (e.g., 10 characters)
        if (value.length > 20) {
            return `${colName} must be no longer than 20 characters`;
        }
    }

    // Validation for numbers
    if (column.type === 'integer') {
        // Check if value is empty
        if (value.trim() === '') {
            return `${colName} cannot be empty`;
        }

        // Check if value is a valid number
        if (isNaN(value)) {
            return `${colName} must be a valid number`;
        }
        // Check if the number is positive (greater than 0)
        const numValue = Number(value);
        if (numValue <= 0) {
            return `${colName} must be a positive number`;
        }

        // Check if the number has at least 2 digits and at most 10 digits
        if (value.length < 2 || value.length > 10) {
            return `${colName} must have between 2 and 10 digits`;
        }
    }

    // Validation for dates
    if (column.type === 'date') {
        // Check if value is empty
        if (value.trim() === '') {
            return `${colName} cannot be empty`;
        }

        // Check if value is a valid date
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
            return `${colName} must be a valid date`;
        }
    }
    // If all validations pass, return true
    return true;
};
