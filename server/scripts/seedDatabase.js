const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@salesmart.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    isEmailVerified: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    password: 'password123',
    role: 'user',
    isActive: true,
    isEmailVerified: true,
    addresses: [{
      type: 'home',
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'United States',
      isDefault: true
    }],
    preferences: {
      newsletter: true,
      notifications: true,
      categories: ['Electronics', 'Books & Media'],
      priceRange: { min: 0, max: 500 }
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    password: 'password123',
    role: 'user',
    isActive: true,
    isEmailVerified: true,
    addresses: [{
      type: 'home',
      street: '456 Oak Ave',
      city: 'Somewhere',
      state: 'NY',
      zipCode: '67890',
      country: 'United States',
      isDefault: true
    }]
  }
];

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'The latest iPhone with advanced camera system, A17 Pro chip, and titanium design. Features ProRAW photos, 4K video recording, and all-day battery life.',
    shortDescription: 'Latest iPhone with A17 Pro chip and titanium design',
    price: 999.99,
    originalPrice: 1099.99,
    category: 'Electronics',
    subcategory: 'Smartphones',
    brand: 'Apple',
    sku: 'IPHONE15PRO',
    images: [{
      public_id: 'iphone15pro',
      url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      alt: 'iPhone 15 Pro'
    }],
    stock: 50,
    specifications: [
      { name: 'Display', value: '6.1-inch Super Retina XDR' },
      { name: 'Chip', value: 'A17 Pro' },
      { name: 'Camera', value: '48MP Main, 12MP Ultra Wide, 12MP Telephoto' },
      { name: 'Storage', value: '128GB' }
    ],
    tags: ['smartphone', 'apple', 'pro', 'camera', 'titanium'],
    weight: 0.187,
    featured: true,
    averageRating: 4.8,
    numReviews: 156,
    sales: 234
  },
  {
    name: 'MacBook Air M2',
    description: 'Redesigned around the next-generation M2 chip, MacBook Air is strikingly thin and brings exceptional speed and power efficiency.',
    shortDescription: 'Ultra-thin laptop with M2 chip and all-day battery',
    price: 1199.99,
    originalPrice: 1299.99,
    category: 'Electronics',
    subcategory: 'Laptops',
    brand: 'Apple',
    sku: 'MACBOOKAIRM2',
    images: [{
      public_id: 'macbookair',
      url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500',
      alt: 'MacBook Air M2'
    }],
    stock: 30,
    specifications: [
      { name: 'Chip', value: 'Apple M2' },
      { name: 'Display', value: '13.6-inch Liquid Retina' },
      { name: 'Memory', value: '8GB unified memory' },
      { name: 'Storage', value: '256GB SSD' }
    ],
    tags: ['laptop', 'apple', 'm2', 'thin', 'portable'],
    weight: 1.24,
    featured: true,
    averageRating: 4.7,
    numReviews: 89,
    sales: 167
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality, 30-hour battery life, and quick attention mode.',
    shortDescription: 'Premium noise-canceling wireless headphones',
    price: 399.99,
    originalPrice: 449.99,
    category: 'Electronics',
    subcategory: 'Audio',
    brand: 'Sony',
    sku: 'SONYWH1000XM5',
    images: [{
      public_id: 'sony_headphones',
      url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
      alt: 'Sony WH-1000XM5 Headphones'
    }],
    stock: 75,
    specifications: [
      { name: 'Battery Life', value: '30 hours' },
      { name: 'Noise Canceling', value: 'Industry-leading' },
      { name: 'Quick Charge', value: '3 min for 3 hours playback' },
      { name: 'Weight', value: '250g' }
    ],
    tags: ['headphones', 'wireless', 'noise-canceling', 'sony', 'premium'],
    weight: 0.25,
    featured: true,
    averageRating: 4.6,
    numReviews: 203,
    sales: 345
  },
  {
    name: 'Nike Air Max 270',
    description: 'Inspired by two icons of big Air: the Air Max 180 and Air Max 93, the Air Max 270 is the newest Air Max to feature a large Max Air unit.',
    shortDescription: 'Modern lifestyle sneaker with Max Air cushioning',
    price: 150.00,
    category: 'Clothing & Fashion',
    subcategory: 'Shoes',
    brand: 'Nike',
    sku: 'NIKEAIRMAX270',
    images: [{
      public_id: 'nike_airmax',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      alt: 'Nike Air Max 270'
    }],
    stock: 120,
    specifications: [
      { name: 'Upper', value: 'Mesh and synthetic materials' },
      { name: 'Midsole', value: 'Foam with Max Air unit' },
      { name: 'Outsole', value: 'Rubber with waffle pattern' },
      { name: 'Fit', value: 'True to size' }
    ],
    variants: [{
      name: 'Size',
      options: [
        { value: '8', stock: 20 },
        { value: '9', stock: 25 },
        { value: '10', stock: 30 },
        { value: '11', stock: 25 },
        { value: '12', stock: 20 }
      ]
    }],
    tags: ['sneakers', 'nike', 'air-max', 'running', 'lifestyle'],
    weight: 0.5,
    averageRating: 4.4,
    numReviews: 78,
    sales: 189
  },
  {
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel. Explores how psychology affects our financial decisions.',
    shortDescription: 'Bestselling book on financial psychology and behavior',
    price: 16.99,
    originalPrice: 19.99,
    category: 'Books & Media',
    subcategory: 'Business & Finance',
    brand: 'Harriman House',
    sku: 'PSYCHMONEY',
    images: [{
      public_id: 'psychology_money',
      url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
      alt: 'The Psychology of Money book'
    }],
    stock: 200,
    specifications: [
      { name: 'Author', value: 'Morgan Housel' },
      { name: 'Pages', value: '256' },
      { name: 'Publisher', value: 'Harriman House' },
      { name: 'Language', value: 'English' }
    ],
    tags: ['book', 'finance', 'psychology', 'bestseller', 'money'],
    weight: 0.3,
    averageRating: 4.9,
    numReviews: 412,
    sales: 678
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Electric pressure cooker that combines 7 kitchen appliances in one. Pressure cook, slow cook, rice cooker, steamer, sauté, yogurt maker and warmer.',
    shortDescription: '7-in-1 electric pressure cooker for quick meals',
    price: 79.99,
    originalPrice: 99.99,
    category: 'Home & Garden',
    subcategory: 'Kitchen Appliances',
    brand: 'Instant Pot',
    sku: 'INSTANTPOTDUO7',
    images: [{
      public_id: 'instant_pot',
      url: 'https://images.unsplash.com/photo-1585515656618-3676ad75bb15?w=500',
      alt: 'Instant Pot Duo 7-in-1'
    }],
    stock: 85,
    specifications: [
      { name: 'Capacity', value: '6 Quart' },
      { name: 'Functions', value: '7-in-1' },
      { name: 'Material', value: 'Stainless Steel' },
      { name: 'Warranty', value: '1 Year' }
    ],
    tags: ['kitchen', 'pressure-cooker', 'instant-pot', 'cooking', 'appliance'],
    weight: 5.4,
    featured: true,
    averageRating: 4.5,
    numReviews: 156,
    sales: 289
  },
  {
    name: 'Fitbit Versa 4',
    description: 'Fitness smartwatch with built-in GPS, 6+ day battery life, 40+ exercise modes, and health metrics like stress management.',
    shortDescription: 'Advanced fitness smartwatch with GPS and health tracking',
    price: 229.99,
    originalPrice: 249.99,
    category: 'Electronics',
    subcategory: 'Wearables',
    brand: 'Fitbit',
    sku: 'FITBITVERSA4',
    images: [{
      public_id: 'fitbit_versa',
      url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500',
      alt: 'Fitbit Versa 4'
    }],
    stock: 60,
    specifications: [
      { name: 'Battery Life', value: '6+ days' },
      { name: 'GPS', value: 'Built-in' },
      { name: 'Water Resistance', value: '50 meters' },
      { name: 'Exercise Modes', value: '40+' }
    ],
    tags: ['smartwatch', 'fitness', 'gps', 'health', 'wearable'],
    weight: 0.04,
    averageRating: 4.3,
    numReviews: 134,
    sales: 198
  },
  {
    name: 'LEGO Creator Expert Taj Mahal',
    description: 'Detailed LEGO replica of the iconic Taj Mahal with 5923 pieces. Perfect for adult builders and display.',
    shortDescription: 'Detailed 5923-piece LEGO Taj Mahal building set',
    price: 369.99,
    category: 'Toys & Games',
    subcategory: 'Building Sets',
    brand: 'LEGO',
    sku: 'LEGOTAJMAHAL',
    images: [{
      public_id: 'lego_taj',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      alt: 'LEGO Taj Mahal'
    }],
    stock: 25,
    specifications: [
      { name: 'Pieces', value: '5923' },
      { name: 'Age Range', value: '18+' },
      { name: 'Dimensions', value: '20" x 20" x 8"' },
      { name: 'Theme', value: 'Creator Expert' }
    ],
    tags: ['lego', 'building', 'taj-mahal', 'collector', 'architecture'],
    weight: 7.2,
    averageRating: 4.8,
    numReviews: 67,
    sales: 89
  }
];

