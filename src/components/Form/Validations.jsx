const inferValidationRule = (key, sampleValue, options = {}) => {
    let validationRule;
    const {
        minDigits = 0, // Default minimum digits
        maxDigits = Infinity, // Default maximum digits (no limit)
        minChars = 0, // Default minimum characters for strings
        maxChars = Infinity, // Default maximum characters for strings (no limit)
        allowNegative = false,
        allowZero = false,
        minDate, // Optional minimum date for validation
        maxDate // Optional maximum date for validation
    } = options; // Additional options for validation

    // For string fields
    if (typeof sampleValue === 'string') {
        validationRule = (value) => {
            if (value.length === 0) {
                return `${key} should not be empty.`; // String validation
            }
            // Validate the number of characters
            if (value.length < minChars) {
                return `${key} must have at least ${minChars} characters.`; // Minimum characters check
            }
            if (value.length > maxChars) {
                return `${key} must have no more than ${maxChars} characters.`; // Maximum characters check
            }
            return true; // Return true if valid
        };
    }

    // For numeric fields
    if (typeof sampleValue === 'number') {
        validationRule = (value) => {
            if (isNaN(value) || value === '') {
                return `${key} must be a valid number and cannot be empty.`; // Number validation
            }

            const numberValue = parseFloat(value); // Convert the value to a number for validation checks
            const numberOfDigits = value.replace('.', '').length; // Count digits

            // Validate the number of digits
            if (numberOfDigits < minDigits) {
                return `${key} must have at least ${minDigits} digits.`; // Minimum digits check
            }
            if (numberOfDigits > maxDigits) {
                return `${key} must have no more than ${maxDigits} digits.`; // Maximum digits check
            }

            // Additional checks for negative and zero values
            if (!allowNegative && numberValue < 0) {
                return `${key} must be a non-negative number.`; // No negative numbers allowed
            }
            if (!allowZero && numberValue === 0) {
                return `${key} must be a positive number.`; // No zero allowed if allowZero is false
            }
            return true; // Return true if valid
        };
    }

    // Specific validation for createdOn, updatedOn, and approvedOn
    if (key === 'createdOn' || key === 'updatedOn' || key === 'approvedOn') {
        validationRule = (value) => {
            if (typeof value !== 'string' || value.length === 0) {
                return `${key} should not be empty and must be a valid date string.`; // Date validation
            }

            // Check if the date format is valid (e.g., DD-MM-YYYY)
            const regex = /^\d{2}-\d{2}-\d{4}$/;
            if (!regex.test(value)) {
                return `${key} must be in the format DD-MM-YYYY.`; // Format validation
            }

            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return `${key} must be a valid date.`; // Invalid date check
            }

            // Check against optional min and max date
            if (minDate && date < new Date(minDate)) {
                return `${key} cannot be earlier than ${minDate}.`; // Minimum date check
            }
            if (maxDate && date > new Date(maxDate)) {
                return `${key} cannot be later than ${maxDate}.`; // Maximum date check
            }

            return true; // Return true if valid
        };
    }

    // Specific validation for status
    if (key === 'status') {
        validationRule = (value) => {
            // Check if value is a string and not empty
            if (typeof value !== 'string' || value.length === 0) {
                return `${key} should not be empty and must be a valid string.`; // Check for empty string
            }

            // Validate that the value is strictly 'Approved', 'Pending', or 'Rejected'
            const validStatuses = ['Approved', 'Pending', 'Rejected'];
            if (!validStatuses.includes(value)) {
                return `${key} must be either 'Approved', 'Pending', or 'Rejected'. No other values are allowed.`; // Status validation
            }

            // If all checks pass, return true
            return true;
        };
    }
    // Specific validation for kyc_type
    if (key === 'kyc_type') {
        validationRule = (value) => {
            // Check if value is a string and not empty
            if (typeof value !== 'string' || value.length === 0) {
                return `${key} should not be empty and must be a valid string.`; // Check for empty string
            }

            const validKycTypes = ['aadhaar', 'voter id', 'pan', 'driving license', 'passport']; // Lowercase for comparison
            if (!validKycTypes.includes(value.toLowerCase())) {
                return `${key}should be one of: Aadhaar, Voter Id, Pan, Driving License, Passport.`;
            }
            return true;
        };
    }

    // Default validation for other types
    if (!validationRule) {
        validationRule = () => true;
    }

    return validationRule;
};

export default inferValidationRule;
