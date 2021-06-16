import React from 'react';
import {createDrawerNavigator} from 'react-navigation-drawer';
import { AppTabNavigator } from './AppTabNavigator'
import CustomSideBarMenu  from './CustomSideBarMenu';
import SettingScreen from '../screens/SettingScreen';
import MyBarterScreen from '../screens/MyBarterScreen';
import NotificationScreen from '../screens/NotificationScreen'
import MyRequestScreen from '../screens/MyRequestScreen';
import MyExchangedItemsScreen from'../screens/MyExchangedItemsScreen';

export const AppDrawerNavigator = createDrawerNavigator({
    Home : {
      screen : AppTabNavigator
    },
    MyRequest:{
      screen: MyRequestScreen
    },
    MyBarters:{
      screen:MyBarterScreen
    },
    MyExchangedItems:{
      screen:MyExchangedItemsScreen
    },
    Notifications:{
        screen:NotificationScreen
    },
    Setting:{
      screen:SettingScreen
    }
},
{
contentComponent:CustomSideBarMenu
},
{
initialRouteName : 'Home'
});