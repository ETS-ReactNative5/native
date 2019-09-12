import React from 'react';

import {setData} from '../actions';
import {getActiveItems} from "../selectors";
import { connect} from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, View} from 'native-base';
import { StyleSheet, TouchableOpacity} from 'react-native';


import {initialize} from "../files";

import Card from '../components/Card';

import * as strings from "../strings.json";

class HomeScreen extends React.Component {
    render() {
        if(this.state.status == "loading"){
            return(<Container><Content contentContainerStyle={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
               <Spinner/> 
                <Text>Loading...</Text>
            </Content></Container>)
        }
        const cards = this.props.cards.map((item)=>{
            return (<TouchableOpacity key={item['id']} onPress={()=>this.props.navigation.navigate("Object", {id:item['id']})}>
                <Card source={item['thumb']? {uri: item['thumb']} : require("../../assets/icons/catalogue.png")} title={item.title} />
            </TouchableOpacity>)
        })
        return (
            <Container style={{flex: 1}}>
                <Content contentContainerStyle={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text >
                        </Text>
                    </View>
                    <View style= {styles.cardContainer}>
                        {cards}
                    </View>
                </Content> 
                <Footer onPress={()=>this.props.navigation.navigate("Remerciements")}>
                    <Text style={styles.footerButton}>{strings.home.footerButton}</Text>
                </Footer>
            </Container>
        )
    }

    constructor(props) {
        super(props);

        this.state= {status:"loading"};
        this.props.navigation.addListener("willFocus",()=>{
            if(this.state.status == "loading" ){
                this.load();
            }
        })
    }
    load(){
        if(0 < this.props.cards.length ) return;
        this.setState({status: "loading"});
        initialize(this.props.projectName)
        .then(data=>{
            this.props.setData(data);
            this.setState({status: "done"});
        })
        .catch((err)=>{
            this.props.navigation.navigate("Update",{error: "Application configuration is required : "+err.toString()});
        });
    }
}

const customTheme = {
    'holusion.IconCardComponent': {
        container: {
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

const styles = StyleSheet.create({
    container: {
    },
    images: {
        width: null,
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'flex-end',
        marginRight: 16
    },
    catchphrase: {
        fontSize: 48,
        textAlign: 'center'
    },
    titleContainer: {
        flex: 1,
        display: "flex",
        justifyContent: 'center',
        alignItems: 'center'

    },
    cardContainer: {
        flex: 2,
        display: 'flex', 
        flexWrap: "wrap",
        flexDirection: "row", 
        alignContent: 'center', 
        justifyContent: 'center'
    },
    footerContainer: {
        display: 'flex', 
        justifyContent: 'center', 
        flexDirection: 'row',
        borderRadius: 8, 
        padding: 8, 
        shadowOffset: {
            width: 0, 
            height: 10
        }, 
        shadowOpacity: 0.8, 
        shadowRadius: 10,
        width: "90%",
        position: "absolute",
        bottom: 32
    },
    footerButton: {
        color: 'white', 
        fontSize: 28
    }
});

function mapStateToProps(state){
    const {target, data } = state;
    const {items, config, projectName} = data;
    const cards = getActiveItems(state);
    return {target, cards, projectName};
}
export default connect(mapStateToProps, {setData})(HomeScreen);