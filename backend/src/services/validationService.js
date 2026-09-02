/**
 * Validation Engine for extracted document data.
 * Contains configuration-driven rules for each document type.
 */

const documentRules = {
    PAN: {
        requiredFields: ['name', 'panNumber', 'dateOfBirth'],
        validators: {
            panNumber: (val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val)
        }
    },
    AADHAAR: {
        requiredFields: ['name', 'documentNumber'],
        validators: {
            documentNumber: (val) => /^\d{4}\s?\d{4}\s?\d{4}$/.test(val)
        }
    },
    PASSPORT: {
        requiredFields: ['name', 'passportNumber', 'dateOfBirth', 'expiryDate'],
        validators: {
            passportNumber: (val) => /^[A-Z][0-9]{7}$/.test(val)
        }
    },
    BUSINESS_REGISTRATION: {
        requiredFields: ['businessName', 'registrationNumber']
    },
    // Add other documents as needed
};

exports.validateDocumentData = (documentType, extractedData) => {
    let isValid = true;
    let issues = [];
    let isExpired = false;
    let validationStatus = 'VALID';

    const rules = documentRules[documentType];

    if (!rules) {
        return {
            isValid: true,
            issues: ['Unknown document type - no specific rules applied.'],
            isExpired: false,
            validationStatus: 'VALID'
        };
    }

    // Check required fields
    rules.requiredFields.forEach(field => {
        if (!extractedData[field]) {
            isValid = false;
            issues.push(`Missing required field: ${field}`);
        }
    });

    // Check specific formats if present
    if (rules.validators) {
        for (const [field, validator] of Object.entries(rules.validators)) {
            if (extractedData[field] && !validator(extractedData[field])) {
                isValid = false;
                issues.push(`Invalid format for field: ${field}`);
            }
        }
    }

    // Check Expiry (Phase 9)
    if (extractedData.expiryDate) {
        const expiry = new Date(extractedData.expiryDate);
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        if (expiry < now) {
            isExpired = true;
            isValid = false;
            issues.push('Document is EXPIRED.');
        } else if (expiry < thirtyDaysFromNow) {
            issues.push('Document is EXPIRING SOON.');
        }
    }

    if (!isValid) validationStatus = 'INVALID';
    if (isValid && issues.length > 0) validationStatus = 'WARNING';

    return {
        isValid,
        issues,
        isExpired,
        validationStatus
    };
};
