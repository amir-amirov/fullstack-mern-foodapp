import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BORDERRADIUS, COLORS, FONTFAMILY, FONTSIZE, SPACING } from '../theme/theme'
import ImageBackgroundInfo from '../components/ImageBackgroundInfo'
import PaymentFooter from '../components/PaymentFooter'
import { useDispatch, useSelector } from 'react-redux'
import { addToCartList } from '../features/slices/cartListSlice'
import { addToFavoriteList, removeFromFavoriteList } from '../features/slices/favoriteListSlice'
import { SafeAreaView } from 'react-native-safe-area-context'
import { toggleFavourite } from '../features/slices/foodListSlice'

const DetailsScreen = ({ navigation, route }: any) => {
  console.log("route =", route.params)

  const FoodList = useSelector((state): any => state.foodList)
  const ItemOfIndex = FoodList[route.params.index]

  const cartList = useSelector(state => state.cartList)
  const dispatch = useDispatch()
  const [price, setPrice] = useState(ItemOfIndex.prices[0])
  const [fullDescription, setFullDescription] = useState(false)
  const BackHandler = () => {
    navigation.goBack()
  }

  const ToggleFavourite = (favourite: boolean, item: any) => {
    dispatch(toggleFavourite(item.id))
    favourite ? dispatch(removeFromFavoriteList({...item})) : dispatch(addToFavoriteList({...item}))
  }

  const AddToCartListHandler = ({
    id,
    index,
    name,
    roasted,
    imagelink_square,
    special_ingredient,
    type,
    price,
  }: any) => {

    dispatch(addToCartList({
      id,
      index,
      name,
      roasted,
      imagelink_square,
      special_ingredient,
      type,
      prices: [{ ...price, quantity: 1 }],
    }))
    navigation.navigate("Cart")
  }

  return (
    <SafeAreaView style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.ScrollViewFlex}>
        <ImageBackgroundInfo
          EnableBackHandler={true}
          imagelink_portrait={ItemOfIndex.imagelink_portrait}
          type={ItemOfIndex.type}
          id={ItemOfIndex.id}
          favourite={ItemOfIndex.favourite}
          description={ItemOfIndex.description}
          name={ItemOfIndex.name}
          special_ingredient={ItemOfIndex.special_ingredient}
          ingredients={ItemOfIndex.ingredients}
          average_rating={ItemOfIndex.average_rating}
          ratings_count={ItemOfIndex.ratings_count}
          roasted={ItemOfIndex.roasted}
          index={ItemOfIndex.index}
          BackHandler={BackHandler}
          ToggleFavourite={ToggleFavourite}
          />
        <View style={styles.FooterInfoArea}>
          <Text style={styles.InfoTitle}>Description</Text>
          {fullDescription ? (
            <TouchableWithoutFeedback onPress={() => setFullDescription(prev => !prev)}>
              <Text style={styles.DescriptionText}>{ItemOfIndex.description}</Text>
            </TouchableWithoutFeedback>) : (
            <TouchableWithoutFeedback onPress={() => setFullDescription(prev => !prev)}>
              <Text numberOfLines={3} style={styles.DescriptionText} >{ItemOfIndex.description}</Text>
            </TouchableWithoutFeedback>)
          }
          <Text style={styles.InfoTitle}>Size</Text>
          <View style={styles.SizeOuterContainer}>
            {ItemOfIndex.prices.map((data: any) => (
              <TouchableOpacity key={data.size} onPress={() => setPrice(data)} style={[styles.SizeBox, { borderColor: data.size == price.size ? COLORS.primaryOrangeHex : COLORS.primaryDarkGreyHex }]}>
                <Text style={[styles.SizeText, { fontSize: ItemOfIndex.type == "bean" ? FONTSIZE.size_14 : FONTSIZE.size_16, color: data.size == price.size ? COLORS.primaryOrangeHex : COLORS.secondaryLightGreyHex }]}>{data.size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <PaymentFooter price={price} buttonTitle='Add to Cart' buttonPressHandler={() => {
          AddToCartListHandler({
            id: ItemOfIndex.id,
            index: ItemOfIndex.index,
            name: ItemOfIndex.name,
            roasted: ItemOfIndex.roasted,
            imagelink_square: ItemOfIndex.imagelink_square,
            special_ingredient: ItemOfIndex.special_ingredient,
            type: ItemOfIndex.type,
            price: price,
          })
        }} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default DetailsScreen

const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  ScrollViewFlex: {
    flexGrow: 1,
    justifyContent: "space-between"
  },
  FooterInfoArea: {
    padding: SPACING.space_20,
  },
  InfoTitle: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryWhiteHex,
    marginBottom: SPACING.space_10,
    fontWeight: "bold",
  },
  DescriptionText: {
    letterSpacing: 0.5,
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryWhiteHex,
    marginBottom: SPACING.space_30,
  },
  SizeOuterContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SPACING.space_20,
  },
  SizeBox: {
    flex: 1,
    backgroundColor: COLORS.primaryDarkGreyHex,
    alignItems: "center",
    justifyContent: "center",
    height: SPACING.space_24 * 2,
    borderRadius: BORDERRADIUS.radius_10,
    borderWidth: 2,
  },
  SizeText: {
    fontFamily: FONTFAMILY.poppins_medium
  }
})