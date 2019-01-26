import FileSystem from "react-native-filesystem-v1";
import { deepClone } from "../utils";

let loading = {};

/**
 * Starts up the database
 * @param  {string} path     path to data file
 * @param  {array}  initData array of objects to initialize with (if null will load current db from path)
 */
export default function Collection(
  path = "",
  initData = [],
  autoSave = false,
  Model
) {
  if (!path.length) {
    throw new Error("Please provide a path for the database...");
  }

  const self = {
    data: null
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
    if (!self.data) {
      loading[path] = true;
      console.log('getData', path, initData, typeof initData);

      // try reading it off the disk
      return FileSystem.readFile(path, FileSystem.storage.extBackedUp)
        .then(rawText => {
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
          if (typeof initData === 'string') {
            return fetch(initData)
              .then(res => res.json())
              .then(({ results }) => {
                self.data = results;
                this.save(); // async but we don't care about waiting for it to finish
                loading[path] = false;
                return self.data;
              });
          } else {
            self.data = initData;
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
    return this.getData().then(data => {
      self.data = data.filter(item => item.id !== id);
      return this.save()
        .then(() => id);
    });
  };

  this.clear = () => {
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
