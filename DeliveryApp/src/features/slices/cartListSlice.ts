import { createSlice } from '@reduxjs/toolkit';

const cartListSlice = createSlice({
    name: 'cartList',
    initialState: {
        items: [],
        totalPrice: 0,
    },
    reducers: {
        addToCartList: (state, action) => {
            const existingItem = state.items.find(item => item.id == action.payload.id)
            if(existingItem){
                const existingSize = existingItem.prices.find(price => price.price == action.payload.prices[0].price)
                if(existingSize){
                    
                }
                else {
                    existingItem.prices.push(action.payload.prices[0])
                    state.totalPrice += parseFloat(action.payload.prices[0].price)
                }                
            } else {
                state.items.push(action.payload);
                state.totalPrice += parseFloat(action.payload.prices[0].price)
            } 
        },
        incrementCartItemQuantity: (state, action) => {

            const { id, size } = action.payload
            const existingItem = state.items.find(item => item.id == id)

            if(existingItem){
                const existingSize = existingItem.prices.find(price => price.size == size)
                if(existingSize){
                    existingSize.quantity ++
                    state.totalPrice += parseFloat(existingSize.price)
                }
                
            }

        },
        decrementCartItemQuantity: (state, action) => {

            const { id, size } = action.payload
            const existingItem = state.items.find(item => item.id == id)

            if(existingItem){
                const existingSize = existingItem.prices.find(price => price.size == size)
                if(existingSize){
                    existingSize.quantity --
                    state.totalPrice -= parseFloat(existingSize.price)
                    if(existingSize.quantity == 0){
                        existingItem.prices = existingItem.prices.filter(price => price.size != size)
                    }
                    if(existingItem.prices.length == 0){
                        state.items = state.items.filter(item => item.id != id)
                    }
                }
                
            }

        },
        clearCart: (state) => {
            state.items = []
            state.totalPrice = 0
        }
        
        
    }
});

export const { addToCartList, incrementCartItemQuantity, decrementCartItemQuantity, clearCart } = cartListSlice.actions;
export default cartListSlice.reducer;
