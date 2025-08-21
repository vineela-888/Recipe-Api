import dotenv from 'dotenv';
dotenv.config();


import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db.js';
import recipesRouter from './routes/recipes.js';


const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));


app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/recipes', recipesRouter);


// Uniform JSON error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
const status = err.status || 500;
res.status(status).json({ error: true, message: err.message || 'Server error' });
});


const PORT = process.env.PORT || 4000;


connectDB()
.then(() => {
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
})
.catch((e) => {
console.error('Failed to connect DB', e);
process.exit(1);
});
