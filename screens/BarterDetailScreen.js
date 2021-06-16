import React ,{Component} from 'react';
import {View,Text,TouchableOpacity,ScrollView, Alert} from 'react-native';
import{Card,Header,Icon, Badge} from 'react-native-elements';
import firebase from 'firebase';
import db from '../config';
import styles from '../styles';
import AppHeader from '../components/AppHeader';

export default class BarterDetailScreen extends Component {
    constructor(props){
        super(props);
        this.state = {
            userId          : firebase.auth().currentUser.email,
            userName        : "",
            barterId      : this.props.navigation.getParam('details')["user_id"],
            requestId       : this.props.navigation.getParam('details')["request_id"],
            itemName        : this.props.navigation.getParam('details')["ItemName"],
            description     : this.props.navigation.getParam('details')["Description"],
            status: this.props.navigation.getParam('details')["status"],
            giveOrWant:this.props.navigation.getParam('details')["GiveOrWant"],
            barterName    : '',
            barterContact : '',
            barterAddress : '',
            barterRequestDocId : '',
            info:[],
            value:'',
            currency:''
        }
    }

    getBarterDetails(){
      db.collection('users').where('email_id','==',this.state.barterId).get().then(snapshot=>{
        snapshot.forEach(doc=>{
          this.setState({
            barterName    : doc.data().first_name + ' ' + doc.data().last_name,
            barterContact : doc.data().contact,
            barterAddress : doc.data().address,
            currency: doc.data().currency
          })
        })
      });
  
      db.collection('Exchange_Request').where('request_id','==',this.state.requestId).get().then(snapshot=>{
        snapshot.forEach(doc => {
          this.setState({barterRequestDocId:doc.id, value : doc.data().itemValue});
        })
    })}
    
    
      getUserDetails=()=>{
        db.collection("users").where('email_id','==', this.state.userId).get().then(snapshot => {
          snapshot.forEach(doc => {
            this.setState({
              userName  :doc.data().first_name + " " + doc.data().last_name
            })
          })
        })
      }
    
      updateItemStatus=()=>{
        db.collection('My_Barter').add({
          "Itemname"           : this.state.itemName,
          "request_id"          : this.state.requestId,
          "BarterName"        : this.state.barterName,
          "user_id"            : this.state.userId,
          "status"      :  "Barter Interested",
          "barterId" : this.state.barterId,
          "text":'Send Items',
          'GiveOrWant': this.state.giveOrWant,
          'cost':this.state.value
        });
      }

      addNotification=()=>{
        var message = this.state.userName + " has shown interest in Exchanging items"
        db.collection("all_notifications").add({
          "targeted_user_id"    : this.state.barterId,
          "user_id"            : this.state.userId,
          "request_id"          : this.state.requestId,
          "itemName"           : this.state.itemName,
          "date"                : firebase.firestore.FieldValue.serverTimestamp(),
          "status" : "unread",
          "message"             : message
        })
      }

      informBarter = () => {
        var userName = this.state.userName;
        var requestId = this.state.requestId;
        var array = [];
        //get the barterId of those who have shown interest in exchange of the items
        db.collection('My_Barter').where('request_id','==', requestId).get().then((snapshot)=>{
          snapshot.forEach((doc) => {
            doc.data().user_id = array[array.length];

          })
          this.setState({
            info:array
          });
        })

        //sending notification about the deletion of the request
        var message = userName + '' + 'has deleted the request for' + '' + this.state.itemName;
        for(var i = 0;i<array.length;i++){
          db.collection("all_notifications").add({
            "targeted_user_id"    : array[i],
            "user_id"            : this.state.userId,
            "request_id"          : this.state.requestId,
            "itemName"           : this.state.itemName,
            "date"                : firebase.firestore.FieldValue.serverTimestamp(),
            "status" : "Request Deleted",
            "message"             : message
          });
        }
      }

      deleteRequest = () => {
        var docRef = db.collection('Exchange_Request').where('request_id','==',this.state.requestId);
        docRef.get().then(snapshot => {
          snapshot.forEach(doc => {
            doc.ref.delete();
            Alert('Your Request has been deleted.');
          })
        });
      }
    
      componentDidMount(){
        this.getBarterDetails();
        this.getUserDetails();
      }
    
    
        render(){
          return(
            <View style={styles.container}>
            <ScrollView>
              <AppHeader 
                title="Barter Details" 
                navigation={this.props.navigation} 
                leftComponent ={<Icon name='arrow-left' type='feather' color='#696969'  onPress={() => this.props.navigation.goBack()}/>}
              />
              <View>
                <Card
                    title={"Item Information"}
                    titleStyle= {styles.modalTitle}
                    style = {styles.modalContainer}
                  >
                  <Card >
                    <Text style={{fontWeight:'bold'}}>Name : {this.state.itemName}</Text>
                  </Card>
                  <Card>
                    <Text style={{fontWeight:'bold'}}>Description : {this.state.description}</Text>
                  </Card>
                </Card>
              </View>
              <View>
                <Card
                  title={"Barter Information"}
                  titleStyle= {styles.modalTitle}
                  style = {styles.modalContainer}
                >
                  <Card>
                    <Text style={{fontWeight:'bold'}}>Name: {this.state.barterName}</Text>
                  </Card>
                  <Card>
                    <Text style={{fontWeight:'bold'}}>Contact: {this.state.barterContact}</Text>
                  </Card>
                  <Card>
                    <Text style={{fontWeight:'bold'}}>Address: {this.state.barterAddress}</Text>
                  </Card>
                  {this.state.giveOrWant === 'Give' ?(
                    <Card>
                      <Text style={{fontWeight:'bold'}}>Cost: {this.state.value + '' + this.state.currency}</Text>
                    </Card>
                  ):null}
                </Card>
                <View>
                  {
                    this.state.barterId !== this.state.userId
                    ?(
                      <TouchableOpacity
                          style={styles.button}
                          onPress={()=>{
                            this.updateItemStatus();
                            this.addNotification();
                            this.props.navigation.navigate('MyBarters');
                          }}>
                        <Text style = {styles.buttonText}>I want to Exchange</Text>
                      </TouchableOpacity>
                    )
                    : (
                      <TouchableOpacity
                        style={styles.button}
                        onPress={()=>{
                          this.informBarter();
                          this.deleteRequest();
                          this.props.navigation.navigate('MyRequest');
                        }}
                      >
                          <Text style = {styles.buttonText}>Delete the Request</Text>
                      </TouchableOpacity>
                    )
                  }
                  </View>
              </View>
            </ScrollView>
            </View>
          )
        }

}