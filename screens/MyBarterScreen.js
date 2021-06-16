import React ,{Component} from 'react'
import {View, Text,TouchableOpacity,ScrollView,FlatList,StyleSheet} from 'react-native';
import {Card,Icon,ListItem,Badge} from 'react-native-elements'
import AppHeader from '../components/AppHeader'
import db from '../config';
import styles from '../styles';
import firebase from 'firebase';

export default class MyBarterScreen extends Component {
   constructor(props){
     super(props);
     this.state = {
       userId : firebase.auth().currentUser.email,
       userName : "",
       allBarters : [],
       value:''
     }
     this.requestRef= null
   }

   getUserDetails=()=>{
     var userId = this.state.userId;
     db.collection("users").where('email_id',"==",userId).get().then((snapshot)=>{
       snapshot.forEach((doc) => {
         this.setState({
           userName : doc.data().first_name + " " + doc.data().last_name
         })
       });
     })
   }

   getAllBarters =()=>{
    var userId = this.state.userId
     this.requestRef = db.collection("My_Barter").where("user_id",'==',userId).where('status','in',["Barter Interested",'Item Sent']).onSnapshot((snapshot)=>{
       var allBarters = []
       snapshot.docs.map((doc) =>{
         var barters = doc.data()
         barters["doc_id"] = doc.id
         allBarters.push(barters)
       });
       this.setState({
         allBarters : allBarters
       });
     })
   }

   exchangeItems=(itemDetails)=>{
     if(itemDetails.status === "Barter Interested"){
       var requestStatus  = 'Item Sent'
       db.collection("My_Barter").doc(itemDetails.doc_id).update({
         "status" : requestStatus,
         'text':'Item Recieved'
       })
       this.sendNotification(itemDetails,requestStatus)
     }
     else if(itemDetails.status === "Item Sent"){
       var requestStatus = 'Items Exchanged'
       db.collection("My_Barter").doc(itemDetails.doc_id).update({
         "status" : requestStatus,
         'text':'Items Exchanged'
       })
       this.sendNotification(itemDetails,requestStatus)
     }
   }

   sendNotification=(itemDetails,requestStatus)=>{
    var requestId = itemDetails.request_id
    var userId = itemDetails.user_id
    db.collection("all_notifications").where("request_id","==",requestId).where("user_id","==",userId).get().then((snapshot)=>{
      snapshot.forEach((doc) => {
        var message = ""
        if(requestStatus === "Item Sent"){
          message = this.state.BarterName + " sent you the item.";
        }else if(requestStatus === 'Items Exchanged'){
           message =  this.state.BarterName  + " has recieved your item."
        }
        db.collection("all_notifications").doc(doc.id).update({
          "message": message,
          "status" : "unread",
          "date"                : firebase.firestore.FieldValue.serverTimestamp()
        })
      });
    })
  }



   keyExtractor = (item, index) => index.toString()

   renderItem = ( {item, i} ) =>(
     <ListItem
       key={i}
       style = {styles.item}
       title={item.Itemname}
       titleStyle={{ color: 'black', fontWeight: 'bold' }}
       leftElement = {<Text style = {styles.GiveOrWant} >{item.GiveOrWant}</Text>}
       rightElement={
           <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor : item.status === 'Items Exchanged' ? "red" : "green", width:'25%', borderRadius : 10, marginTop:15
              }
            ]}
            onPress = {()=>{
              if(item.status === 'Items Exchanged'){
                Alert('You have already completed the Barter Exchange.');
              }else{
                this.exchangeItems(item);
              }
            }}
           >
             <Text style={{color:'#ffff'}}>{item.text}</Text>
           </TouchableOpacity>
         }
       bottomDivider
     />
   )

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
          onPress={() =>this.props.navigation.navigate('Notification')}/>
         <Badge
          value={this.state.value}
          containerStyle={{ position: 'absolute', top: -4, right: -4 }}/>
      </View>
    )
  }

   componentDidMount(){
     this.getUserDetails();
     this.getAllBarters();
     this.getNumberOfUnreadNotifications();
   }

   componentWillUnmount(){
     this.requestRef();
   }

   render(){
     return(
       <View style={styles.container}>
         <AppHeader 
            navigation={this.props.navigation} 
            title="My Barters" 
            leftComponent={<Icon name='bars' type='font-awesome' color='#FCCA46'  onPress={() => this.props.navigation.toggleDrawer()}/>} 
            rightComponent={<this.BellIconWithBadge {...this.props}/>}  
          />
         <View style={{flex:1}}>
           {
             this.state.allBarters.length === 0
             ?(
               <View>
                 <Text style={styles.modalTitle}>List of all My Barters</Text>
               </View>
             )
             :(
               <FlatList
                 keyExtractor={this.keyExtractor}
                 data={this.state.allBarters}
                 renderItem={this.renderItem}
               />
             )
           }
         </View>
       </View>
     )
   }
   }
