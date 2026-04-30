const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const contactRoutes = require('./contact.routes');
const bannerRoutes = require('./banner.routes');
const promotionRoutes = require('./promotion.routes');
const reviewRoutes = require('./review.routes');

// Public routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/contacts', contactRoutes);
router.use('/banners', bannerRoutes);
router.use('/promotions', promotionRoutes);
router.use('/reviews', reviewRoutes);

// User routes
router.use('/users', userRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'CamVang API is running', timestamp: new Date().toISOString() });
});

module.exports = router;
