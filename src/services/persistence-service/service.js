import DbClient from '../../db/client';

const byName = (expectedName) => ({ name }) => name === expectedName;

// temporary storage for a variety of application state
function PersistenceService() {
    const database = new DbClient();
    this.collection = database.persistenceCollection;
}

PersistenceService.prototype.get = function(name) {
    return this.collection.find(byName(name));
};

PersistenceService.prototype.update = function(name, value) {
    return this.collection.find(byName(name))
        .then(({ id }) => this.collection.update(id, { value }));
};

PersistenceService.prototype.deleteAll = function () {
    return this.collection.deleteAll();
}

export default PersistenceService;