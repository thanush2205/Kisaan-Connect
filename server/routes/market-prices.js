const express = require('express');
const router = express.Router();
const MarketPrice = require('../models/MarketPrice');
const { getLocationMarketPrices } = require('../services/marketPriceService');

// GET /api/market-prices - Get all market prices
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    if (req.session.user?.state && req.session.user?.district) {
      const externalPrices = await getLocationMarketPrices({
        state: req.session.user.state,
        district: req.session.user.district,
        category
      });

      if (externalPrices) {
        return res.json({
          success: true,
          data: externalPrices,
          count: externalPrices.length,
          source: 'government-api',
          location: {
            state: req.session.user.state,
            district: req.session.user.district
          }
        });
      }
    }

    let filter = {};
    
    if (category) {
      filter.category = category;
    }

    let prices = await MarketPrice.find(filter).sort({ name: 1 });
    
    // If no prices found, auto-seed the database
    if (prices.length === 0) {
      console.log('No market prices found. Auto-seeding database...');
      
      const seedData = [
        // Grains
        { name: 'Rice (Basmati)', category: 'grains', currentPrice: 85, previousPrice: 82, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Wheat', category: 'grains', currentPrice: 25, previousPrice: 26, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Corn', category: 'grains', currentPrice: 22, previousPrice: 21, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Barley', category: 'grains', currentPrice: 28, previousPrice: 29, unit: 'per kg', market: 'Delhi Mandi' },
        
        // Vegetables
        { name: 'Tomato', category: 'vegetables', currentPrice: 45, previousPrice: 38, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Onion', category: 'vegetables', currentPrice: 35, previousPrice: 42, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Potato', category: 'vegetables', currentPrice: 18, previousPrice: 20, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Carrot', category: 'vegetables', currentPrice: 25, previousPrice: 23, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Cabbage', category: 'vegetables', currentPrice: 15, previousPrice: 16, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Cauliflower', category: 'vegetables', currentPrice: 30, previousPrice: 28, unit: 'per kg', market: 'Delhi Mandi' },
        
        // Fruits
        { name: 'Apple', category: 'fruits', currentPrice: 120, previousPrice: 115, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Banana', category: 'fruits', currentPrice: 40, previousPrice: 38, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Orange', category: 'fruits', currentPrice: 60, previousPrice: 65, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Mango', category: 'fruits', currentPrice: 80, previousPrice: 75, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Grapes', category: 'fruits', currentPrice: 90, previousPrice: 85, unit: 'per kg', market: 'Delhi Mandi' },
        
        // Pulses
        { name: 'Lentils (Red)', category: 'pulses', currentPrice: 95, previousPrice: 92, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Chickpeas', category: 'pulses', currentPrice: 75, previousPrice: 78, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Black Gram', category: 'pulses', currentPrice: 105, previousPrice: 102, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Green Gram', category: 'pulses', currentPrice: 85, previousPrice: 88, unit: 'per kg', market: 'Delhi Mandi' },
        
        // Spices
        { name: 'Turmeric', category: 'spices', currentPrice: 180, previousPrice: 175, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Cumin', category: 'spices', currentPrice: 420, previousPrice: 410, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Coriander', category: 'spices', currentPrice: 150, previousPrice: 145, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Red Chili', category: 'spices', currentPrice: 220, previousPrice: 215, unit: 'per kg', market: 'Delhi Mandi' },
        
        // Oilseeds
        { name: 'Groundnut', category: 'oilseeds', currentPrice: 65, previousPrice: 68, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Sunflower', category: 'oilseeds', currentPrice: 55, previousPrice: 52, unit: 'per kg', market: 'Delhi Mandi' },
        { name: 'Mustard', category: 'oilseeds', currentPrice: 48, previousPrice: 50, unit: 'per kg', market: 'Delhi Mandi' }
      ];

      await MarketPrice.insertMany(seedData);
      console.log(`✅ Auto-seeded ${seedData.length} market prices`);
      
      // Re-fetch the data after seeding
      prices = await MarketPrice.find(filter).sort({ name: 1 });
    }
    
    res.json({
      success: true,
      data: prices,
      count: prices.length
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market prices'
    });
  }
});

// GET /api/market-prices/:id - Get specific price details
router.get('/:id', async (req, res) => {
  try {
    const price = await MarketPrice.findById(req.params.id);
    
    if (!price) {
      return res.status(404).json({
        success: false,
        error: 'Price data not found'
      });
    }

    res.json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error('Error fetching price details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price details'
    });
  }
});

// POST /api/market-prices - Add new market price (Admin only)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category,
      currentPrice,
      previousPrice,
      unit,
      market
    } = req.body;

    // Validation
    if (!name || !category || !currentPrice || !previousPrice) {
      return res.status(400).json({
        success: false,
        error: 'Name, category, current price, and previous price are required'
      });
    }

    const newPrice = new MarketPrice({
      name,
      category,
      currentPrice,
      previousPrice,
      unit: unit || 'per kg',
      market: market || 'Delhi Mandi',
      priceHistory: [{
        price: currentPrice,
        date: new Date()
      }]
    });

    await newPrice.save();

    res.status(201).json({
      success: true,
      message: 'Market price added successfully',
      data: newPrice
    });
  } catch (error) {
    console.error('Error adding market price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add market price'
    });
  }
});

