import React from 'react'
import { Container, Content, Footer, Body, Header, H1, H2, View, Text, Row, Icon, Toast, Button, Spinner } from 'native-base';

import { Image, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

import Markdown from 'react-native-markdown-renderer'

import PropTypes from "prop-types";

import {connect} from "react-redux";
import {getActiveItems} from "../selectors";

import Controller from "../components/Controller"

import {filename} from "../files";

import Carousel from 'react-native-looped-carousel';


const {width, height} = Dimensions.get('window');


function ObjectView(d){
    if(!d.active){
        return(<Content contentContainerStyle={styles.content}><View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}><Spinner primary/></View></Content>)
    }
    const properties = Object.keys(d['properties']||{}).map((key, idx)=>{
        const value = d['properties'][key];
        return (<View key={idx} style={styles.propStyle}>
            <Text><Text style={{fontWeight:"bold"}}>{key} : </Text>{value}</Text>
        </View>)
    })
    return(<Content contentContainerStyle={styles.content}>
        <View style={{flexDirection:"row"}}>
            <View style={styles.titleContainer}>
                <H1 style={styles.title}>{d['title']}</H1>
                <H2  style={styles.subTitle}>{d['subtitle']}</H2>
                <Text style={styles.shortDescription}>{d['short']}</Text>
            </View>
            <View style={styles.cartouche}>
                <Image source={{uri: `${d["thumb"]}`}} style={styles.image}/>
                {properties}
            </View>
        </View>
        <View style={styles.textContent}>
            <Markdown style={{text: {
                fontSize: 24,
                textAlign: "justify"
            }}}>
                {d['description']}
            </Markdown>
        </View>
    </Content>)
}


/**
 * Object screen is the screen that render a carousel of the current collection. You can swipe to change the current object or touch the next or previous button
 */
class ObjectScreen extends React.Component {
    
    render() {
        const objects_array =Object.keys(this.props.items);
        const current_index = this.state.index;
        
        if(!this.props.items || current_index == -1){
            return(<Container>
                <Content contentContainerStyle={styles.content}>
                    <Text>No data for Id : {this.props.navigation.getParam("id")}</Text>
                    <Text>Available objects : {Object.keys(this.props.items).join(", ")}</Text>
                </Content>
            </Container>)
        }
        //When there is more than a few object, we rapidly run into perf limitations
        const active_indices = [
            current_index, 
            ((current_index==0)?objects_array.length-1: current_index-1),
            ((current_index==objects_array.length-1)?0: current_index+1)
        ]
        slides = objects_array.map((key, index)=>{
            const object = this.props.items[key] ||{};
            return (<ObjectView {...object} key={object.id} active={active_indices.indexOf(index) !== -1}/>);
        })
        let footer;
        if(1 < objects_array.length){
            footer = (<Footer style={styles.controller}>
                <Button transparent large style={styles.controlButton} onPress={()=>this._carousel._animatePreviousPage()}>
                    <Icon primary large style={styles.controlIcons} name="ios-arrow-back"/>
                    </Button>
                <Controller />
                <Button transparent large style={styles.controlButton} onPress={()=>this._carousel._animateNextPage()}>
                    <Icon primary large style={styles.controlIcons} name="ios-arrow-forward"/>
                    </Button>
            </Footer>)
        }else{
            footer = (<Footer style={styles.controller}>
                <Controller />
            </Footer>)
        }
        return (<Container onLayout={this._onLayoutDidChange}>
            <Carousel 
                ref={(ref) => this._carousel = ref}
                style={this.state.size}
                currentPage={current_index}
                onAnimateNextPage={(p)=>this.onNextPage(p)}
                autoplay={false}
            >
                {slides}
            </Carousel>
            {footer}
        </Container>)
    }

    onNextPage(index){
        const objectId = this.props.ids[index];
        const object = this.props.items[objectId];
        if(index != this.state.index){
            this.setState({index: index});
        }
        if(!this.props.target){
            return;
        }
        if(!object){
            console.warn("Index", index, "did not map to any object");
            return;
        }
        //console.warn(`onNextPage(${index}) : ${filename(object.video)}`);
        fetch(`http://${this.props.target.url}/control/current/${filename(object.video)}`, {method: 'PUT'})
        .then(r=>{
            if(!r.ok){
                Toast.show({
                    text: "Failed to set current : "+r.status,
                    duration: 2000
                })
            }
        })
    }
    _onLayoutDidChange = (e) => {
        const layout = e.nativeEvent.layout;
        this.setState({ size: { width: layout.width, height: layout.height } });
    }

    constructor(props, context) {
        super(props, context);
        const id = props.navigation.getParam("id");
        const index = props.ids.findIndex((o)=> o == id);
        this.state = {
            index,
            size: {width, height}
        }
        this.props.navigation.addListener("willFocus",()=>{
            this.onNextPage(this.state.index);
        })
    }
}

function mapStateToProps(state, {navigation}){
    const {data, products} = state;
    console.warn("Map state to props in ObjectScreen");
    return {
        ids: Object.keys(data.items),
        items: getActiveItems(state, {category: navigation.getParam("category")}),
        target: products.find(p => p.active)
    };
}

const styles = StyleSheet.create({
    content: {
        marginHorizontal: 24,
        paddingBottom: 100,
    },
    image: {
        flex: 1,
        minHeight: 150,
        resizeMode: 'contain', 
    },
    textContent: {
        paddingTop: 24,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    titleContainer: {
        flex:2,
    },
    cartouche:{
        flex:1,
        justifyContent: "center",
        marginLeft: 40,
    },
    propStyle:{
        paddingVertical:5,
    },
    title: {
        paddingVertical: 24,
        fontSize: 32
    },
    subTitle: {
        color: "#bbbbbb",
        fontSize: 24,
        fontStyle: "italic",
        paddingVertical: 12
    },
    shortDescription:{
        paddingTop:15,
    },
    detailContainer: {
        padding: 8,
        width: "100%",
        display: "flex",
        marginTop: 16,
        borderRadius: 24,
        flexDirection: 'row',
        shadowColor: "#000", 
        shadowOffset: {
            width: 1, 
            height: 2
        }, 
        shadowOpacity: 0.4, 
        shadowRadius: 5,
    },
    detailIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailText: {
        fontSize: 24,
        color: "white",
        marginLeft: 8
    },
    controller:{
        position:"absolute",
        bottom:15,
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth:0,
        borderColor: 'transparent',
    },
    controlButton:{
        backgroundColor: "#ffffffcc",
        paddingVertical: 5,
        paddingHorizontal: 15, 
        height:70,
    },
    controlIcons:{
        fontSize: 60,
        height: 60,
        lineHeight: 60,
        fontWeight: "bold"
    },
})

export default connect(mapStateToProps)(ObjectScreen);