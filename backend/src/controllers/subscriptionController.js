const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../middlewares/errorHandler').catchAsync;
const ApiError = require('../middlewares/errorHandler').ApiError;
const prisma = new PrismaClient();

const subscriptionPlans = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 2499,
    duration: '1 month',
    features: [
      'Access to all digital books',
      'Mobile app access',
      'Email support',
      'Reading progress sync'
    ]
  },
  quarterly: {
    id: 'quarterly',
    name: 'Quarterly Plan',
    price: 6499,
    duration: '3 months',
    features: [
      'All monthly features',
      'Priority support',
      '10% discount',
      'Offline reading'
    ]
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 24999,
    duration: '1 year',
    features: [
      'All quarterly features',
      '2 months free',
      'Premium support',
      'Exclusive content'
    ]
  }
};

exports.getSubscriptionPlans = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    data: subscriptionPlans,
    message: 'Subscription plans fetched successfully'
  });
});

exports.getSubscriptionPlan = catchAsync(async (req, res) => {
  const { id } = req.params;
  const plan = subscriptionPlans[id];
  
  if (!plan) {
    throw new ApiError(404, 'Subscription plan not found');
  }
  
  res.status(200).json({
    success: true,
    data: plan,
    message: 'Subscription plan fetched successfully'
  });
});
