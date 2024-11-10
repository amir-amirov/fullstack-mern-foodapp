import { createSlice } from '@reduxjs/toolkit';

const currentOrderListSlice = createSlice({
    name: 'currentOrderList',
    initialState: [],
    reducers: {
        addToCurrentOrderList: (state, action) => {
            state.push(action.payload)
        },
        removeFromCurrentOrderList: (state, action) => {
            return state.filter(item => item != action.payload);
        }
        
    }
});

export const { addToCurrentOrderList, removeFromCurrentOrderList } = currentOrderListSlice.actions;
export default currentOrderListSlice.reducer;
