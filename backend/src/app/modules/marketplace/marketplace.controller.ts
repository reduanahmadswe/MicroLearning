import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import * as MarketplaceService from './marketplace.service';

export const createMarketplaceItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await MarketplaceService.createMarketplaceItem(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Marketplace item created successfully',
    data: result,
  });
});

export const getMarketplaceItems = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    query: req.query.query as string,
    itemType: req.query.itemType as 'lesson' | 'course' | 'bundle',
    category: req.query.category as string,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
    maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
    creatorId: req.query.creatorId as string,
    sortBy: (req.query.sortBy as any) || 'recent',
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };

  const result = await MarketplaceService.getMarketplaceItems(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Marketplace items retrieved successfully',
    data: result.items,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

export const getMarketplaceItemDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await MarketplaceService.getMarketplaceItemDetails(req.params.itemId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Marketplace item details retrieved successfully',
    data: result,
  });
});

export const updateMarketplaceItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await MarketplaceService.updateMarketplaceItem(req.params.itemId, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Marketplace item updated successfully',
    data: result,
  });
});

export const deleteMarketplaceItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await MarketplaceService.deleteMarketplaceItem(req.params.itemId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null,
  });
});

export const createPurchase = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await MarketplaceService.createPurchase(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Purchase completed successfully',
    data: result,
  });
});

export const getUserPurchases = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await MarketplaceService.getUserPurchases(userId, page, limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Purchases retrieved successfully',
    data: result.purchases,
    meta: {
      page: result.pagination.currentPage,
      limit: result.pagination.itemsPerPage,
      total: result.pagination.totalItems,
    },
  });
});

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await MarketplaceService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await MarketplaceService.updateReview(req.params.reviewId, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

export const getMarketplaceStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await MarketplaceService.getMarketplaceStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Marketplace statistics retrieved successfully',
    data: result,
  });
});

export const getCreatorEarnings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await MarketplaceService.getCreatorEarnings(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Creator earnings retrieved successfully',
    data: result,
  });
});
