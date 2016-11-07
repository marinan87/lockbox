import Promise from 'bluebird'
import {createHash} from 'crypto'
import nodedir from 'node-dir'

export const readDir = (directory) => {
    return new Promise((resolve, reject) => {
        nodedir.files(directory, (err, files) => {
            if (err) return reject(err);
            return resolve(files)
        })
    })
};

export const createHashForFile = (readStream) => {
    return new Promise((resolve, reject) => {
        const hash = createHash('sha256');
        hash.setEncoding('hex');
        readStream.pipe(hash);
        hash.on('finish', () => {
            return resolve(hash.read())
        })
    })
};
