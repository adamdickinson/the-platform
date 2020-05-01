import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';
import * as engine from 'store/src/store-engine';

import * as fs from 'fs';

const createFileStore = (filePath = 'data.json') => {
  let data: Record<string, any> | undefined;

  const getData = () => {
    if (!data) {
      data = fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        : {};
    }

    return data;
  };

  const read = (key: string) => get(getData(), key);

  const write = (key: string, value: any) => {
    const data = getData();
    set(data, key, value);
    fs.writeFileSync(filePath, JSON.stringify(data));
  };

  const each = (callback: (value: any, key: string) => void) => {
    Object.entries(getData()).forEach(([key, value]) => callback(value, key));
  };

  const remove = (key: string) => {
    const data = getData();
    unset(data, key);
    fs.writeFileSync(filePath, JSON.stringify(data));
  };

  const clearAll = () => {
    data = {};
    fs.writeFileSync(filePath, JSON.stringify(data));
  };

  return {
    name: 'filestore',
    read,
    write,
    each,
    remove,
    clearAll,
  };
};

export const createStore = (filePath?: string) =>
  engine.createStore([createFileStore(filePath)], []);
