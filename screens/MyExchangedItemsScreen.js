import React ,{Component} from 'react'
import {View, Text,TouchableOpacity,ScrollView,FlatList,StyleSheet} from 'react-native';
import {Card,Icon,ListItem,Badge} from 'react-native-elements'
import AppHeader from '../components/AppHeader'
import db from '../config';
import styles from '../styles';
import firebase from 'firebase';

export default class MyExchangedItemsScreen extends Component {
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
     this.requestRef = db.collection("My_Barter").where("user_id",'==',userId).where('status','==','Items Exchanged').onSnapshot((snapshot)=>{
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

   keyExtractor = (item, index) => index.toString()

   renderItem = ( {item, i} ) =>(
     <ListItem
       key={i}
       title={item.Itemname}
       titleStyle={{ color: 'black', fontWeight: 'bold' }}
       leftElement = {<Text style = {styles.GiveOrWant} >{item.GiveOrWant}</Text>}
       rightElement = {
        <TouchableOpacity 
          style={styles.listButton}
          onPress = {()=>
            this.props.navigation.navigate("BarterDetails",{"details": item})
          }
        >
          <Text style={{color:'#fff'}}>View</Text>
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
            title="Exchanged Items" 
            leftComponent={<Icon name='bars' type='font-awesome' color='#FCCA46'  onPress={() => this.props.navigation.toggleDrawer()}/>} 
            rightComponent={<this.BellIconWithBadge {...this.props}/>}  
          />
         <View style={{flex:1}}>
           {
             this.state.allBarters.length === 0
             ?(
               <View>
                 <Text style={styles.modalTitle}>List of all My Exchanged Items</Text>
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