// Seed functions
const seedUsers = async () => {
  try {
    await User.deleteMany({});
    
    // Hash passwords before saving
    for (let userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ ${users.length} users seeded successfully`);
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

const seedProducts = async (users) => {
  try {
    await Product.deleteMany({});
    
    // Add created by admin user
    const adminUser = users.find(user => user.role === 'admin');
    const productsWithCreator = sampleProducts.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));
    
    const products = await Product.insertMany(productsWithCreator);
    console.log(`✅ ${products.length} products seeded successfully`);
    return products;
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
};

const seedOrders = async (users, products) => {
  try {
    await Order.deleteMany({});
    
    const regularUsers = users.filter(user => user.role === 'user');
    const orders = [];
    
    // Create sample orders
    for (let i = 0; i < 10; i++) {
      const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let itemsPrice = 0;
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price;
        
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images[0].url,
          price,
          quantity,
          sku: product.sku
        });
        
        itemsPrice += price * quantity;
      }
      
      const shippingPrice = itemsPrice > 100 ? 0 : 10;
      const taxPrice = itemsPrice * 0.08; // 8% tax
      const totalPrice = itemsPrice + shippingPrice + taxPrice;
      
      const order = {
        user: user._id,
        orderItems,
        shippingAddress: user.addresses[0],
        billingAddress: user.addresses[0],
        paymentMethod: 'card',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: Math.random() > 0.3, // 70% chance of being paid
        status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 5)],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      };
      
      if (order.isPaid) {
        order.paidAt = new Date(order.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      }
      
      orders.push(order);
    }
    
    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ ${createdOrders.length} orders seeded successfully`);
    return createdOrders;
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
    throw error;
  }
};

