require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');
const Food = require('./models/Food');
const Order = require('./models/Order');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGODB_URI
mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(error => console.error("Error connecting to MongoDB:", error));

// Helper function to convert image file to Base64
const imageToBase64 = async (filePath) => {
  const imageBuffer = await fs.readFile(filePath);
  return imageBuffer.toString('base64');
};

const server = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

const wss = new WebSocket.Server({ server });

const clients = {};

wss.on('connection', (ws) => {

  console.log('New client connected');

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    if (data.type === 'newOrder') {
      if(clients.hasOwnProperty(data.orderId)){
        clients[data.orderId] = ws;
      } else {
        console.log('New order', "Order id: ", data.orderId, "Status: pending");
        const newOrder = new Order({ orderId: data.orderId, status: 'pending' });
        await newOrder.save();
  
        clients[data.orderId] = ws;
  
        ws.send(JSON.stringify({ status: 'pending' }));
      }
    }

    if (data.type === 'updateOrder') {
      const { orderId, status } = data;
      console.log("Update order, Order id: ", data.orderId, "Status:", status);

      const updatedOrder = await Order.findOneAndUpdate(
        { orderId },
        { status },
        { new: true }
      );
      ws.send(JSON.stringify({ status: updatedOrder.status }));
      if (clients[orderId]) {

        console.log('Send to client:', "updated status:", status, "of order", orderId);
        clients[orderId].send(JSON.stringify({ orderId: orderId, status: updatedOrder.status }));

        if (status === 'delivered') {
          delete clients[orderId];
        }
      }
    }

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
});

app.get('/api/foods', async (req, res) => {
  try {
    // console.log("Got request to fetch food")
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
      const orders = await Order.find();
      res.json(orders);
  } catch (error) {
      res.status(500).send('Error fetching orders');
  }
});
