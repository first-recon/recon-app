export function shouldExist (fieldName, field) {
    if (!field) {
        throw new TypeError(`${fieldName} must be defined, got ${field}`);
    }
}

export function shouldNotBeUndefinedOrNull (fieldName, field) {
    if (field === undefined || field === null) {
        throw TypeError(`${fieldName} must not be undefined or null, got ${field}`);
    }
}

export function shouldBeString (fieldName, field) {
    if (typeof field !== 'string') {
        throw new TypeError(`${fieldName} must be a string, got ${field}`);
    }
}

export function shouldBeBoolean (fieldName, field) {
    if (!(field === true || field === false)) {
        throw new TypeError(`${fieldName} must be a boolean, got ${field}`);
    }
}

export function shouldMatch (fieldName, field, regex) {
    if (!regex.test(field)) {
        throw new TypeError(`${fieldName} must match the provided format ${regex}`);
    }
}

export function shouldParseAsJson (fieldName, field) {
    try {
        JSON.parse(field);
    } catch (e) {
        throw new TypeError(`${fieldName} must be parsable as JSON`);
    }
}
