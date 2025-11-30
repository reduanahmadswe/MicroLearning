import express from 'express';
import { authGuard } from '../../../middleware/authGuard';
import { validateRequest } from '../../../middleware/validateRequest';
import * as MarketplaceController from './marketplace.controller';
import * as MarketplaceValidation from './marketplace.validation';

const router = express.Router();

// Public routes
router.get('/', MarketplaceController.getMarketplaceItems);
router.get('/stats', MarketplaceController.getMarketplaceStats);
router.get('/:itemId', MarketplaceController.getMarketplaceItemDetails);

// Payment callback routes (SSLCommerz)
router.post('/payment/success', MarketplaceController.paymentSuccess);
router.post('/payment/fail', MarketplaceController.paymentFail);
router.post('/payment/cancel', MarketplaceController.paymentCancel);
router.post('/payment/ipn', MarketplaceController.paymentIPN);

// Protected routes - Items
router.post(
  '/',
  authGuard(),
  validateRequest(MarketplaceValidation.createMarketplaceItemSchema),
  MarketplaceController.createMarketplaceItem
);

router.patch(
  '/:itemId',
  authGuard(),
  validateRequest(MarketplaceValidation.updateMarketplaceItemSchema),
  MarketplaceController.updateMarketplaceItem
);

router.delete('/:itemId', authGuard(), MarketplaceController.deleteMarketplaceItem);

// Protected routes - Purchases
router.post(
  '/purchases',
  authGuard(),
  validateRequest(MarketplaceValidation.createPurchaseSchema),
  MarketplaceController.createPurchase
);

router.get('/purchases/me', authGuard(), MarketplaceController.getUserPurchases);

// Protected routes - Reviews
router.post(
  '/reviews',
  authGuard(),
  validateRequest(MarketplaceValidation.createReviewSchema),
  MarketplaceController.createReview
);

router.patch(
  '/reviews/:reviewId',
  authGuard(),
  validateRequest(MarketplaceValidation.updateReviewSchema),
  MarketplaceController.updateReview
);

// Protected routes - Earnings
router.get('/earnings/me', authGuard(), MarketplaceController.getCreatorEarnings);

export default router;
