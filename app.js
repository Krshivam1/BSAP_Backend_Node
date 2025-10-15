const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Import database connection
const db = require('./src/config/database');

// Import Swagger
const { specs, swaggerUi, swaggerUiOptions } = require('./src/config/swagger');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const districtRoutes = require('./src/routes/districtRoutes');
const stateRoutes = require('./src/routes/stateRoutes');
const rangeRoutes = require('./src/routes/rangeRoutes');
const performanceStatisticRoutes = require('./src/routes/performanceStatisticRoutes');
const communicationRoutes = require('./src/routes/communicationRoutes');
const cidRoutes = require('./src/routes/cidRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const subMenuRoutes = require('./src/routes/subMenuRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const permissionRoutes = require('./src/routes/permissionRoutes');
const permissionHandleRoutes = require('./src/routes/permissionHandleRoutes');
const moduleRoutes = require('./src/routes/moduleRoutes');
const topicRoutes = require('./src/routes/topicRoutes');
const subTopicRoutes = require('./src/routes/subTopicRoutes');
const questionRoutes = require('./src/routes/questionRoutes');
const battalionRoutes = require('./src/routes/battalionRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');
const { Battalion } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4200', 'http://localhost:5000' ,'http://164.52.217.93:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// shivam all updated

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));
app.use('/public', express.static(path.join(__dirname, 'src/public')));

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    database: 'connected'
  });
});

// API endpoint documentation
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    database: 'connected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/ranges', rangeRoutes);
app.use('/api/performance-statistics', performanceStatisticRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/cid', cidRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/sub-menus', subMenuRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/sub-topics', subTopicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/permission-handle', permissionHandleRoutes);
app.use('/api/battalions', battalionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Performance Statistics API Server',
    version: process.env.API_VERSION || '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    documentation: '/api/docs',
    health: '/api/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await db.authenticate();
    console.log('✅ Database connected successfully');
    logger.info('Database connected successfully');
    
    // Sync database (in development only)
    if (process.env.NODE_ENV === 'development') {
      await db.sync({ alter: true });
      console.log('✅ Database synchronized');
      logger.info('Database synchronized');
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await db.close();
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(async () => {
        await db.close();
        console.log('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;