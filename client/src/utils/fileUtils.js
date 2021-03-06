import Promise from 'bluebird';
import { createHash } from 'crypto';
import nodedir from 'node-dir';
import fs from 'fs';

const encSuffix = '.enc';

export const readDir = (directory) => {
    return new Promise((resolve, reject) => {
        nodedir.files(directory, (err, files) => {
            if (err) return reject(err);
            return resolve(files);
        });
    });
};

export const createHashForFile = (readStream) => {
    return new Promise((resolve, reject) => {
        const hash = createHash('sha256');
        hash.setEncoding('hex');
        readStream.pipe(hash);
        hash.on('finish', () => {
            return resolve(hash.read());
        });
    });
};

export const checkExistence = (path) => {
    return new Promise((resolve, reject) => {
        fs.access(path, fs.F_OK, function (err) {
            if (err) reject(err);
            else resolve(true);
        });
    });
};

const indexOfSuffix = (fileName, suffix) => {
    return fileName.indexOf(suffix, fileName.length - suffix.length);
};

export const isFileEncrypted = (fileName) => {
    return indexOfSuffix(fileName, encSuffix) !== -1;
};

export const removeExtension = (fileName, extension) => {
    const extensionPos = indexOfSuffix(fileName, extension);
    return (extensionPos !== -1) ? fileName.substring(0, extensionPos) : fileName;
};

export const getUnencryptedFileName = (unknownFileName) => {
    return isFileEncrypted(unknownFileName) ? removeExtension(unknownFileName, encSuffix): unknownFileName;
}