import React from 'react'

import { Container } from 'native-base';
import { network, Playlist } from 'react-native-holusion';

export default class CatalogueScreen extends React.Component {

    componentDidMount() {
        network.activeAll(this.props.navigation.getParam('url'));
    }

    _onPlayslistItem(id) {
        this.props.navigation.push('Object', {
            objList: this.props.navigation.getParam("objList"),
            objId: id,
            url: this.props.navigation.getParam('url')
        });
    }

    render() {
        return(
            <Container>
                <Playlist content={this.props.navigation.getParam("objList")} url={this.props.navigation.getParam('url')} actionItem={this._onPlayslistItem} />
            </Container>
        )
    }

    constructor(props, context) {
      super(props, context);
      this._onPlayslistItem = this._onPlayslistItem.bind(this);
    }
}
