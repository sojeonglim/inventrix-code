import { Router } from 'express';
import { CatalogService } from './catalog.service.js';
import { authenticate, AuthRequest } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { validate } from '../../shared/middleware/validate.js';
import { createProductSchema, updateProductSchema, generateImageSchema, productFiltersSchema } from './catalog.validation.js';
import { auditLog } from '../../shared/logger/audit-logger.js';

export function createCatalogRoutes(catalogService: CatalogService): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const filters = productFiltersSchema.parse(req.query);
      res.json(await catalogService.getProducts(filters));
    } catch (err) { next(err); }
  });

  router.get('/:id', async (req, res, next) => {
    try { res.json(await catalogService.getProductById(req.params.id)); }
    catch (err) { next(err); }
  });

  router.post('/', authenticate, authorize('admin'), validate(createProductSchema), async (req: AuthRequest, res, next) => {
    try {
      const product = await catalogService.createProduct(req.body);
      await auditLog({ userId: req.user!.userId, action: 'PRODUCT_CREATED', resourceType: 'Product', resourceId: product.id, newValue: req.body });
      res.status(201).json(product);
    } catch (err) { next(err); }
  });

  router.put('/:id', authenticate, authorize('admin'), validate(updateProductSchema), async (req: AuthRequest, res, next) => {
    try {
      const product = await catalogService.updateProduct(req.params.id, req.body);
      await auditLog({ userId: req.user!.userId, action: 'PRODUCT_UPDATED', resourceType: 'Product', resourceId: req.params.id, newValue: req.body });
      res.json(product);
    } catch (err) { next(err); }
  });

  router.delete('/:id', authenticate, authorize('admin'), async (req: AuthRequest, res, next) => {
    try {
      await catalogService.deleteProduct(req.params.id);
      await auditLog({ userId: req.user!.userId, action: 'PRODUCT_DELETED', resourceType: 'Product', resourceId: req.params.id });
      res.status(204).send();
    } catch (err) { next(err); }
  });

  router.post('/generate-image', authenticate, authorize('admin'), validate(generateImageSchema), async (_req, res, next) => {
    try {
      const imageUrl = await catalogService.generateImage(_req.body.productName, _req.body.description);
      res.json({ imageUrl });
    } catch (err) { next(err); }
  });

  return router;
}
