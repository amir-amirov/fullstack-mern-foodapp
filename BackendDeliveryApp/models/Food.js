// models/Food.js
const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  size: String,
  price: String,
  currency: String,
});

const foodSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  roasted: String,
  imagelink_square: String,
  imagelink_portrait: String,
  ingredients: String,
  special_ingredient: String,
  prices: [priceSchema],
  average_rating: Number,
  ratings_count: String,
  favourite: Boolean,
  type: String,
  index: Number,
});

module.exports = mongoose.model('Food', foodSchema);
