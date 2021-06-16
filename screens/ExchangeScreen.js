import React, { Component } from 'react';
import {Text,View,TextInput,TouchableOpacity} from 'react-native';
import AppHeader from '../components/AppHeader';
import styles from '../styles';
import firebase from 'firebase';
import db from '../config';
import{Card,Header,Icon, Badge} from 'react-native-elements';
import {Picker} from '@react-native-picker/picker';

//this screen will allow us to add or request items which will be shownn to the other users
export default class ExchangeScreen extends Component {
    constructor(){
        super();
        this.state = {
            userId : firebase.auth().currentUser.email,
            name:'',
            description:'',
            giveOrWant:'Give',
            value:'',
            isExchangeRequestActive:'',
            currencyCode:'',
            itemValue:''
        }
    }

    createUniqueId(){
        return Math.random().toString(36).substring(7);
    }

    addItems(name,description){
        var userId = this.state.userId
        var randomRequestId = this.createUniqueId()
        db.collection('Exchange_Request').doc().set({
            "user_id": userId,
            'ItemName':name,
            'Description':description,
            "request_id"  : randomRequestId,
            "GiveOrWant":this.state.giveOrWant,
            "status":'forExchange',
            'itemValue':this.state.itemValue,
            "date"       : firebase.firestore.FieldValue.serverTimestamp()
        }).then(function(){
            alert('Your item has been successfully added and it is ready for exchange.');
            this.setState({
                name :'',
                description : '',
                itemValue:''
            })
        }).catch(function(error){
            console.log(error);
        })
    }

    getIsExchangeRequestActive = () => {
        db.collection('users').where('email_id', '==', this.state.userId).onSnapshot(snapshot => {
            snapshot.forEach(doc => {
                this.setState({
                    isExchangeRequestActive: doc.data().isExchangeRequestActive,
                    currencyCode: doc.data().currency
                })
            })
        })
    }

    getData(){
        fetch("http://data.fixer.io/api/latest?access_key=1f7dd48123a05ae588283b5e13fae944&format=1").then(response=>{
          return response.json();
        }).then(responseData =>{
          var currencyCode = this.state.currencyCode
          var currency = responseData.rates.INR
          var value =  69 / currency
          console.log(value);
        })
    }

    componentDidMount(){
        this.getNumberOfUnreadNotifications();
        this.getData();
    }

    getNumberOfUnreadNotifications(){
        db.collection('all_notifications').where('status','==',"unread").where('targeted_user_id','==',this.state.userId).onSnapshot((snapshot)=>{
            var unreadNotifications = snapshot.docs.map((doc) => doc.data())
            this.setState({
            value: unreadNotifications.length
            })
        })
    }

    BellIconWithBadge=()=>{
        return(
            <View>
            <Icon name='bell' type='font-awesome' color='#FCCA46' size={25}
                onPress={() =>this.props.navigation.navigate('Notifications')}/>
                <Badge
                value={this.state.value}
                containerStyle={{ position: 'absolute', top: -4, right: -4 }}/>
            </View>
        )
    }

    render(){
        if(this.state.isExchangeRequestActive === true){
            return(
                <View style = {styles.container}>
                    <Text style = {styles.modalTitle}>You already have requested few items for exchange.</Text>
                    <TouchableOpacity
                        style = {styles.button}
                        onPress = {()=>this.props.navigation.navigate('MyRequest')}
                    >
                        <Text style = {styles.buttonText}>See my Requests</Text>
                    </TouchableOpacity>
                </View>
            )
        }else{            
            return(
                <View style = {styles.container}>
                    <AppHeader 
                        title="Exchange" navigation={this.props.navigation} 
                        leftComponent ={<Icon name='bars' type='font-awesome' color='#FCCA46'  onPress={() => this.props.navigation.toggleDrawer()}/>}
                        rightComponent={<this.BellIconWithBadge {...this.props}/>}          
                    />
                    <Picker 
                        selectedValue = {this.state.giveOrWant}
                        style = {styles.picker}
                        onValueChange={(itemValue, itemIndex) =>
                            this.setState({giveOrWant: itemValue})
                        }
                    >
                        <Picker.Item label = 'Give' value = 'Give' />
                        <Picker.Item label = 'Want' value = 'Want' />
                    </Picker>
                    <TextInput
                        style = {styles.formTextInput}
                        placeholder = {'Item Name'}
                        multiline = {true}
                        textAlignVertical = 'top'
                        editable
                        placeholderTextColor = '#61F2C2'
                        onChangeText={(text)=>{
                            this.setState({
                                name: text
                            })
                        }}
                        value ={this.state.name}
                    />
                    <TextInput
                        style = {styles.formTextInput}
                        placeholder = {'Item Description'}
                        placeholderTextColor = '#61F2C2'
                        editable
                        multiline = {true}
                        numberOfLines = {5}
                        textAlignVertical = 'top'
                        onChangeText={(text)=>{
                            this.setState({
                                description: text
                            })
                        }}
                        value ={this.state.description}
                    />

                    {
                        this.state.giveOrWant === 'Give' ? (
                            <TextInput 
                                style = {styles.formTextInput}
                                placeholder = {'Cost'}
                                placeholderTextColor = '#61f2c2'
                                editable
                                multiline = {false}
                                textAlignVertical = 'top'
                                onChangeText = {(text)=>{
                                    this.setState({
                                        itemValue:text
                                    })
                                }}
                                value = {this.state.itemValue}
                            />
                        ): null
                    }

                    <TouchableOpacity
                        style = {styles.button}
                        onPress = {()=>{this.addItems(this.state.name,this.state.description)}}
                    >
                            <Text style = {styles.buttonText}>Add Items</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }
}