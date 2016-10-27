import Promise from 'bluebird'
import DropboxClient from './api/dropboxApi.js'
import authData from '../dropbox-auth.json'
import fs from 'fs'
import _ from 'lodash'
import https from 'https'
import {readDir, createHash} from './utils/fileUtils.js'
import EthereumClient from './api/ethereum/ethereumApi.js'
import crypto from 'crypto'
import contractAddresses from '../contracts.json'

const HOME_DIR = process.env.HOME || process.env.USERPROFILE;
const FILE_DIR = `${HOME_DIR}/SmartsafeClient`;
const IGNORED_FILES = ['.DS_Store', 'temp'];

const dropboxClient = new DropboxClient(authData.key, authData.secret);
const ethereumClient = new EthereumClient(contractAddresses);

const syncFiles = (filesHashes, userFilesLocations) => {
    const userFiles = getUserFiles(userFilesLocations);
    const userFilesDataForUploadToDropbox = generateHashesForUserFiles(userFiles);
    uploadUserFileData(userFilesDataForUploadToDropbox, filesHashes);
    la(filesHashes);
};

const getUserFiles = function(userFilesLocations) {
    try {
        return userFilesLocations.map(filePath => {
            const readStream = fs.createReadStream(`${FILE_DIR}/${filePath}`);
            return new Promise((resolve, reject) => {
                resolve({filePath, readStream})
            })
        }).catch(console.log.bind(console))
    } catch (err) {
        console.log(err).bind(console);
        return Promise.reject(err)
    }
};

const generateHashesForUserFiles = function(userFiles) {
    try {
        return userFiles.map(userFile => {
            Promise.resolve(userFile).then((filePath, fileInfo) => {
                return new Promise((resolve, reject) => {
                    const fileHash = createHash(fileInfo);
                    resolve({filePath, fileHash});
                })
            })
        }).catch(console.log.bind(console))
    } catch (err) {
        console.log(err).bind(console);
        return Promise.reject(err)
    }
};

const uploadUserFileData = function(userFilesDataForUploadToDropbox, filesHashes) {
    const userFilesDataForUploadToEth
        = wrapFileMetaInfoFromResults(userFilesDataForUploadToDropbox, filesHashes, uploadUserFileDataToDropbox);
    wrapFileMetaInfoFromResults(userFilesDataForUploadToEth, filesHashes, uploadUserFileMetaDataToEth);
};

function fileHasBeenHashed (fileHash, filesHashes) {
    if (filesHashes.indexOf(fileHash) === -1) {
        throw new Error("Filehash " + fileHash + " cannot be found")
    }
}

const uploadUserFileDataToDropbox = function(filePath, fileHash, filesHashes) {
    if (fileHasBeenHashed(fileHash, filesHashes)) {
        return dropboxClient
            .upload(`${FILE_DIR}/${filePath}`, `/${filePath}`);
    }
};

const uploadUserFileMetaDataToEth = function(filePath, fileDropboxUploadMetaDeta, filesHashes) {
    if (fileHasBeenHashed(fileDropboxUploadMetaDeta, filesHashes)) {
        return ethereumClient
            .addFile(fileDropboxUploadMetaDeta, fileDropboxUploadMetaDeta.url, filePath);
    }
};

const wrapFileMetaInfoFromResults = function(startingMap, filesHashes, syncFunction) {
    try {
        return startingMap.map(startingMapValues => {
            Promise.resolve(startingMapValues).then((filePath, fileInfo) => {
                return new Promise((resolve, reject) => {
                    resolve(syncFunction(filePath, fileInfo, filesHashes));
                })
            })
        }).catch(console.log.bind(console))
    } catch (err) {
        console.log(err).bind(console);
        return Promise.reject(err)
    }
};

const la = function (filesHashes) {
    filesHashes.forEach(hash => {
        if (!_.find(results, {hash})) {
            ethereumClient.getFile(hash).then(file => {
                const dlUrl = dropboxClient.getDirectDownloadLink(file.link);
                const filePath = dropboxClient.getFilePathFromUrl(dlUrl);
                const fileStream = fs.createWriteStream(`${FILE_DIR}/${filePath}`);
                https.get(dlUrl, res => {
                    res.pipe(fileStream)
                })
            })
        }
    })
};

dropboxClient.authenticate().then(() => {
    return readDir(FILE_DIR)
        }).then((files) => {
            const userFiles = files.filter((file) => {
                return IGNORED_FILES.indexOf(file) === -1
            });

            ethereumClient.getUserFiles().then(hashes => syncFiles(hashes, userFiles))
        }).catch(e => console.log(e));
