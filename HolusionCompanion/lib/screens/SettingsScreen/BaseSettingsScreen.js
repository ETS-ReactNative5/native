'use strict';
import React, { useState } from "react";
import {ScrollView, StyleSheet, TouchableWithoutFeedback,TouchableOpacity, Text, View, Switch, ActivityIndicator} from "react-native";
import {getReadableVersion} from "react-native-device-info";
import { createStackNavigator } from '@react-navigation/stack';
import { KeyboardAwareScrollView } from '@codler/react-native-keyboard-aware-scroll-view'

import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from "react-redux";
import { getActiveProduct, getErrors, isSignedIn, isRequired, isSynchronized, getOtherSize, getRequiredSize, getOtherFiles, getTotalSize, getRequiredFiles, getCachedFiles, setPurge, getConf, setProjectName } from "@holusion/cache-control";
import { Link } from "@react-navigation/native";
import {BgIcon, Bytes} from "../../components";
import { AppConfiguration } from "../../containers";
import SettingsHeader from "./SettingsHeader";
import { useLocalFiles, useLocalSize } from "./CacheScreen";


export function ShowErrors(){
  const errors = useSelector(getErrors);
  return (<View style={style.listView}>
    <View style={{paddingTop:4, }}>
      <View style={{width: 30, height: 30, borderRadius: 15, backgroundColor:errors.length ===0? BgIcon.colors["success"]: BgIcon.colors["warning"]}}>
        <Text style={{fontSize: 14, lineHeight:14, height: 14, color:"white"}}>{errors.length}</Text>
      </View>
    </View>
    <View><Link to="/Logs"><Text>{errors.length? errors.length: "Aucune"} erreur{1 < errors.length?"s":""} </Text></Link></View>
    <View><Link to="/Logs">
      <Icon name="chevron-forward-outline"/>
    </Link></View>
  </View>);
}

export function ShowFirestore(){
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const {projectName} = useSelector(getConf);
  const signedIn = useSelector(isSignedIn);
  const onPress = ()=>{
    setLoading(true);
    dispatch(setProjectName(projectName));
    setTimeout(()=>{
      setLoading(false);
    }, 5000);
  }
  return <View style={style.listView}>
    <View>
      <BgIcon status={signedIn?"success": "muted"} name="ios-code-working"/>
    </View>
    <View>
      <Text>Lien vers content.holusion.com</Text>
    </View>
    <View>
      {signedIn ? <Text style={{color: "#666666"}}>connecté</Text> : 
      (loading? <ActivityIndicator size="small"/> : <TouchableOpacity small transparent onPress={onPress}><View><Text style={{color: "#666666"}}>déconnecté</Text><Icon style={{color:"#666666"}} name="refresh"/></View></TouchableOpacity>)}
    </View>
  </View>
}

export function ShowCache(){
  const cachedFiles = useSelector(getCachedFiles);
  const requiredFiles = useSelector(getRequiredFiles);
  const otherFiles = useSelector(getOtherFiles);
  const requiredSize = useSelector(getRequiredSize);
  const otherSize = useSelector(getOtherSize);
  const totalSize = useSelector(getTotalSize);
  const localSize = useLocalSize()
  const progress = totalSize - requiredSize - otherSize
  const missingFiles = requiredFiles.length + otherFiles.length;
  
  let p = Math.round(100*progress/totalSize);
  let color;
  if(requiredSize !== 0){
    color = "#FF9966";
  }else if(otherSize !== 0){
    color = "#00a5e8"
  }
  return (<View style={style.listView}>
    <View>
    {(otherSize+requiredSize !=0)? <BgIcon status="warn" name="reload"/> : <BgIcon status="success" name="checkmark"/>}
    </View>
    <View>
      <Text>{cachedFiles.length}/{cachedFiles.length+missingFiles} fichiers en cache</Text>
    </View>
    <View>
      <A to="/Cache">
      {(otherSize+requiredSize !=0) ? <ActivityIndicator style={{height:17}} size="small" color={color}/> : <Bytes style={{color:"#666666"}}>{localSize}</Bytes>}
      </A>
    </View>
  </View>)
}

export function ShowTarget(){
  const {default_target} = useSelector(getConf);
  const target = useSelector(getActiveProduct);
  const synchronized = useSelector(isSynchronized);
  let color = "danger";
  if(target && synchronized){
    color = "success";
  }else if(target){
    color = "warning";
  }
  return (<View style={style.listView}>
    <View>
      <BgIcon status={color} name="wifi"/>
    </View>
    <View><Text>
      Produit connecté 
      {(target && target.name == default_target) && <Text note> (automatique)</Text>}
    </Text></View>
    
    <View>
      <A to="/PickProduct?t=target">
        {(target && !synchronized)? <ActivityIndicator style={{height:17}} size="small" color="#FF9966"/>: null}
        {target? target.name : "aucun"}
      </A>
    </View>
  </View>)
}

function A({to, children}){
  return <Link  to={to}>
    <Text style={{color: "#666666", minWidth:40 }}>{children}</Text>
    <Icon style={{fontSize: 16, lineHeight: 17}}name="chevron-forward-outline"/>
  </Link>
}


export default function SettingsScreen(){
  const dispatch = useDispatch();
  const {default_target, purge_products} = useSelector(getConf);
  return (
    <KeyboardAwareScrollView>

    <SettingsHeader>Settings</SettingsHeader>
      <Text style={style.titleText}>etat</Text>

      <ShowTarget/>

      <ShowCache/>

      <ShowFirestore/>

      <ShowErrors/>

      <Text style={style.titleText}>hologramme</Text>
      <View style={style.listView}>
        <View>
          <BgIcon name="link"/>
        </View>
        <View>
          <Text>Produit cible par défaut</Text>
        </View>
        <View>
          <A to="/PickProduct?t=default">
            {default_target||"aucun"}
          </A>
        </View>
      </View>
      <View style={style.listView}>
        <View>
          <BgIcon name="trash"/>
        </View>
        <View>
            <Text>Supprimer les vidéos inutiles sur l'hologramme</Text>
        </View>
        <View>
          <Switch value={purge_products} onValueChange={()=>dispatch(setPurge(!purge_products))} />
        </View>
      </View>
      <Text style={style.titleText}>configuration</Text>
      <View style={style.listView}>
        <View>
          <BgIcon name="construct"/>
        </View>
        <View>
          <Text>Interactions</Text>
        </View>
        <View>
          <A to="/Interactions">
          </A>
        </View>
      </View>
      <AppConfiguration style={style}/>
      <View style={style.listView}>
        <View><BgIcon name="logo-apple-appstore"/></View>
        <View><Text>Version</Text></View>
        <View><Text>{getReadableVersion()}</Text></View>
      </View>
    </KeyboardAwareScrollView>
);
}


const style = StyleSheet.create({

  modalView: {
    flex: 0,
    height: "75%",
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },

  listView: {
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  listHeader:{
    paddingVertical: 10,
    paddingLeft: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerDoneBtn: {
    color: '#007aff',
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold"
  }
});
