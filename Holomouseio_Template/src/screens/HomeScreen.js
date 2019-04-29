import React from 'react';

import { Content, StyleProvider, Toast } from 'native-base';
import DefaultHomeScreenComponent from "../components/screenComponents/DefaultHomeScreenComponent";
import SearchScreenComponent from "../components/screenComponents/SearchScreenComponent";

import {network, assetManager} from '@holusion/react-native-holusion';
import FirebaseController from '../utils/FirebaseController'
import * as Config from '../../Config'

import { store } from "../stores/Store";
import * as actions from "../actions";

import * as strings from "../../strings.json"
import {navigator} from "../../navigator"

/**
 * Encapsulate the two other view and change view when it's necessary
 */
export default class HomeScreen extends React.Component {

    async componentDidMount() {
        store.dispatch(actions.changeState(actions.AppState.DOWNLOAD_FIREBASE));

        let firebaseController = new FirebaseController(Config.projectName);
        try {
            await firebaseController.getFiles([
                {name: 'projects', properties: ['uri', 'thumb']},
                {name: 'logos', properties: ['logo']}
            ]);
        } catch(errorObj) {
            let text = "erreur inconnu";
            if(errorObj.code === "firestore/unavailable") {
                text = "Impossible de se connecter à la base de donnée"
            } else if(errorObj.name) {
                text = "Impossible de télécharger : " + errorObj.name + " - " + errorObj.error.message;
            }

            Toast.show({
                text: text,
                buttonText: "Ok",
                position: 'top'
            })
        }
        try {
            await assetManager.manage();
        } catch(err) {
            Toast.show({
                text: err,
                buttonText: "Ok",
                position: 'top'
            })
        }

        store.dispatch(actions.changeState(actions.AppState.SEARCH_PRODUCT));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    connectToProduct() {
        const launchOfflineMode = setTimeout(() => {
            store.dispatch(actions.changeState(actions.AppState.READY))
            Toast.show({
                text: "Aucun produit trouvé",
                buttonText: "Ok",
                position: 'top'
            })
        }, 5000);

        network.connect(() => {
            clearTimeout(launchOfflineMode);
            let url = network.getUrl(0);
            this.props.navigation.setParams({color: 'green'})
            store.dispatch(actions.changeState(actions.AppState.READY))
            this.setState(() => ({url: url}));
            assetManager.manage();
        }, () => {
            Toast.show({
                text: "Produit déconnecté",
                buttonText: "Ok",
                position: 'top'
            })
            this.props.navigation.setParams({color: 'red'})
            this.props.navigation.push(navigator.home.id);
        })
    }

    componentDidUpdate() {
        switch(store.getState().appState) {
            case actions.AppState.SEARCH_PRODUCT:
                this.connectToProduct()
                break;
            default:
        }
    }

    render() {
        let display = <SearchScreenComponent content={strings.home.content_start} />;

        switch(store.getState().appState) {
            case actions.AppState.SEARCH_PRODUCT:
                display = <SearchScreenComponent content={strings.home.content_product} />;
                break;
            case actions.AppState.READY:
                display = <DefaultHomeScreenComponent url={this.state.url} visite={this._onVisite} catalogue={this._onCatalogue} remerciement={this._onRemerciement} />;
                break;
            default:
                display = <SearchScreenComponent content={strings.home.content_files} />;
        }

        if(this.state.url) {
            network.activeOnlyYamlItems(this.state.url, assetManager.yamlCache);
        }

        return (
            <Content enableResetScrollToCoords={false} disableKBDismissScroll={true}>
                <StyleProvider style={customTheme}>
                    {display}     
                </StyleProvider>
            </Content>
        )
    }

    constructor(props, context) {
        super(props, context);
        this._onCatalogue = this._onCatalogue.bind(this);
        this._onVisite = this._onVisite.bind(this);
        this._onRemerciement = this._onRemerciement.bind(this);

        this.state = {
            url: null,
            screenState: actions.AppState.INIT
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState(() => ({screenState: store.getState().appState}))
        })
    }

    _onVisite() {
        store.dispatch(actions.changeSelectionType(actions.SelectionType.VISITE));
        this.props.navigation.push(navigator.selection.id, {url: this.state.url});
    }

    _onCatalogue() {
        store.dispatch(actions.changeSelectionType(actions.SelectionType.CATALOGUE));
        this.props.navigation.push(navigator.selection.id, {url: this.state.url})
    }

    _onRemerciement() {
        this.props.navigation.push(navigator.remerciements.id);
    }
}

const customTheme = {
    'holusion.IconCardComponent': {
        container: {
            backgroundColor: Config.primaryColor,
            width: 300,
            height: 300,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
        },
        icon: {
            width: 300 * 0.6,
            height: 300 * 0.6
        }
    }
}
