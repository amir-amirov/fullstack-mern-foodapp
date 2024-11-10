const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    status: { type: String, default: 'pending' },
    client: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
