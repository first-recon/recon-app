import FileSystem from "react-native-filesystem-v1";
import { deepClone } from "../utils";

let loading = {};

/**
 * Starts up the database
 * @param  {string}  path       path to data file
 * @param  {array}   initDataOrRemoteUrl   array of objects to initialize with or url to send http request to
 * @param  {object}  Model      model to assist with enforcing data consistency (optional)
 * @param  {boolean} isReadOnly mark collection as readonly (will throw on attempts to modify)
 */
export default function Collection(
  path = "",
  initDataOrRemoteUrl = [],
  Model,
  isReadOnly
) {
  if (!path.length) {
    throw new Error("Please provide a path for the database...");
  }

  const self = {
    data: null,
    isReadOnly: isReadOnly,
    shouldRetryRemoteFetch: false
  };

  this.getData = () => {
    // check if this file path is currently being loaded
    if (loading[path]) {
      // if so, wait 10 ms and try getting it again
      return new Promise(done =>
        setTimeout(() => this.getData().then(done), 10)
      );
    }

    // if our data object is not initialized, do so
    if (!self.data || self.shouldRetryRemoteFetch) {
      loading[path] = true;
      console.log('getData', path, initDataOrRemoteUrl, typeof initDataOrRemoteUrl);

      // try reading it off the disk
      return FileSystem.readFile(path, FileSystem.storage.extBackedUp)
        .then(rawText => {
          if (self.shouldRetryRemoteFetch) {
            throw new Error('re-trying fetch from server...');
          }
          try {
            const d = JSON.parse(rawText);

            if (typeof d === 'object' && d.length) {
              console.log(path, 'successfully loaded data from disk');
              self.data = d;
            } else {
              return Promise.reject('failed to load from disk');
            }

            loading[path] = false;

            // if there is no data on disk, we need to save our preset data
            if (!d.length) {
              this.save();
            }
          } catch (e) {
            throw new Error("failed parsing json file: " + path);
          }

          return self.data;
        })

        // if that fails, try loading from the server
        .catch(error => {
          if (typeof initDataOrRemoteUrl === 'string') {
            return fetch(initDataOrRemoteUrl)
              .then(res => res.json())
              .then(({ results }) => {
                self.data = results;
                this.save(); // async but we don't care about waiting for it to finish
                loading[path] = false;
                self.shouldRetryRemoteFetch = false;
                return self.data;
              })

              // failed to load from server
              .catch(err => {
                self.isReadOnly = true;
                self.shouldRetryRemoteFetch = true;

                self.data = [];
                console.log('ERROR:', 'unable to communicate with server');
              });
          } else {
            self.data = initDataOrRemoteUrl;
          }

          return this.save().then(() => {
            loading[path] = false;
            return Promise.resolve(self.data);
          });
        });
    }

    return Promise.resolve(self.data);
  };

  this.getAll = () => {
    return this.getData()
      .then(data =>
        data.map(item => Model ? new Model(item).data : item));
  };

  this.getById = id => {
    return this.getData().then(data => data.find(item => item.id === id));
  };

  this.find = searchFunc => {
    return this.getData().then(data => data.find(searchFunc));
  };

  this.filter = params => {
    // check if b hasValues of a
    function hasValues(a, b) {
      const aKeys = Object.keys(a);
      let isResult = true;
      aKeys.forEach(key => {
        if (b[key] !== a[key]) {
          isResult = false;
        }
      });

      return isResult;
    }

    return this.getData()
      .then(data =>
        data
          .filter(item => hasValues(params, item))
          .map(item => Model ? new Model(item).data : item)
      );
  };

  this.add = item => {
    if (self.isReadOnly) {
      throw Error({
        name: 'DbReadOnlyError',
        message: 'This collection cannot be modified'
      });
    }
    // TODO: make a better id generator
    const itemWithId = item;
    itemWithId.id = Date.now();
    const itemToInsert = Model ? (new Model(itemWithId)).data : itemWithId;
    return this.getData()
      .then(data => {
        self.data = deepClone(
          data.concat(itemToInsert)
        );
        return this.save();
      })
      .then(() => itemToInsert);
  };

  // updates the item with the provided id to have the fields with values in
  // modifiedFields. if an id field is included it will be deleted
  this.update = (id, modifiedFields) => {
    if (self.isReadOnly) {
      throw Error({
        name: 'DbReadOnlyError',
        message: 'This collection cannot be modified'
      });
    }
    const newObject = {
      ...(Model ? (new Model(modifiedFields)).data : modifiedFields),
      id
    };

    return this.getData().then(data => {
      const currentItemIndex = data.findIndex(item => item.id === id);
      if (currentItemIndex < 0) {
        return Promise.reject({
          name: "DbUpdateOpError",
          message: "Cannot find index for item to modify"
        });
      }
      const currentItem = data[currentItemIndex];
      data[currentItemIndex] = Object.assign({}, currentItem, newObject);
      self.data = deepClone(data);
      return this.save()
        .then(() => this.getById(id));
    });
  };

  this.remove = id => {
    if (self.isReadOnly) {
      throw Error({
        name: 'DbReadOnlyError',
        message: 'This collection cannot be modified'
      });
    }
    return this.getData().then(data => {
      self.data = data.filter(item => item.id !== id);
      return this.save()
        .then(() => id);
    });
  };

  this.clear = (force) => {
    if (self.isReadOnly && !force) {
      throw Error({
        name: 'DbReadOnlyError',
        message: 'This collection has been marked as read-only. You can pass force=true to force clear'
      });
    }
    self.data = [];
    return this.save();
  };

  this.save = () => {
    // if there is no data currently loaded, initialize it to an empty array and
    // write that out
    let dataToWrite = self.data;
    if (!dataToWrite) {
      dataToWrite = [];
      self.data = dataToWrite;
    }

    return FileSystem.writeToFile(
      path,
      JSON.stringify(dataToWrite),
      false,
      FileSystem.storage.extBackedUp
    );
  };

  this.reload = () => {
    self.data = null;
  };

  this.exportCSV = () => {
    return this.getData().then(data => {
      const models = data.map(el => new Model(el));
      const rows = models.map(m => m.toCSV());
      return [Model.getCSVHeaders()].concat(rows).join("\n");
    });
  };
}