const addSampleReviews = async (users, products) => {
  try {
    const regularUsers = users.filter(user => user.role === 'user');
    
    // Add reviews to some products
    for (let product of products.slice(0, 5)) {
      const numReviews = Math.floor(Math.random() * 5) + 2;
      
      for (let i = 0; i < numReviews; i++) {
        const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 star ratings
        const comments = [
          'Great product! Highly recommended.',
          'Excellent quality and fast shipping.',
          'Worth every penny. Very satisfied.',
          'Good value for money.',
          'Amazing features and build quality.',
          'Fast delivery and great customer service.',
          'Exactly as described. Perfect!',
          'Outstanding product. Will buy again.'
        ];
        
        const review = {
          user: user._id,
          rating,
          comment: comments[Math.floor(Math.random() * comments.length)]
        };
        
        // Check if user already reviewed this product
        const existingReview = product.reviews.find(r => r.user.toString() === user._id.toString());
        if (!existingReview) {
          product.reviews.push(review);
        }
      }
      
      await product.save();
    }
    
    console.log('✅ Sample reviews added successfully');
  } catch (error) {
    console.error('❌ Error adding reviews:', error);
    throw error;
  }
};

const addSampleCartAndWishlist = async (users, products) => {
  try {
    const regularUsers = users.filter(user => user.role === 'user');
    
    for (let user of regularUsers) {
      // Add items to cart
      const cartItems = products.slice(0, 3).map(product => ({
        product: product._id,
        quantity: Math.floor(Math.random() * 3) + 1
      }));
      
      // Add items to wishlist
      const wishlistItems = products.slice(3, 7).map(product => product._id);
      
      user.cart = cartItems;
      user.wishlist = wishlistItems;
      
      await user.save();
    }
    
    console.log('✅ Sample cart and wishlist items added successfully');
  } catch (error) {
    console.error('❌ Error adding cart and wishlist items:', error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    
    const users = await seedUsers();
    const products = await seedProducts(users);
    const orders = await seedOrders(users, products);
    
    await addSampleReviews(users, products);
    await addSampleCartAndWishlist(users, products);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeding Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`🛒 Orders: ${orders.length}`);
    console.log('\n🔑 Admin Login:');
    console.log('Email: admin@salesmart.com');
    console.log('Password: admin123');
    console.log('\n🔑 User Login:');
    console.log('Email: john.doe@email.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };