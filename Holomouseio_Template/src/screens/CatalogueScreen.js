import React from 'react'

import { Container, StyleProvider } from 'native-base';
import { assetManager, network } from '@holusion/react-native-holusion';
import {Playlist} from '@holusion/react-native-holusion';

import { StyleSheet, Text } from 'react-native'

import * as Config from '../../Config'
import PlaylistComponent from '../components/PlaylistComponent'

import * as strings from '../../strings.json'
import {navigator} from '../../navigator'

/**
 * Catalogue screen is the screen with small cards that represent by collection. Click on a card has effect to open Object screen of selected object 
 */
export default class CatalogueScreen extends React.Component {

    componentDidMount() {
        if(this.props.navigation.getParam("url")) {
            network.activeOnlyYamlItems(this.props.navigation.getParam('url'), assetManager.yamlCache);
        }
    }

    _onPlayslistItem(id) {
        this.props.navigation.push(navigator.object.id, {
            objList: this.props.navigation.getParam("objList"),
            objId: id,
            url: this.props.navigation.getParam('url'),
        });
    }

    render() {
        let titles = this.props.navigation.getParam("objList").map(e => assetManager.yamlCache[e].Titre);
        
        return(
            <Container>
                <Text style={styles.catchPhrase}>{strings.catalogue.catchphrase}</Text>
                <StyleProvider style={customTheme}>
                    <PlaylistComponent titles={titles} playlist={this.playlist} actionItem={this._onPlayslistItem} />
                </StyleProvider>
            </Container>
        )
    }
    
    constructor(props, context) {
        super(props, context);
        this._onPlayslistItem = this._onPlayslistItem.bind(this);
        if(this.props.navigation.getParam("url")) {
            this.props.navigation.setParams({'color': 'green'});
        }
        
        let objList = this.props.navigation.getParam("objList");
        let titles = this.props.navigation.getParam("objList").map(e => assetManager.yamlCache[e].Titre);
        this.playlist = new Playlist(this.props.navigation.getParam("url"), objList, true, titles);
    }
}

const styles = StyleSheet.create({
    catchPhrase: {
        color: Config.primaryColor,
        fontSize: 32,
        margin: 24,
        textAlign: 'left'
    }
})

const customTheme = {
    'holusion.PlaylistComponent': {
        'holusion.IconCardComponent': {
            container: {
                backgroundColor: "#fff",
                borderWidth: 2,
                borderColor: Config.primaryColor,
                margin: 4,
                padding: 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
            },
            icon: {
                width: 200 * 0.8,
                height: 200 * 0.8,
                resizeMode: 'contain'
            },
            titleContainer: {
                backgroundColor: Config.primaryColor,
                width: '100%',
                height: '25%',
                flex: 1,
                justifyContent: 'center',
                marginLeft: 0,
                paddingLeft: 4,
                paddingRight: 4
            }
        }
    }
}
