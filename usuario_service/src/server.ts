import express from 'express';
import userRoutes from './routes/userRoutes';

const app = express();
app.use(express.json());

app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
