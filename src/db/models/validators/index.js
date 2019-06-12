export function shouldExist (fieldName, field) {
    if (!field) {
        throw new TypeError(`${fieldName} must be defined, got ${field}`);
    }
}

export function shouldNotBeUndefined (fieldName, field) {
    if (field === undefined) {
        throw TypeError(`${fieldName} must not be undefined`);
    }
}

export function shouldNotBeNull (fieldName, field) {
    if (field === null) {
        throw TypeError(`${fieldName} must not be null`);
    }
}

export function shouldNotBeUndefinedOrNull (fieldName, field) {
    shouldNotBeUndefined(fieldName, field);
    shouldNotBeNull(fieldName, field);
}

export function shouldBeString (fieldName, field) {
    if (typeof field !== 'string') {
        throw new TypeError(`${fieldName} must be a string, got ${field}`);
    }
}

export function shouldHaveLength (fieldName, field) {
    if (!field.length) {
        throw new TypeError(`${fieldName} must have length, got ${field.length}`);
    }
}

export function shouldBeNumber (fieldName, field) {
    if (typeof field !== 'number') {
        throw new TypeError(`${fieldName} must be a number, got ${field}`);
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

export function shouldBeAnyOf (fieldName, field, potentials) {
    if (!potentials.some(p => p === field)) {
        throw new TypeError(`${fieldName} should be any of [${potentials.join(', ')}] but is ${field}`);
    }
}
