import express from 'express';
import clienteRoutes from './routes/clienteRoutes';
import productoRoutes from './routes/productoRoutes';
import ordenRoutes from './routes/ordenRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', clienteRoutes);
app.use('/api', productoRoutes);
app.use('/api', ordenRoutes);

app.get('/', (req, res) => {
  res.send('API de DualTech');
}); 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});