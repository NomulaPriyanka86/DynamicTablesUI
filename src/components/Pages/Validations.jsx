export const validateField = (value, columnName, schema) => {
    console.log(`Validating ${columnName} with value:`, value);  // Debugging
    const column = schema.columns.find(col => col.name === columnName);

    if (column && column.validation) {
        switch (column.type) {
            case 'string':
                if (!value || String(value).trim() === '') {
                    return `${columnName} is required and cannot be empty`;
                }
                break;

            case 'number':
                if (isNaN(value)) {
                    return `${columnName} must be a valid number`;
                }
                break;

            case 'date':
                // Check for empty values explicitly
                if (!value || String(value).trim() === '') {
                    return `${columnName} is required and cannot be empty`;
                }

                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return `${columnName} must be a valid date`;
                }
                break;

            default:
                return true;
        }
    }

    return true;
};
