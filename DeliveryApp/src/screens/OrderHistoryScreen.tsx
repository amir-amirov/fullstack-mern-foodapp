import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import HeaderBar from '../components/HeaderBar';
import EmptyListAnimation from '../components/EmptyListAnimation';
import PopUpAnimation from '../components/PopUpAnimation';
import OrderHistoryCard from '../components/OrderHistoryCard';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateStatusOfOrder } from '../features/slices/orderHistorySlice';
import { removeFromCurrentOrderList } from '../features/slices/currentOrderListSlice';

const OrderHistoryScreen = ({ navigation }: any) => {

  const OrderHistoryList = useSelector(state => state.orderHistory)
  const tabBarHeight = useBottomTabBarHeight();
  const [showAnimation, setShowAnimation] = useState(false);
  const currentOrderList = useSelector(state => state.currentOrderList)
  const dispatch = useDispatch()
  const [websocket, setWebsocket] = useState(null)

  const navigationHandler = ({ index, id, type }: any) => {
    navigation.push('Details', {
      index,
      id,
      type,
    });
  };

  const buttonPressHandler = () => {
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  };

  useEffect(() => {
    
  
    if (currentOrderList.length > 0) {
      console.log("Starting websocket..")
      const ws = new WebSocket('ws://localhost:3000');
      setWebsocket(ws)

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'newOrder', orderId: currentOrderList[currentOrderList.length - 1] }));
        console.log("Sending my orderId: ", currentOrderList[currentOrderList.length - 1])
      };

      ws.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        console.log("Receive update! Status: ", data.status, "order Id:", data.orderId)
        dispatch(updateStatusOfOrder({
          orderId: data.orderId,
          status: data.status
        }))

        if (data.status === 'delivered') {
          console.log("Food deliveried")
          dispatch(removeFromCurrentOrderList(data.orderId))
        }

      };

      ws.onclose = () => {
        console.log("Closing websocket..")
        setWebsocket(null)
      }

      return () => {
        ws.close();
      };
    }
  }, [])

  useEffect(() => {
    const sendOrder = (orderId) => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: 'newOrder', orderId }));
        console.log("Sent new orderId:", orderId);
      }
    };

    const closeConnection = () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close()
      }
    }
  
    // Check if there's a new order and send it
    if (currentOrderList.length > 0) {
      console.log("CurrentOrderList is updated")
      sendOrder(currentOrderList[currentOrderList.length - 1]);
    } else {
      console.log("closing websocket connection")
      closeConnection()
    }

  }, [currentOrderList]);

  return (
    <SafeAreaView style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />

      {showAnimation ? (
        <PopUpAnimation
          style={styles.LottieAnimation}
          source={require('../lottie/download.json')}
        />
      ) : (
        <></>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollViewFlex}>
        <View
          style={[styles.ScrollViewInnerView, { marginBottom: tabBarHeight }]}>
          <View style={styles.ItemContainer}>
            <HeaderBar title="Order History" />
            {OrderHistoryList.length == 0 ? (
              <EmptyListAnimation title={'No Order History'} />
            ) : (
              <View style={styles.ListItemContainer}>
                {OrderHistoryList.map((data: any, index: any) => (
                  <OrderHistoryCard
                    key={index.toString()}
                    navigationHandler={navigationHandler}
                    CartList={data.CartList}
                    CartListPrice={data.CartListPrice}
                    OrderDate={data.OrderId}
                    Status={data.Status}
                  />
                ))}
              </View>
            )}
          </View>
          {OrderHistoryList.length > 0 ? (
            <TouchableOpacity
              style={styles.DownloadButton}
              onPress={() => {
                buttonPressHandler();
              }}>
              <Text style={styles.ButtonText}>Download</Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  LottieAnimation: {
    height: 250,
  },
  ScrollViewFlex: {
    flexGrow: 1,
  },
  ScrollViewInnerView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  ItemContainer: {
    flex: 1,
  },
  ListItemContainer: {
    paddingHorizontal: SPACING.space_20,
    gap: SPACING.space_30,
  },
  DownloadButton: {
    margin: SPACING.space_20,
    backgroundColor: COLORS.primaryOrangeHex,
    alignItems: 'center',
    justifyContent: 'center',
    height: SPACING.space_36 * 2,
    borderRadius: BORDERRADIUS.radius_20,
  },
  ButtonText: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_18,
    color: COLORS.primaryWhiteHex,
  },
});

export default OrderHistoryScreen;