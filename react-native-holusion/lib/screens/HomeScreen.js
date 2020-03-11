import React from 'react';

import {setData} from '../actions';
import {getActiveItems} from "../selectors";
import { connect} from 'react-redux';

import { Container, Toast, Content, Footer, Spinner, Text, H1, H2, View, Button} from 'native-base';
import { StyleSheet, TouchableOpacity} from 'react-native';

import {getActiveProduct, getItemsArray} from "../selectors";

import {initialize, signIn, watchFiles, filename} from "../files";

import ImageCard from '../components/ImageCard';

import * as strings from "../strings.json";

import {getUniqueId, getApplicationName, getDeviceName} from "react-native-device-info";


class HomeScreen extends React.Component {
    render() {
        if(!this.props.config){
            return(<Container><Content contentContainerStyle={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Spinner/> 
                <Text>Loading...</Text>
            </Content></Container>)
        }
        let cards;
        if(this.props.categories && 0 < this.props.categories.length){
            cards = this.props.categories.map((category, index)=>{
                const category_items = this.props.items.filter(i => {
                    if(i.theme) return category.name == i.theme;
                    if(i.category) return category.name == i.category;
                });
                if(category_items.length ==0){
                    return (<TouchableOpacity disabled={true} key={index} >
                        <ImageCard title={category.name} source={category.thumb?{uri: category.thumb}: null}/>
                    </TouchableOpacity>)
                }else if(category_items.length == 1){
                    return (<TouchableOpacity key={index} onPress={()=>this.props.navigation.navigate("Object", {id:category_items[0].id, category: category.name})}>
                        <ImageCard title={category.name} source={category.thumb?{uri: category.thumb}: null}/>
                    </TouchableOpacity>)
                }
                return (<TouchableOpacity key={index} onPress={()=>this.props.navigation.navigate("List", {category: category.name})}>
                    <ImageCard title={category.name} source={category.thumb?{uri: category.thumb}: null}/>
                </TouchableOpacity>)
            })
        } else {
            cards = [(<TouchableOpacity key={0} onPress={()=>this.props.navigation.navigate("List", {category: null})}>
                <ImageCard title="Collection" />
            </TouchableOpacity>)]
        }
        

        let footer;
        if(this.props.config.about){
            footer = (<Footer >
                <Button transparent onPress={()=>this.props.navigation.navigate("About")}>
                    <H2 primary style={styles.footerButton}>{strings.home.footerButton}</H2>
                </Button>
                    
            </Footer>)
        }
        return (
            <Container style={{flex: 1}}>
                <Content contentContainerStyle={styles.container}>
                    <View>
                        <H1 primary style={styles.titleContainer}>
                            Touchez-moi pour découvrir une collection :
                        </H1>
                    </View>
                    <View style= {styles.cardContainer}>
                        {cards}
                    </View>
                </Content> 
                {footer}
            </Container>
        )
    }

    constructor(props) {
        super(props);

    }

    onFocus(){
        if(this.abortController) this.abortController.abort();
        this.abortController = new AbortController();        
        if(this.props.config && this.props.config.video && this.props.target){
            fetch(`http://${this.props.target.url}/control/current/${filename(this.props.config.video)}`, {method: 'PUT', signal: this.abortController.signal})
            .then(r=>{
                if(!r.ok){
                    Toast.show({
                        text: "Failed to set current : "+r.status,
                        duration: 2000
                    })
                }
            })
        }
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        flexDirection:"column",
        alignContent: "space-around",
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
        textAlign:'center',
        paddingVertical: 70,
    },
    cardContainer: {
        flex: 1,
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
        fontSize: 28
    }
});

function mapStateToProps(state){
    const {data} = state;
    const {config, projectName, userName, password} = data;
    const categories = config.categories || [];
    return {
        categories, 
        items: getItemsArray(state),
        projectName,
        config, 
        target: getActiveProduct(state),
    };
}
export default connect(mapStateToProps, {setData})(HomeScreen);