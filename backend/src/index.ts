
import app from './config/app';
import connectDatabase from './config/database';

// Initialize DB connection
connectDatabase();

// Export the Express app
export default app;
