import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import prisma from './shared/database/connection.js';
import { logger } from './shared/logger/logger.js';
import { securityHeaders } from './shared/middleware/security-headers.js';
import { globalLimiter } from './shared/middleware/rate-limiter.js';
import { requestLogger } from './shared/middleware/request-logger.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import { sseManager } from './modules/notifications/sse-manager.js';

// Repositories
import { UserRepository } from './modules/users/user.repository.js';
import { CatalogRepository } from './modules/catalog/catalog.repository.js';
import { InventoryRepository } from './modules/inventory/inventory.repository.js';
import { OrderRepository } from './modules/orders/order.repository.js';
import { AnalyticsRepository } from './modules/analytics/analytics.repository.js';
import { NotificationRepository } from './modules/notifications/notification.repository.js';

// Services
import { AuthService } from './modules/users/auth.service.js';
import { UserService } from './modules/users/user.service.js';
import { CatalogService } from './modules/catalog/catalog.service.js';
import { InventoryService } from './modules/inventory/inventory.service.js';
import { ReservationService } from './modules/inventory/reservation.service.js';
import { OrderService } from './modules/orders/order.service.js';
import { AnalyticsService } from './modules/analytics/analytics.service.js';
import { NotificationService } from './modules/notifications/notification.service.js';

// Routes
import { createUserRoutes } from './modules/users/user.routes.js';
import { createCatalogRoutes } from './modules/catalog/catalog.routes.js';
import { createInventoryRoutes } from './modules/inventory/inventory.routes.js';
import { createOrderRoutes } from './modules/orders/order.routes.js';
import { createAnalyticsRoutes } from './modules/analytics/analytics.routes.js';
import { createNotificationRoutes, createSSERoutes } from './modules/notifications/notification.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- DI Assembly ---
const userRepo = new UserRepository();
const catalogRepo = new CatalogRepository();
const inventoryRepo = new InventoryRepository();
const orderRepo = new OrderRepository();
const analyticsRepo = new AnalyticsRepository();
const notificationRepo = new NotificationRepository();

const authService = new AuthService(userRepo);
const userService = new UserService(userRepo);
const catalogService = new CatalogService(catalogRepo);
const inventoryService = new InventoryService(inventoryRepo);
const reservationService = new ReservationService(inventoryRepo);
const orderService = new OrderService(orderRepo, reservationService, catalogRepo);
const analyticsService = new AnalyticsService(analyticsRepo);
const notificationService = new NotificationService(notificationRepo);

// --- Express App ---
const app = express();
const PORT = process.env.PORT || 3000;

app.use(securityHeaders);
app.use(globalLimiter);
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// --- Routes ---
app.use('/api', createUserRoutes(authService, userService));
app.use('/api/products', createCatalogRoutes(catalogService));
app.use('/api/inventory', createInventoryRoutes(inventoryService));
app.use('/api/orders', createOrderRoutes(orderService));
app.use('/api/analytics', createAnalyticsRoutes(analyticsService));
app.use('/api/notifications', createNotificationRoutes(notificationService));
app.use('/api/sse', createSSERoutes());

app.use(errorHandler);

// --- Reservation Timeout Scheduler ---
const schedulerInterval = setInterval(() => {
  reservationService.expireReservations().catch((err) => logger.error({ err }, 'Reservation expiry failed'));
}, 60000);

// --- Graceful Shutdown ---
const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server started');
});

const shutdown = async () => {
  logger.info('Shutting down...');
  clearInterval(schedulerInterval);
  sseManager.closeAll();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