// PUT /api/market-prices/:id - Update market price
router.put('/:id', async (req, res) => {
  try {
    const { currentPrice } = req.body;
    
    if (!currentPrice) {
      return res.status(400).json({
        success: false,
        error: 'Current price is required'
      });
    }

    const price = await MarketPrice.findById(req.params.id);
    
    if (!price) {
      return res.status(404).json({
        success: false,
        error: 'Price data not found'
      });
    }

    // Store previous price and update
    price.previousPrice = price.currentPrice;
    price.currentPrice = currentPrice;
    
    // Add to price history
    price.priceHistory.push({
      price: currentPrice,
      date: new Date()
    });

    // Keep only last 30 entries in history
    if (price.priceHistory.length > 30) {
      price.priceHistory = price.priceHistory.slice(-30);
    }

    await price.save();

    res.json({
      success: true,
      message: 'Market price updated successfully',
      data: price
    });
  } catch (error) {
    console.error('Error updating market price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update market price'
    });
  }
});

// GET /api/market-prices/category/:category - Get prices by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const prices = await MarketPrice.find({ category }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: prices,
      count: prices.length
    });
  } catch (error) {
    console.error('Error fetching prices by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prices by category'
    });
  }
});

// GET /api/market-prices/health - Health check and database status
router.get('/health', async (req, res) => {
  try {
    const count = await MarketPrice.countDocuments();
    const sample = await MarketPrice.findOne();
    
    res.json({
      success: true,
      status: 'healthy',
      database: {
        connected: true,
        priceCount: count,
        samplePrice: sample ? {
          name: sample.name,
          category: sample.category,
          currentPrice: sample.currentPrice
        } : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/market-prices/seed - Seed database with initial data (for development)
router.post('/seed', async (req, res) => {
  try {
    // Clear existing data
    await MarketPrice.deleteMany({});

    const seedData = [
      // Grains
      { name: 'Rice (Basmati)', category: 'grains', currentPrice: 85, previousPrice: 82, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Wheat', category: 'grains', currentPrice: 25, previousPrice: 26, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Corn', category: 'grains', currentPrice: 22, previousPrice: 21, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Barley', category: 'grains', currentPrice: 28, previousPrice: 29, unit: 'per kg', market: 'Delhi Mandi' },
      
      // Vegetables
      { name: 'Tomato', category: 'vegetables', currentPrice: 45, previousPrice: 38, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Onion', category: 'vegetables', currentPrice: 35, previousPrice: 42, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Potato', category: 'vegetables', currentPrice: 18, previousPrice: 20, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Carrot', category: 'vegetables', currentPrice: 25, previousPrice: 23, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Cabbage', category: 'vegetables', currentPrice: 15, previousPrice: 16, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Cauliflower', category: 'vegetables', currentPrice: 30, previousPrice: 28, unit: 'per kg', market: 'Delhi Mandi' },
      
      // Fruits
      { name: 'Apple', category: 'fruits', currentPrice: 120, previousPrice: 115, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Banana', category: 'fruits', currentPrice: 40, previousPrice: 38, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Orange', category: 'fruits', currentPrice: 60, previousPrice: 65, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Mango', category: 'fruits', currentPrice: 80, previousPrice: 75, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Grapes', category: 'fruits', currentPrice: 90, previousPrice: 85, unit: 'per kg', market: 'Delhi Mandi' },
      
      // Pulses
      { name: 'Lentils (Red)', category: 'pulses', currentPrice: 95, previousPrice: 92, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Chickpeas', category: 'pulses', currentPrice: 75, previousPrice: 78, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Black Gram', category: 'pulses', currentPrice: 105, previousPrice: 102, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Green Gram', category: 'pulses', currentPrice: 85, previousPrice: 88, unit: 'per kg', market: 'Delhi Mandi' },
      
      // Spices
      { name: 'Turmeric', category: 'spices', currentPrice: 180, previousPrice: 175, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Cumin', category: 'spices', currentPrice: 420, previousPrice: 410, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Coriander', category: 'spices', currentPrice: 150, previousPrice: 145, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Red Chili', category: 'spices', currentPrice: 220, previousPrice: 215, unit: 'per kg', market: 'Delhi Mandi' },
      
      // Oilseeds
      { name: 'Groundnut', category: 'oilseeds', currentPrice: 65, previousPrice: 68, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Sunflower', category: 'oilseeds', currentPrice: 55, previousPrice: 52, unit: 'per kg', market: 'Delhi Mandi' },
      { name: 'Mustard', category: 'oilseeds', currentPrice: 48, previousPrice: 50, unit: 'per kg', market: 'Delhi Mandi' }
    ];

    await MarketPrice.insertMany(seedData);

    res.json({
      success: true,
      message: `Successfully seeded ${seedData.length} market prices`,
      count: seedData.length
    });
  } catch (error) {
    console.error('Error seeding market prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed market prices'
    });
  }
});

module.exports = router;
