const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least $0.50'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId: orderId || '',
        userId: req.user.id,
        userEmail: req.user.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID if orderId provided
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        stripePaymentIntentId: paymentIntent.id
      });
    }

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
});

// @desc    Confirm payment
// @route   POST /api/payments/confirm-payment
// @access  Private
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'confirmed';
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: req.user.email
      };

      await order.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
});

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private/Admin
router.post('/refund', protect, async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.isPaid || !order.stripePaymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Order is not paid or missing payment information'
      });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
      reason: reason || 'requested_by_customer',
      metadata: {
        orderId: orderId,
        refundReason: reason || 'Customer request'
      }
    });

    // Update order with refund information
    order.refund = {
      requested: true,
      requestedAt: new Date(),
      reason: reason || 'Customer request',
      amount: refund.amount / 100,
      status: 'processed',
      processedAt: new Date(),
      refundId: refund.id
    };

    if (refund.amount >= order.totalPrice * 100) {
      order.status = 'refunded';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
});

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Private
router.get('/methods', protect, async (req, res) => {
  try {
    // For now, return static payment methods
    // In production, you might want to integrate with Stripe's Payment Methods API
    const paymentMethods = [
      {
        id: 'card',
        type: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        enabled: true
      },
      {
        id: 'apple_pay',
        type: 'apple_pay',
        name: 'Apple Pay',
        description: 'Pay with Touch ID or Face ID',
        enabled: true
      },
      {
        id: 'google_pay',
        type: 'google_pay',
        name: 'Google Pay',
        description: 'Quick and secure payments',
        enabled: true
      }
    ];

    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods',
      error: error.message
    });
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update order if orderId exists in metadata
        if (paymentIntent.metadata.orderId) {
          await Order.findByIdAndUpdate(paymentIntent.metadata.orderId, {
            isPaid: true,
            paidAt: new Date(),
            status: 'confirmed',
            paymentResult: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              update_time: new Date().toISOString()
            }
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Handle failed payment
        if (failedPayment.metadata.orderId) {
          await Order.findByIdAndUpdate(failedPayment.metadata.orderId, {
            status: 'payment_failed',
            paymentResult: {
              id: failedPayment.id,
              status: failedPayment.status,
              error: failedPayment.last_payment_error?.message || 'Payment failed'
            }
          });
        }
        break;

      case 'refund.created':
        const refund = event.data.object;
        console.log('Refund created:', refund.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

module.exports = router;