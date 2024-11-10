import { createSlice } from '@reduxjs/toolkit';

const orderHistorySlice = createSlice({
  name: 'orderHistory',
  initialState: [],
  reducers: {
    addToOrderHistoryListFromCart: (state, action) => {
      state.push(action.payload)
    },
    updateStatusOfOrder: (state, action) => {
      const existingItem = state.find(item => item.OrderId == action.payload.orderId)
      if(existingItem){
        existingItem.Status = action.payload.status
      }
    }
  },
});

export const { addToOrderHistoryListFromCart, updateStatusOfOrder } = orderHistorySlice.actions;

export default orderHistorySlice.reducer;
