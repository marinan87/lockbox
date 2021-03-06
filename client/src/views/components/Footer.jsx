import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { lightGreenA400, amberA400, deepOrangeA400 } from 'material-ui/styles/colors';

import _ from 'lodash';

import * as Actions from '../../actions';
import { statusLevel } from '../../actions/StatusActions';

import { ipcRenderer } from 'electron';

const style = {
    indicatorGreen: {
        backgroundColor: lightGreenA400,
        boxShadow: `0px 0px 2px ${lightGreenA400}`
    },
    indicatorOrange: {
        backgroundColor: amberA400,
        boxShadow: `0px 0px 2px ${amberA400}`
    },
    indicatorRed: {
        backgroundColor: deepOrangeA400,
        boxShadow: `0px 0px 2px ${deepOrangeA400}`
    }
};

export class Footer extends React.Component {

    constructor(params) {
        super(params);
        this.setUpListeners();
        this.setUpClickHandlers();
    }

    setUpListeners() {
        ipcRenderer.on('status-messages', (event, msg) => {
            this.props.actions.setStatusText(msg);
        });

        ipcRenderer.on('set-storage-status', (event, statusStr, description) => {
            const status = this.getStatusFromText(statusStr);
            this.props.actions.setStorageStatus(status, description);
        });

        ipcRenderer.on('set-ethereum-status', (event, statusStr, description) => {
            const status = this.getStatusFromText(statusStr);
            this.props.actions.setEthereumStatus(status, description);
        });
    }

    setUpClickHandlers() {}

    getStatusFromText(text) {
        let status;
        switch (text) {
            case 'ok':
                status = statusLevel.OK;
                break;
            case 'warning':
                status = statusLevel.WARNING;
                break;
            case 'error':
                status = statusLevel.ERROR;
                break;
            default:
                status = statusLevel.ERROR;
        }
        return status;
    }

    render() {
        let ethStatus = this.props.ethereum.status,
            ethMessage = this.props.ethereum.description;
        let storageStatus = this.props.storage.status,
            storageMessage = this.props.storage.description;

        return (
            <footer className="app-footer row row--no-margin middle-xs">
              <div className="col-xs-12">
                <div className="row row--no-margin">
                  <div className="col-xs-10 center-xs">
                    { this.props.message }
                  </div>
                  <div className="col-xs-1 end-xs">
                    <div className="tooltip"> Ethereum
                      <div className="indicator" style={ ethStatus === statusLevel.ERROR ?
                                   style.indicatorRed :
                                   (ethStatus === statusLevel.WARNING ?
                                       style.indicatorOrange :
                                       style.indicatorGreen) }>
                        <span className="tooltip__text">{ ethMessage }</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-xs-1 start-xs">
                    <div className="tooltip"> Dropbox
                      <div className="indicator" style={ storageStatus === statusLevel.ERROR ?
                                   style.indicatorRed :
                                   (storageStatus === statusLevel.WARNING ?
                                       style.indicatorOrange :
                                       style.indicatorGreen) }>
                        <span className="tooltip__text">{ storageMessage }</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
            );
    }
}

Footer.propTypes = {
    storage: React.PropTypes.object.isRequired,
    ethereum: React.PropTypes.object.isRequired,
    message: React.PropTypes.string,
    actions: React.PropTypes.object
};

Footer.contextTypes = {
    router: React.PropTypes.object.isRequired
};

const mapStateToProps = (state) => {
    return {
        // key - props key value - which part of state to bind
        storage: state.status.storage,
        ethereum: state.status.ethereum,
        message: state.status.message
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators(Actions, dispatch)
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
