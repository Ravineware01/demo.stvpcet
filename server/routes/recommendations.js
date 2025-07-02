const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { Matrix } = require('ml-matrix');
const natural = require('natural');

const router = express.Router();

// @desc    Get personalized recommendations
// @route   GET /api/recommendations/personalized
// @access  Private
router.get('/personalized', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get user's purchase history
    const userOrders = await Order.find({ 
      user: userId, 
      isPaid: true 
    }).populate('orderItems.product');

    // Get user's wishlist and cart
    const user = await User.findById(userId).populate('wishlist cart.product');

    // Extract categories and brands from user's history
    const userPreferences = await getUserPreferences(userId, userOrders, user);

    // Get collaborative filtering recommendations
    const collaborativeRecs = await getCollaborativeRecommendations(userId, limit);

    // Get content-based recommendations
    const contentRecs = await getContentBasedRecommendations(userPreferences, limit);

    // Combine and weight recommendations
    const recommendations = await combineRecommendations(
      collaborativeRecs, 
      contentRecs, 
      userPreferences,
      limit
    );

    res.json({
      success: true,
      recommendations,
      userPreferences: {
        categories: userPreferences.categories,
        brands: userPreferences.brands,
        priceRange: userPreferences.priceRange
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get recommendations for a specific product
// @route   GET /api/recommendations/product/:productId
// @access  Public
router.get('/product/:productId', optionalAuth, async (req, res) => {
  try {
    const productId = req.params.productId;
    const limit = parseInt(req.query.limit) || 8;

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get similar products based on category, brand, and features
    const similarProducts = await getSimilarProducts(product, limit);

    // Get frequently bought together items
    const frequentlyBoughtTogether = await getFrequentlyBoughtTogether(productId, limit / 2);

    // Get trending products in same category
    const trendingInCategory = await getTrendingInCategory(product.category, limit / 2);

    res.json({
      success: true,
      recommendations: {
        similar: similarProducts,
        frequentlyBoughtTogether,
        trendingInCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get trending products
// @route   GET /api/recommendations/trending
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;

    let query = { status: 'active' };
    if (category) {
      query.category = category;
    }

    // Get trending products based on views, sales, and recency
    const trendingProducts = await Product.find(query)
      .select('-reviews')
      .sort({
        sales: -1,
        views: -1,
        averageRating: -1,
        createdAt: -1
      })
      .limit(limit)
      .populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      products: trendingProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get recommendations based on search query
// @route   GET /api/recommendations/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 10;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Use text search and semantic analysis
    const searchRecommendations = await getSearchBasedRecommendations(query, limit);

    res.json({
      success: true,
      recommendations: searchRecommendations,
      searchQuery: query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get seasonal recommendations
// @route   GET /api/recommendations/seasonal
// @access  Public
router.get('/seasonal', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    
    // Get current season-based recommendations
    const seasonalRecommendations = await getSeasonalRecommendations(limit);

    res.json({
      success: true,
      recommendations: seasonalRecommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Helper function to get user preferences
async function getUserPreferences(userId, userOrders, user) {
  const categories = {};
  const brands = {};
  let totalSpent = 0;
  let itemCount = 0;

  // Analyze purchase history
  userOrders.forEach(order => {
    order.orderItems.forEach(item => {
      if (item.product) {
        categories[item.product.category] = (categories[item.product.category] || 0) + item.quantity;
        brands[item.product.brand] = (brands[item.product.brand] || 0) + item.quantity;
        totalSpent += item.price * item.quantity;
        itemCount += item.quantity;
      }
    });
  });

  // Analyze wishlist and cart
  if (user.wishlist) {
    user.wishlist.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 0.5;
      brands[product.brand] = (brands[product.brand] || 0) + 0.5;
    });
  }

  if (user.cart) {
    user.cart.forEach(cartItem => {
      if (cartItem.product) {
        categories[cartItem.product.category] = (categories[cartItem.product.category] || 0) + 0.3;
        brands[cartItem.product.brand] = (brands[cartItem.product.brand] || 0) + 0.3;
      }
    });
  }

  return {
    categories: Object.keys(categories).sort((a, b) => categories[b] - categories[a]),
    brands: Object.keys(brands).sort((a, b) => brands[b] - brands[a]),
    priceRange: {
      avg: itemCount > 0 ? totalSpent / itemCount : 0,
      max: Math.max(...userOrders.flatMap(order => order.orderItems.map(item => item.price)))
    },
    totalPurchases: itemCount
  };
}

// Collaborative filtering recommendations
async function getCollaborativeRecommendations(userId, limit) {
  try {
    // Get users who bought similar products
    const userOrders = await Order.find({ user: userId, isPaid: true });
    const userProductIds = userOrders.flatMap(order => 
      order.orderItems.map(item => item.product.toString())
    );

    if (userProductIds.length === 0) {
      return [];
    }

    // Find other users who bought similar products
    const similarUsers = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          'orderItems.product': { $in: userProductIds.map(id => mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $group: {
          _id: '$user',
          commonProducts: { $addToSet: '$orderItems.product' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { _id: { $ne: mongoose.Types.ObjectId(userId) } }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Get products bought by similar users but not by current user
    const similarUserIds = similarUsers.map(user => user._id);
    const recommendedProducts = await Order.aggregate([
      {
        $match: {
          user: { $in: similarUserIds },
          isPaid: true,
          'orderItems.product': { $nin: userProductIds.map(id => mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $group: {
          _id: '$orderItems.product',
          score: { $sum: 1 },
          avgPrice: { $avg: '$orderItems.price' }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $limit: limit
      }
    ]);

    // Populate product details
    const productIds = recommendedProducts.map(item => item._id);
    const products = await Product.find({ 
      _id: { $in: productIds }, 
      status: 'active' 
    }).select('-reviews');

    return products.map(product => ({
      ...product.toObject(),
      recommendationScore: recommendedProducts.find(item => 
        item._id.toString() === product._id.toString()
      )?.score || 0,
      recommendationType: 'collaborative'
    }));
  } catch (error) {
    console.error('Collaborative filtering error:', error);
    return [];
  }
}

// Content-based filtering recommendations
async function getContentBasedRecommendations(userPreferences, limit) {
  try {
    const { categories, brands, priceRange } = userPreferences;

    if (categories.length === 0) {
      // Return popular products if no preferences
      return await Product.find({ status: 'active' })
        .select('-reviews')
        .sort({ averageRating: -1, sales: -1 })
        .limit(limit);
    }

    // Build weighted query based on user preferences
    const categoryWeights = categories.slice(0, 3); // Top 3 categories
    const brandWeights = brands.slice(0, 3); // Top 3 brands

    const products = await Product.find({
      status: 'active',
      $or: [
        { category: { $in: categoryWeights } },
        { brand: { $in: brandWeights } }
      ]
    }).select('-reviews');

    // Score products based on user preferences
    const scoredProducts = products.map(product => {
      let score = 0;
      
      // Category preference score
      const categoryIndex = categoryWeights.indexOf(product.category);
      if (categoryIndex !== -1) {
        score += (3 - categoryIndex) * 3; // Higher weight for preferred categories
      }

      // Brand preference score
      const brandIndex = brandWeights.indexOf(product.brand);
      if (brandIndex !== -1) {
        score += (3 - brandIndex) * 2; // Medium weight for preferred brands
      }

      // Price preference score
      if (priceRange.avg > 0) {
        const priceDifference = Math.abs(product.price - priceRange.avg) / priceRange.avg;
        score += Math.max(0, 2 - priceDifference); // Higher score for similar price range
      }

      // Quality score
      score += product.averageRating || 0;
      score += Math.min(product.sales / 100, 2); // Sales popularity (max 2 points)

      return {
        ...product.toObject(),
        recommendationScore: score,
        recommendationType: 'content-based'
      };
    });

    return scoredProducts
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Content-based filtering error:', error);
    return [];
  }
}

// Combine different recommendation types
async function combineRecommendations(collaborative, contentBased, userPreferences, limit) {
  const combined = [...collaborative, ...contentBased];
  
  // Remove duplicates
  const uniqueProducts = combined.reduce((acc, product) => {
    if (!acc.find(p => p._id.toString() === product._id.toString())) {
      acc.push(product);
    }
    return acc;
  }, []);

  // Sort by combined score
  return uniqueProducts
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

// Get similar products based on product features
async function getSimilarProducts(product, limit) {
  const similarProducts = await Product.find({
    _id: { $ne: product._id },
    status: 'active',
    $or: [
      { category: product.category },
      { brand: product.brand },
      { tags: { $in: product.tags || [] } }
    ]
  })
    .select('-reviews')
    .sort({ averageRating: -1, sales: -1 })
    .limit(limit);

  return similarProducts;
}

// Get frequently bought together items
async function getFrequentlyBoughtTogether(productId, limit) {
  try {
    const frequentlyBought = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          'orderItems.product': mongoose.Types.ObjectId(productId)
        }
      },
      {
        $unwind: '$orderItems'
      },
      {
        $match: {
          'orderItems.product': { $ne: mongoose.Types.ObjectId(productId) }
        }
      },
      {
        $group: {
          _id: '$orderItems.product',
          frequency: { $sum: 1 }
        }
      },
      {
        $sort: { frequency: -1 }
      },
      {
        $limit: limit
      }
    ]);

    const productIds = frequentlyBought.map(item => item._id);
    const products = await Product.find({ 
      _id: { $in: productIds }, 
      status: 'active' 
    }).select('-reviews');

    return products;
  } catch (error) {
    console.error('Frequently bought together error:', error);
    return [];
  }
}

// Get trending products in category
async function getTrendingInCategory(category, limit) {
  return await Product.find({
    category,
    status: 'active'
  })
    .select('-reviews')
    .sort({ sales: -1, views: -1, createdAt: -1 })
    .limit(limit);
}

// Get search-based recommendations using NLP
async function getSearchBasedRecommendations(query, limit) {
  try {
    // Tokenize and stem the search query
    const tokens = natural.WordTokenizer().tokenize(query.toLowerCase());
    const stems = tokens.map(token => natural.PorterStemmer.stem(token));

    // Build text search query
    const products = await Product.find({
      $text: { $search: query },
      status: 'active'
    })
      .select('-reviews')
      .sort({ score: { $meta: 'textScore' }, averageRating: -1 })
      .limit(limit);

    return products;
  } catch (error) {
    console.error('Search-based recommendations error:', error);
    return [];
  }
}

// Get seasonal recommendations
async function getSeasonalRecommendations(limit) {
  const currentMonth = new Date().getMonth() + 1;
  let seasonalTags = [];

  if (currentMonth >= 3 && currentMonth <= 5) {
    seasonalTags = ['spring', 'outdoor', 'garden', 'fashion'];
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    seasonalTags = ['summer', 'outdoor', 'sports', 'vacation', 'swimwear'];
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    seasonalTags = ['fall', 'autumn', 'back-to-school', 'warm', 'cozy'];
  } else {
    seasonalTags = ['winter', 'holiday', 'warm', 'indoor', 'gifts'];
  }

  return await Product.find({
    status: 'active',
    $or: [
      { tags: { $in: seasonalTags } },
      { category: { $in: getSeasonalCategories(currentMonth) } }
    ]
  })
    .select('-reviews')
    .sort({ averageRating: -1, sales: -1 })
    .limit(limit);
}

function getSeasonalCategories(month) {
  if (month >= 3 && month <= 5) {
    return ['Home & Garden', 'Sports & Outdoors', 'Clothing & Fashion'];
  } else if (month >= 6 && month <= 8) {
    return ['Sports & Outdoors', 'Clothing & Fashion', 'Electronics'];
  } else if (month >= 9 && month <= 11) {
    return ['Clothing & Fashion', 'Electronics', 'Books & Media'];
  } else {
    return ['Electronics', 'Toys & Games', 'Home & Garden'];
  }
}

module.exports = router;