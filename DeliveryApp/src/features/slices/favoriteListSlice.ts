import { createSlice } from '@reduxjs/toolkit';

const favoriteListSlice = createSlice({
    name: 'favoriteList',
    initialState: [],
    reducers: {
        addToFavoriteList: (state, action) => {
            const existingItem = state.find(item => item.id == action.payload.id)
            if(!existingItem){
                action.payload.favourite = true
                state.push(action.payload)
            }
        },
        removeFromFavoriteList: (state, action) => {
            action.payload.favourite = false
            return state.filter(item => item.id !== action.payload.id);
        }
        
    }
});

export const { addToFavoriteList, removeFromFavoriteList } = favoriteListSlice.actions;
export default favoriteListSlice.reducer;
