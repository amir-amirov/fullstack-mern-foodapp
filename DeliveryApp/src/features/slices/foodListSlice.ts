import { createSlice } from '@reduxjs/toolkit';

const foodListSlice = createSlice({
    name: 'foodList',
    initialState: [],
    reducers: {
        setFoodList: (state, action) => {

          return action.payload;
        },
        removeFoodList: () => {

          return [];
        },
        toggleFavourite: (state, action) => {
          const foodItem = state.find(item => item.id === action.payload);

          if (foodItem) {
            foodItem.favourite = !foodItem.favourite;
          }
        }
    }
});

export const { setFoodList, removeFoodList, toggleFavourite } = foodListSlice.actions;
export default foodListSlice.reducer;
