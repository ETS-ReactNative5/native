import RNFS from 'react-native-fs';

import * as network from '../utils/Network';
import PlaylistItem from './PlaylistItem';

export default class Playlist {

    constructor(url, contents=null, localImage=false) {
        this.contents = contents;
        if(!contents) {
            this.contents = network.getPlaylist(url);
        }
        
        this.contents = contents.map(elem => {
            let imageUri = `http://${url}:3000/medias/${elem}?thumb=true`;
            if(localImage) {
                imageUri = `file://${RNFS.DocumentDirectoryPath}/${elem}.jpg`;
            }
            return new PlaylistItem(url, imageUri, elem);
        });
    }
}