import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// My global states
import foodListReducer from './slices/foodListSlice';
import cartListReducer from './slices/cartListSlice';
import favoriteListReducer from './slices/favoriteListSlice';
import orderHistoryReducer from './slices/orderHistorySlice';
import currentOrderListReducer from './slices/currentOrderListSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['cartList', 'favoriteList', 'orderHistory', 'currentOrderList'] // slices to persist
}

// I combine reducers for more clear code
const rootReducer = combineReducers({
  foodList: foodListReducer,
  cartList: cartListReducer,
  favoriteList: favoriteListReducer,
  orderHistory: orderHistoryReducer,
  currentOrderList: currentOrderListReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
