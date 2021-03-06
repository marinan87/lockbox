import fileReducer from '../../src/reducers/fileReducer'
import * as FileActions from '../../src/actions/FileActions'

import * as chai from 'chai'
import chaiSubset from 'chai-subset'
chai.should()
chai.use(chaiSubset)

describe('fileReducer', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            isLoading: false,
            userFiles: [],
            detailedFile: {},
            uploadQueue: []
        }
    });

    it('should return the initial state if no state is passed', () => {
        fileReducer(undefined, {}).should.deep.equal(initialState)
    });

    describe('SET_FILES', () => {
        it('should set userFiles to empty array', () => {
            const initialState = {
                userFiles: [
                    {
                        id: 1,
                        name: 'file to be removed'
                    }
                ]
            };

            const state = fileReducer(initialState, FileActions.setFiles([]));

            (state.userFiles).should.be.empty;
        });

        it('should set userFiles to passed non-empty array', () => {
            const initialState = {
                userFiles: []
            };
            const files = [
                {
                    id: 1,
                    name: 'New file'
                }, {
                    id: 2,
                    name: 'Another new file'
                }
            ];

            const state = fileReducer(initialState, FileActions.setFiles(files));

            (state.userFiles).should.have.lengthOf(files.length);
            (state.userFiles).should.deep.equal(files);
        });
    });

    describe('SET_DETAIL', () => {
        beforeEach(() => {
            initialState.userFiles = [
                {
                    id: 1,
                    name: 'Existing file'
                }, {
                    id: 2,
                    name: 'Another file'
                }
            ];
        });

        it('should set file from userFiles with given id as detailedFile', () => {
            const state = fileReducer(initialState, FileActions.setDetail(1));

            (state.detailedFile).should.deep.equal(initialState.userFiles[0]);
        });

        it('should not modify userFiles', () => {
            const state = fileReducer(initialState, FileActions.setDetail(1));

            (state.userFiles).should.deep.equal(initialState.userFiles);
        });

        it('should set detailedFile to {} if no file with id is found', () => {
            const state = fileReducer(initialState, FileActions.setDetail(1234567));

            (state.detailedFile).should.be.empty;
            (state.detailedFile).should.be.an('object');
        });

        it('should set detailedFile to {} if id is null', () => {
            const state = fileReducer(initialState, FileActions.setDetail(null));

            (state.detailedFile).should.be.empty;
            (state.detailedFile).should.be.an('object');
        });

        it('should set detailedFile to {} if id is empty', () => {
            const state = fileReducer(initialState, FileActions.setDetail());

            (state.detailedFile).should.be.empty;
            (state.detailedFile).should.be.an('object');
        });

        it('should set detailedFile to {} if id is undefined', () => {
            const state = fileReducer(initialState, FileActions.setDetail(undefined));

            (state.detailedFile).should.be.empty;
            (state.detailedFile).should.be.an('object');
        });
    });

    describe('ADD_FILE_TO_UPLOAD_QUEUE', () => {
        beforeEach(() => {
            initialState.uploadQueue = [
                {
                    path: '/staryway/to/heaven'
                }
            ];
        });

        it('should add new file to existing ones in upload queue', () => {
            const newFile = {
                path: '/road/to/hell'
            };

            const state = fileReducer(initialState, FileActions.addFileToUploadQueue(newFile));

            (state.uploadQueue).should.have.lengthOf(initialState.uploadQueue.length + 1);
            // array should contain new file object
            (state.uploadQueue).should.containSubset([newFile]);
        });

        it('should create new file in queue with default properties', () => {
            const newFile = {
                path: '/road/to/hell.mp3'
            };

            const state = fileReducer(initialState, FileActions.addFileToUploadQueue(newFile));
            const addedFile = state.uploadQueue[1];

            (addedFile).should.have.property('progress', 0);
            (addedFile).should.have.property('isComplete', false);
            (addedFile).should.have.property('isUploadInProgress', false);
            (addedFile).should.have.property('name', 'hell.mp3');
            (addedFile).should.have.property('dir', '/road/to');
        });
    });

    describe('REMOVE_FILE_FROM_UPLOAD_QUEUE', () => {
        beforeEach(() => {
            initialState.uploadQueue = [
                {
                    path: '/staryway/to/heaven',
                    name: 'heaven'
                }, {
                    path: '/road/to/hell',
                    name: 'hell'
                }
            ]
        });

        it('should remove file from upload queue', () => {
            const file = initialState.uploadQueue[0];
            const state = fileReducer(initialState, FileActions.removeFileFromUploadQueue(file));

            (state.uploadQueue).should.have.lengthOf(initialState.uploadQueue.length - 1);
            (state.uploadQueue).should.not.deep.include.members([file]);
        });

        it('should return upload queue unchanged if file with name was not found', () => {
            const file = {
                path: 'to/nonexistent',
                name: 'nonexistent'
            };
            const state = fileReducer(initialState, FileActions.removeFileFromUploadQueue(file));

            (state.uploadQueue).should.deep.equal(initialState.uploadQueue);
        });
    });

    describe('START_UPLOAD', () => {
        beforeEach(() => {
            initialState.uploadQueue = [
                {
                    path: '/staryway/to/heaven',
                    name: 'heaven',
                    progress: 0,
                    isUploadInProgress: false,
                    isComplete: false
                }, {
                    path: '/road/to/hell',
                    name: 'hell',
                    progress: 0,
                    isUploadInProgress: false,
                    isComplete: false
                }
            ]
        });

        it('should set isUploadInProgress to true for chosen file', () => {
            const file = initialState.uploadQueue[1];
            const state = fileReducer(initialState, FileActions.setStartUpload(file));

            (state.uploadQueue[1].isUploadInProgress).should.be.true;
        });

        it('should not change isUploadInProgress status for other files', () => {
            const file = initialState.uploadQueue[1];
            const state = fileReducer(initialState, FileActions.setStartUpload(file));

            (state.uploadQueue[0].isUploadInProgress).should.not.be.true;
        });
    });

    describe('UPLOAD_FINISHED', () => {
        beforeEach(() => {
            initialState.uploadQueue = [
                {
                    path: '/staryway/to/heaven',
                    name: 'heaven',
                    progress: 0,
                    isUploadInProgress: true,
                    isComplete: false
                }, {
                    path: '/road/to/hell',
                    name: 'hell',
                    progress: 0,
                    isUploadInProgress: true,
                    isComplete: false
                }
            ]
        });

        it('should set isUploadInProgress to false for chosen file', () => {
            const file = initialState.uploadQueue[1];
            const state = fileReducer(initialState, FileActions.setUploadFinished(file));

            (state.uploadQueue[1].isUploadInProgress).should.not.be.true;
        });

        it('should set isComplete to true and progress to 100 for chosen file', () => {
            const file = initialState.uploadQueue[1];
            const state = fileReducer(initialState, FileActions.setUploadFinished(file));

            (state.uploadQueue[1].isComplete).should.be.true;
            (state.uploadQueue[1].progress).should.equal(100);
        });
    });

    describe('SET_FILE_PROTECTION_STATUS', () => {
        beforeEach(() => {
            initialState.userFiles = [
                {
                    id: 'randomid',
                    name: 'heaven',
                    status: 'protected',
                    eth: { hash: 'hash', link: 'link' }
                },
                {
                    id: 'anotherrandomid',
                    name: 'hell',
                    status: 'faulty',
                    eth: null
                },
                {
                    id: 'thirdid',
                    name: 'earth',
                    status: 'unprotected',
                    eth: null
                }
            ]
        });

        it('should return all user files', () => {
            const newStatus = 'protected';
            let file = initialState.userFiles[2];
            file.eth = { hash: 'hash', link: 'link' };
            const state = fileReducer(initialState, FileActions.setFileProtectionStatus(file, newStatus));

            (state.userFiles).should.have.lengthOf(initialState.userFiles.length);
        });

        it('should set file status to desired status', () => {
            const newStatus = 'protected';
            let file = initialState.userFiles[2];
            file.eth = { hash: 'hash', link: 'link' };
            const state = fileReducer(initialState, FileActions.setFileProtectionStatus(file, newStatus));

            (state.userFiles[2].status).should.equal(newStatus);
        });

        it('should not change other files', () => {
            const newStatus = 'protected';
            let file = initialState.userFiles[2];
            file.eth = { hash: 'hash', link: 'link' };
            const state = fileReducer(initialState, FileActions.setFileProtectionStatus(file, newStatus));

            (state.userFiles[1].status).should.not.equal(newStatus);
        });

        it('should not break if file is not found and not change any status', () => {
            const newStatus = 'protected';
            const nonExistingFile = {
                id: 'nonexistentid', name: 'not there', status: 'unprotected',
                eth: { hash: 'hash', link: 'link' }
            };

            const state = fileReducer(initialState, FileActions.setFileProtectionStatus(nonExistingFile, newStatus));

            // not testing userFiles[0] because it already has protected status
            (state.userFiles[1].status).should.not.equal(newStatus);
            (state.userFiles[2].status).should.not.equal(newStatus);
        });

        it('should add file link hash if new status is protected', () => {
            const newStatus = 'protected';
            const hash = 'randomhash';
            let file = initialState.userFiles[2];
            file.eth = {
                hash: 'randomhash',
                link: 'link'
            }
            const state = fileReducer(initialState, FileActions.setFileProtectionStatus(file, newStatus));

            (state.userFiles[2].status).should.equal(newStatus);
            (state.userFiles[2].eth).should.deep.equal(file.eth);
        });
    });
});