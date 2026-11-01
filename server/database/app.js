const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = Number(process.env.PORT || 3030);
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dealershipsDB';
const Reviews = require('./review');
const Dealerships = require('./dealership');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (_req, res) => res.send('Welcome to the Dealerships API'));

app.get('/fetchReviews', async (_req, res) => {
  try { res.json(await Reviews.find().lean()); }
  catch (error) { res.status(500).json({ error: 'Error fetching reviews' }); }
});

app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try { res.json(await Reviews.find({ dealership: Number(req.params.id) }).lean()); }
  catch (error) { res.status(500).json({ error: 'Error fetching reviews' }); }
});

app.get('/fetchDealers', async (_req, res) => {
  try { res.json(await Dealerships.find().sort({ id: 1 }).lean()); }
  catch (error) { res.status(500).json({ error: 'Error fetching dealerships' }); }
});

app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const query = state.toLowerCase() === 'all' ? {} : { state: new RegExp(`^${state}$`, 'i') };
    res.json(await Dealerships.find(query).sort({ id: 1 }).lean());
  } catch (error) { res.status(500).json({ error: 'Error fetching dealerships' }); }
});

app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealer = await Dealerships.findOne({ id: Number(req.params.id) }).lean();
    if (!dealer) return res.status(404).json({ error: 'Dealership not found' });
    return res.json(dealer);
  } catch (error) { return res.status(500).json({ error: 'Error fetching dealership' }); }
});

app.post('/insert_review', async (req, res) => {
  try {
    const required = ['name', 'dealership', 'review', 'purchase', 'purchase_date', 'car_make', 'car_model', 'car_year'];
    const missing = required.filter((key) => req.body[key] === undefined || req.body[key] === '');
    if (missing.length) return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
    const dealerId = Number(req.body.dealership);
    if (!await Dealerships.exists({ id: dealerId })) return res.status(404).json({ error: 'Dealership not found' });
    const latest = await Reviews.findOne().sort({ id: -1 }).select({ id: 1 }).lean();
    const review = await Reviews.create({ ...req.body, dealership: dealerId, id: (latest?.id || 0) + 1, car_year: Number(req.body.car_year) });
    return res.status(201).json(review);
  } catch (error) { return res.status(500).json({ error: 'Error inserting review' }); }
});

async function seedIfEmpty() {
  if (await Dealerships.estimatedDocumentCount() === 0) {
    const file = path.join(__dirname, 'data', 'dealerships.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8')).dealerships;
    if (data.length) await Dealerships.insertMany(data);
  }
  if (await Reviews.estimatedDocumentCount() === 0) {
    const file = path.join(__dirname, 'data', 'reviews.json');
    const data = JSON.parse(fs.readFileSync(file, 'utf8')).reviews;
    if (data.length) await Reviews.insertMany(data);
  }
}

if (require.main === module) {
  mongoose.connect(mongoUri)
    .then(seedIfEmpty)
    .then(() => app.listen(port, () => console.log(`Dealership API listening on port ${port}`)))
    .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exitCode = 1; });
}

module.exports = app;
