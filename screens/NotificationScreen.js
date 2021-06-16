import React, { Component } from 'react';
import { StyleSheet, View, FlatList,Text } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';
import firebase from 'firebase';
import AppHeader from '../components/AppHeader';
import db from '../config';
import styles from '../styles';
import SwipeableFlatlist from '../components/SwipeableFlatList';

export default class NotificationScreen extends Component{
  constructor(props) {
    super(props);

    this.state = {
      userId :  firebase.auth().currentUser.email,
      allNotifications : []
    };
    this.notificationRef = null
  }

  getNotifications=()=>{
    console.log(this.state.userId)
    this.notificationRef = db.collection("all_notifications").where("status", "==", "unread").where("targeted_user_id",'==',this.state.userId).onSnapshot((snapshot)=>{
      var allNotifications =  []
      snapshot.docs.map((doc) =>{
        var notification = doc.data()
        notification["doc_id"] = doc.id
        allNotifications.push(notification)
      });
      this.setState({
          allNotifications : allNotifications
      });
    })
  }

  componentDidMount(){
    this.getNotifications()
  }

  componentWillUnmount(){
    this.notificationRef()
  }

  keyExtractor = (item, index) => index.toString()

  renderItem = ({item,index}) =>{
      return (
        <ListItem
          key={index}
          leftElement = {<Text style = {styles.GiveOrWant} >{item.GiveOrWant}</Text>}
          title={item.itemName}
          titleStyle={{ color: 'black', fontWeight: 'bold' }}
          subtitle={item.message}
          bottomDivider
        />
      )
 }


  render(){
    return(
      <View style={{backgroundColor:'#233D4D',width:'100%',height:'100%'}}>
          <View>
            <AppHeader 
              title={"Notifications"} 
              navigation={this.props.navigation}
            />
          </View> 
            {
              this.state.allNotifications.length === 0
              ?(
                <View>
                  <Text style={styles.modalTitle}>No Notifications</Text>
                </View>
              )
              :(
                <SwipeableFlatlist allNotifications={this.state.allNotifications}/>
              )
            }
      </View>
    )
  }
}