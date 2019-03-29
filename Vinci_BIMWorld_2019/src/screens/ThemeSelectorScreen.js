import React from 'react';
import { Content, Icon } from 'native-base';
import { Text, StyleSheet, View } from 'react-native';

import { network, ListItem, assetManager } from '@holusion/react-native-holusion'

import * as networkExtension from '../utils/networkExtension'
import * as Config from '../utils/Config'

export default class ThemeSelectorScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerRight: <Icon style={{marginRight: 16, color: navigation.getParam('color', 'red')}} name="ios-wifi"/>
        }
    }

    componentDidMount() {
        if(network.getUrl()) {
            networkExtension.activeOnlyYamlItems(this.props.navigation.getParam('url'), assetManager.yamlCache);
        }
    }

    render() {
        let allList = [];
        let actualSelection = this.props.navigation.getParam('type') === 'catalogue' ? assetManager.allCatalogue : assetManager.allTheme;
        let title = this.props.navigation.getParam('type') === 'catalogue' ? 'Collection : ' : 'Thème : ';
        let catchphrase = this.props.navigation.getParam('type') === 'catalogue' ? 'Choisissez une collection' : 'Choisissez un thème';

        let collectionToColor = {};
        
        for(let obj in assetManager.yamlCache) {
            if(assetManager.yamlCache[obj].color) {
                collectionToColor[assetManager.yamlCache[obj].Theme] = assetManager.yamlCache[obj].color;
            }
        }

        let selectionSort = actualSelection.slice();

        for(let i = 0; i < actualSelection.length; i++) {
            let isPurple = (i % 2 == 0);
            let backgroundColor = isPurple ? Config.primaryColor : null;
            let color = isPurple ? "white" : Config.secondaryColor;
            
            for(let collections in collectionToColor) {
                if(collections === selectionSort[i]) {
                    backgroundColor = collectionToColor[collections];
                    color = 'white'
                }
            }

            allList.push(
                <ListItem key={i} style={[{backgroundColor: backgroundColor}, styles.listItem]} onPress={() => this._onSelection(actualSelection[i])}>
                    <View style={{display: 'flex', flexDirection: 'column', justifyContent:'center'}}>
                        <Text style={[{color: color}, styles.selectionText]}>{actualSelection[i].replace('Thème : ', '')}</Text>
                    </View>
                </ListItem>
            );
        }

        return (
            <Content>
                <View>
                    <Text  style={styles.catchPhrase}>{catchphrase}</Text>
                </View>
                <View style={{borderWidth: 1, borderColor: '#ccccccff', marginLeft: 24, marginRight: 24}}></View>
                <View>
                    { allList }
                </View>
            </Content>
        )
    }

    constructor(props, context) {
        super(props, context);

        this.props.navigation.addListener('willFocus', payload => {
            if(network.getUrl()) {
                networkExtension.activeOnlyYamlItems(this.props.navigation.getParam('url'), assetManager.yamlCache);
            }
        })

        this._onSelection = this._onSelection.bind(this);

        if(network.getUrl()) {
            this.props.navigation.setParams({'color': 'green'});
        }
    }

    _onSelection(name) {
        let realType = this.props.navigation.getParam('type') === "catalogue" ? 'Collections' : 'Theme'
        let objs = assetManager.getObjectFromType(realType, name);

        if(realType === "Theme") {
            this.props.navigation.push('Object', {
                objList: objs,
                objId: 0,
                url: this.props.navigation.getParam('url'),
                type: this.props.navigation.getParam('type')
            });
        } else {
            this.props.navigation.push("Catalogue", {
                objList: objs,
                url: this.props.navigation.getParam('url'),
                type: this.props.navigation.getParam('type')
            })
        }
    }
}

const styles = StyleSheet.create({
    catchPhrase: {
        color: Config.primaryColor,
        fontSize: 32,
        margin: 24,
        textAlign: 'left'
    },
    
    selectionText: {
        fontSize: 26,
        paddingLeft: 16
    },

    listItem: {
        height: 128,
        padding: 16
    }
});