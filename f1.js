import express from 'express';
import { getDB } from '../db.js';
import { parseOperator } from '../utils/opParser.js';


const router = express.Router();


// GET /api/recipes?page=&limit= — paginated, sorted by rating desc
router.get('/', async (req, res, next) => {
try {
const db = getDB();
const page = Math.max(parseInt(req.query.page) || 1, 1);
const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
const skip = (page - 1) * limit;


const coll = db.collection('recipes');
const [data, total] = await Promise.all([
coll.find().sort({ rating: -1, _id: 1 }).skip(skip).limit(limit).toArray(),
coll.countDocuments()
]);


res.json({ page, limit, total, data });
} catch (err) {
next(err);
}
});


// GET /api/recipes/search?calories=<=400&title=pie&cuisine=Italian&total_time=<=120&rating=>=4.5
router.get('/search', async (req, res, next) => {
try {
const db = getDB();
const { title, cuisine, calories, total_time, rating } = req.query;


const filter = {};


if (title) filter.title = { $regex: String(title), $options: 'i' };
if (cuisine) filter.cuisine = String(cuisine);
if (rating) filter.rating = parseOperator(rating, 'rating');
if (total_time) filter.total_time = parseOperator(total_time, 'total_time');
if (calories) {
const cond = parseOperator(calories, 'calories');
filter.$or = [{ calories: cond }, { 'nutrients.calories': cond }];
}


const results = await db
.collection('recipes')
.find(filter)
.sort({ rating: -1, _id: 1 })
.limit(200)
.toArray();


res.json({ data: results });
} catch (err) {
if (!err.status) err.status = 400;
next(err);
}
});


export default router;
