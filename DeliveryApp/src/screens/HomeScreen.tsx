import { Button, Dimensions, FlatList, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import CoffeeData from '../data/CoffeeData'
import BeansData from '../data/BeansData'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { ScreenContainer } from 'react-native-screens'
import { BORDERRADIUS, COLORS, FONTFAMILY, FONTSIZE, SPACING } from '../theme/theme'
import HeaderBar from '../components/HeaderBar'
import Ionicons from 'react-native-vector-icons/Ionicons';
import CoffeeCard from '../components/CoffeeCard'
import EmptyListAnimation from '../components/EmptyListAnimation'

import { useDispatch, useSelector } from 'react-redux'
import { setFoodList } from '../features/slices/foodListSlice'
import { addToCartList } from '../features/slices/cartListSlice'
import { SafeAreaView } from 'react-native-safe-area-context'

const getCategoriesFromFoodData = (data: any) => {
  let temp: any = {}
  for (let i = 0; i < data.length; i++) {
    if (temp[data[i].type] == undefined) {
      temp[data[i].type] = 1
    } else {
      temp[data[i].type]++
    }
  }
  let categories = Object.keys(temp)
  categories.unshift('All') // ['All', 'Pizza', 'Doner', ..]
  return categories
}

const getCoffeeList = (category: string, data: any) => {
  if (category == "All") {
    return data
  } else {
    let coffeelist = data.filter((item: any) => item.type == category)
    return coffeelist
  }
}

const HomeScreen = ({ navigation }: any) => {

  const [error, setError] = useState()
  const [refreshing, setRefreshing] = useState(false)

  const FoodList = useSelector( (state): any => state.foodList)
  const dispatch = useDispatch()

  const PizzaList = FoodList.filter((item: any) => item.type == "Pizza")
  const DonerList = FoodList.filter((item: any) => item.type == "Doner")
  const BurgerList = FoodList.filter((item: any) => item.type == "Burger")
  const DessertList = FoodList.filter((item: any) => item.type == "Dessert")
  const DrinkList = FoodList.filter((item: any) => item.type == "Drink")
  const CoffeeList = FoodList.filter((item: any) => item.type == "Coffee")


  const [categoriesFood, setCategoriesFood] = useState(getCategoriesFromFoodData(FoodList))
  const [searchText, setSearchText] = useState("")
  const [categoryIndex, setCategoryIndex] = useState({
    index: 0,
    category: categoriesFood[0]
  })
  const [sortedCoffee, setSortedCoffee] = useState([])

  // This useRef is used to fix issue related to FlatList. Issue: if position of flatlist is changed and user is trying to filter, there might be black screen. So before filtering offset should be changed to the beginning. 
  const ListRef: any = useRef<FlatList>()

  const tabBarHeight = useBottomTabBarHeight()


  const searchCoffee = (search: string) => {
    if (search != "") {
      ListRef?.current?.scrollToOffset({
        animated: true,
        offset: 0,
      })
      setCategoryIndex({ index: 0, category: categoriesFood[0] })
      setSortedCoffee(
        [...FoodList.filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase()))]
      )
    }
  }

  const resetSearchCoffee = () => {
    ListRef?.current?.scrollToOffset({
      animated: true,
      offset: 0,
    })
    setCategoryIndex({ index: 0, category: categoriesFood[0] })
    setSortedCoffee([...FoodList])
    setSearchText("")
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

  const fetchFoods = async () => {
    try {
      console.log("Trying to fetch data")
      const response = await fetch('http://192.168.100.9:3000/api/foods');
      const data = await response.json();
      dispatch(setFoodList(data));

      setCategoriesFood(getCategoriesFromFoodData(data))
      setCategoryIndex({
        index: 0,
        category: categoriesFood[0]
      })
      setSortedCoffee(getCoffeeList(categoryIndex.category, data))

      console.log("Fetched data")

    } catch(err) {
      console.log("Error fetching data")
      setError(err.message);
    };
  }

  const handleRefresh = async() => {
    setRefreshing(true)
    await fetchFoods()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchFoods();
  }, []);

  if (FoodList.length == 0) {
    return (
      <View style={styles.ScreenContainer}>
        <StatusBar backgroundColor={COLORS.primaryBlackHex} />
        <EmptyListAnimation title={'Hold on, loading food data...'} />
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.ScreenContainer}>
      <StatusBar backgroundColor={COLORS.primaryBlackHex} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.ScrollViewFlex} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primaryWhiteHex} />
      }>
        {/* App Header */}
        <HeaderBar />
        <Text style={styles.ScreenTitle}>Find the best{"\n"}food for you</Text>

        {/* Search Input */}
        <View style={styles.InputContainer}>
          <TouchableOpacity onPress={() => searchCoffee(searchText)}>
            <Ionicons
              style={styles.InputIcon}
              name="search"
              size={FONTSIZE.size_18}
              color={
                searchText.length > 0
                  ? COLORS.primaryOrangeHex
                  : COLORS.primaryLightGreyHex
              }
            />
          </TouchableOpacity>
          <TextInput
            value={searchText}
            onChangeText={text => {
              setSearchText(text)
              searchCoffee(text)
            }}
            placeholder="Find your meal.."
            placeholderTextColor={COLORS.primaryLightGreyHex}
            style={styles.TextInput}
          />
          {searchText.length > 0 ? (
            <TouchableOpacity onPress={resetSearchCoffee}>
              <Ionicons style={styles.InputIcon} name="close" size={FONTSIZE.size_20} color={COLORS.primaryLightGreyHex} />
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.CategoryScrollViewStyle}
        >
          {categoriesFood.map((data, index) => (
            <View key={index} style={styles.CategoryScrollViewContainer}>
              <TouchableOpacity
                style={styles.CategoryScrollViewItem}
                onPress={() => {
                  ListRef?.current?.scrollToOffset({
                    animated: true,
                    offset: 0,
                  })
                  setCategoryIndex({ index, category: categoriesFood[index] })
                  setSortedCoffee([...getCoffeeList(categoriesFood[index], FoodList)])
                }}>
                <Text
                  style={[
                    styles.CategoryTextActive,
                    categoryIndex.index == index ? { color: COLORS.primaryOrangeHex } : {}
                  ]}>
                  {data}
                </Text>
                {categoryIndex.index == index ? <View style={styles.ActiveCategory}></View> : <></>}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>


        {/* All food Flatlist */}
        <FlatList
          ref={ListRef}
          horizontal
          ListEmptyComponent={
            <View style={styles.EmptyListContainer}>
              <Text style={styles.CategoryTextActive}>No Food Available</Text>
            </View>
          }
          showsHorizontalScrollIndicator={false}
          data={sortedCoffee}
          contentContainerStyle={styles.FlatListContainer}
          keyExtractor={item => item.id}
          renderItem={
            ({ item }) => {
              return <TouchableOpacity onPress={() =>
                navigation.navigate("Details", {
                  index: item.index,
                  id: item.id,
                  type: item.type,
                })}>
                <CoffeeCard
                  id={item.id}
                  index={item.index}
                  type={item.type}
                  roasted={item.roasted}
                  imagelink_square={item.imagelink_square}
                  name={item.name}
                  special_ingredient={item.special_ingredient}
                  average_rating={item.average_rating}
                  price={item.prices[2]}
                  buttonPressHandler={() => AddToCartListHandler(
                    {
                      id: item.id,
                      index: item.index,
                      name: item.name,
                      roasted: item.roasted,
                      imagelink_square: item.imagelink_square,
                      special_ingredient: item.special_ingredient,
                      type: item.type,
                      price: item.prices[2],
                    }
                  )}
                />
              </TouchableOpacity>
            }
          }
        />

        {/* Pizza List */}
        <Text style={styles.CoffeeBeansTitle}>Pizza</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PizzaList}
          contentContainerStyle={[styles.FlatListContainer,]}
          keyExtractor={item => item.id}
          renderItem={
            ({ item }) => {
              return <TouchableOpacity onPress={() =>
                navigation.navigate("Details", {
                  index: item.index,
                  id: item.id,
                  type: item.type,
                })
              }>
                <CoffeeCard
                  id={item.id}
                  index={item.index}
                  type={item.type}
                  roasted={item.roasted}
                  imagelink_square={item.imagelink_square}
                  name={item.name}
                  special_ingredient={item.special_ingredient}
                  average_rating={item.average_rating}
                  price={item.prices[2]}
                  buttonPressHandler={() => { navigation.navigate("Cart") }}
                />
              </TouchableOpacity>
            }
          }
        />

        {/* Doner List */}
        <Text style={styles.CoffeeBeansTitle}>Doner</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DonerList}
          contentContainerStyle={[styles.FlatListContainer]}
          keyExtractor={item => item.id}
          renderItem={
            ({ item }) => {
              return <TouchableOpacity onPress={() =>
                navigation.navigate("Details", {
                  index: item.index,
                  id: item.id,
                  type: item.type,
                })
              }>
                <CoffeeCard
                  id={item.id}
                  index={item.index}
                  type={item.type}
                  roasted={item.roasted}
                  imagelink_square={item.imagelink_square}
                  name={item.name}
                  special_ingredient={item.special_ingredient}
                  average_rating={item.average_rating}
                  price={item.prices[2]}
                  buttonPressHandler={() => { navigation.navigate("Cart") }}
                />
              </TouchableOpacity>
            }
          }
        />

        {/* Burger List */}
        <Text style={styles.CoffeeBeansTitle}>Burger</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={BurgerList}
          contentContainerStyle={[styles.FlatListContainer,]}
          keyExtractor={item => item.id}
          renderItem={
            ({ item }) => {
              return <TouchableOpacity onPress={() =>
                navigation.navigate("Details", {
                  index: item.index,
                  id: item.id,
                  type: item.type,
                })
              }>
                <CoffeeCard
                  id={item.id}
                  index={item.index}
                  type={item.type}
                  roasted={item.roasted}
                  imagelink_square={item.imagelink_square}
                  name={item.name}
                  special_ingredient={item.special_ingredient}
                  average_rating={item.average_rating}
                  price={item.prices[2]}
                  buttonPressHandler={() => { navigation.navigate("Cart") }}
                />
              </TouchableOpacity>
            }
          }
        />

        {/* Desserts List */}
        <Text style={styles.CoffeeBeansTitle}>Desserts</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DessertList}
          contentContainerStyle={[styles.FlatListContainer,]}
          keyExtractor={item => item.id}
          renderItem={
            ({ item }) => {
              return <TouchableOpacity onPress={() =>
                navigation.navigate("Details", {
                  index: item.index,
                  id: item.id,
                  type: item.type,
                })
              }>
                <CoffeeCard
                  id={item.id}
                  index={item.index}
                  type={item.type}
                  roasted={item.roasted}
                  imagelink_square={item.imagelink_square}
                  name={item.name}
                  special_ingredient={item.special_ingredient}
                  average_rating={item.average_rating}
                  price={item.prices[2]}
                  buttonPressHandler={() => { navigation.navigate("Cart") }}
                />
              </TouchableOpacity>
            }
          }
        />

        {/* Drink List */}
        <Text style={styles.CoffeeBeansTitle}>Drinks</Text>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={DrinkList}
          contentContainerStyle={[styles.FlatListContainer,]}
          keyExtractor={item => item.id}
          renderItem={
            ({ item }) => {
              return <TouchableOpacity onPress={() =>
                navigation.navigate("Details", {
                  index: item.index,
                  id: item.id,
                  type: item.type,
                })
              }>
                <CoffeeCard
                  id={item.id}
                  index={item.index}
                  type={item.type}
                  roasted={item.roasted}
                  imagelink_square={item.imagelink_square}
                  name={item.name}
                  special_ingredient={item.special_ingredient}
                  average_rating={item.average_rating}
                  price={item.prices[2]}
                  buttonPressHandler={() => { navigation.navigate("Cart") }}
                />
              </TouchableOpacity>
            }
          }
        />
        {/* Coffee List */}
        <Text style={styles.CoffeeBeansTitle}>Coffee</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CoffeeList}
          contentContainerStyle={[styles.FlatListContainer, { marginBottom: tabBarHeight }]}
          keyExtractor={item => item.id}
          renderItem={
            ({ item }) => {
              return <TouchableOpacity onPress={() =>
                navigation.navigate("Details", {
                  index: item.index,
                  id: item.id,
                  type: item.type,
                })
              }>
                <CoffeeCard
                  id={item.id}
                  index={item.index}
                  type={item.type}
                  roasted={item.roasted}
                  imagelink_square={item.imagelink_square}
                  name={item.name}
                  special_ingredient={item.special_ingredient}
                  average_rating={item.average_rating}
                  price={item.prices[2]}
                  buttonPressHandler={() => { navigation.navigate("Cart") }}
                />
              </TouchableOpacity>
            }
          }
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  ScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
  },
  ScrollViewFlex: {
    flexGrow: 1,
  },
  ScreenTitle: {
    fontSize: FONTSIZE.size_28,
    fontFamily: FONTFAMILY.poppins_semibold,
    color: COLORS.primaryWhiteHex,
    paddingLeft: SPACING.space_30,
    fontWeight: "bold",
  },
  InputContainer: {
    margin: SPACING.space_30,
    borderRadius: BORDERRADIUS.radius_20,
    backgroundColor: COLORS.primaryDarkGreyHex,
    flexDirection: "row",
    alignItems: "center",
  },
  InputIcon: {
    marginHorizontal: SPACING.space_20,
  },
  TextInput: {
    flex: 1,
    height: SPACING.space_20 * 3,
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14,
    color: COLORS.primaryWhiteHex,
  },
  CategoryScrollViewStyle: {
    paddingHorizontal: SPACING.space_20,
    marginBottom: SPACING.space_20,
  },
  CategoryScrollViewContainer: {
    paddingHorizontal: SPACING.space_15,
  },
  CategoryScrollViewItem: {
    alignItems: "center",
  },
  CategoryTextActive: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.primaryLightGreyHex,
    fontWeight: "bold",
    marginBottom: SPACING.space_4,
  },
  ActiveCategory: {
    height: SPACING.space_10,
    width: SPACING.space_10,
    borderRadius: BORDERRADIUS.radius_10,
    backgroundColor: COLORS.primaryOrangeHex,
  },
  FlatListContainer: {
    gap: SPACING.space_20,
    paddingVertical: SPACING.space_20,
    paddingHorizontal: SPACING.space_30,
  },
  CoffeeBeansTitle: {
    fontSize: FONTSIZE.size_18,
    marginLeft: SPACING.space_30,
    marginTop: SPACING.space_20,
    fontFamily: FONTFAMILY.poppins_medium,
    color: COLORS.secondaryLightGreyHex,
    fontWeight: "bold",
  },
  EmptyListContainer: {
    width: Dimensions.get('window').width - SPACING.space_30 * 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.space_36 * 3.6,
  }
})