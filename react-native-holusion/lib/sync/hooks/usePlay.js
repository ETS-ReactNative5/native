'use strict';
import {useEffect} from "react";
import { useIsFocused } from '@react-navigation/native';

import {Toast} from "native-base";
import { filename } from "@holusion/cache-control";

/**
 * Synchronizes an hologram if available
 * @param {string} video 
 * @param {string} targetUrl 
 */
export function usePlay(video, targetUrl){
  const isActive = useIsFocused();
  useEffect(()=>{
    if(!video || ! targetUrl || ! isActive){
      return;
    }
    let controller = new AbortController();
    console.log("Playing video : ", video);
    let req = `http://${targetUrl}/control/current/${filename(video)}`;
    fetch(req, {
      method: 'PUT',
      headers: {"Accept": "application/json"},
      signal: controller.signal
    }).then(async r=>{
        if(!r.ok){
          let msg;
          try{
            let d = await r.json();
            msg = `Request failed with status ${r.status} : ${d.message}`;
          }catch(e){
            msg = `Request failed with status ${r.status} : ${r.statusText}`
          }finally{
            throw new Error(msg);
          }
        }
    }, (e)=>{
      console.warn(`Failed to PUT ${req} : `, e);
      Toast.show({
          text: "Failed to set video : "+e.message,
          duration: 2000
      })
    })
    return ()=> controller.abort();
  }, [video, targetUrl, isActive]);
}