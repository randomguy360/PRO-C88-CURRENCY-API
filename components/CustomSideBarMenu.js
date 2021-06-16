import React, { Component} from 'react';
import {View, Text,TouchableOpacity, Alert} from 'react-native';
import { DrawerItems} from 'react-navigation-drawer';
import { Avatar } from "react-native-elements";
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase';
import styles from '../styles';
import db from '../config';

export default class CustomSideBarMenu extends Component {
    state = {
        image:'#',
        name:'',
        id: firebase.auth().currentUser.email
    }

    getUserName = () => {
        db.collection('users').where('email_id','==',this.state.id).get().then(snapshot=>{
            snapshot.forEach(doc => {
                this.setState({name: doc.data().first_name + '' + doc.data().last_name});
            })
        })
    }

    selectPicture = async () => {
        const {cancelled, uri} = await ImagePicker.launchImageLibraryAsync({
            mediatype: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4,4],
            quality: 1
        });

        if(!cancelled){
            this.uploadImage(uri, this.state.id);
        }
    }

    uploadImage = async (uri, imageName) => {
        var response = await fetch(uri);
        var blob = await response.blob();

        var ref = firebase.storage().ref().child('user_profiles/'+ imageName);

        return ref.put(blob).then(response => {
            this.fetchImage(imageName);
        });
    }

    fetchImage = (imageName) => {
        var storageRef = firebase.storage().ref().child('user_profiles/'+ imageName);
        storageRef.getDownloadURL().then(url => {
            this.setState({image:url});
        }).catch(error => {
            this.setState({image:'#'})
        })
    }

    componentDidMount(){
        this.getUserName();
    }

    render(){
        return(
            <View style = {styles.container}>
                <Avatar
                    rounded
                    source = {{uri:this.state.image}}
                    size = "medium"
                    onPress = {()=>this.selectPicture()}
                    containerStyle = {styles.imageContainer}
                    showEditButton
                />
                <Text style = {{marginTop:5,alignSelf:'center',fontSize:20,color:'#FE7F2D',fontWeight:'bold'}}>{this.state.name}</Text>
                <DrawerItems {...this.props} />
                <View style = {styles.drawer}>
                    <TouchableOpacity
                        style = {styles.logout}
                        onPress = {()=>{
                            this.props.navigation.navigate('SignupLoginScreen');
                            firebase.auth().signOut();
                            Alert.alert('You have Signed Out of Bartertech.');
                        }}
                    >
                        <Text style = {styles.logoutText}>LOGOUT</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}