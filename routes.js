const express = require('express');
const path = require('path');
const db = require('./db'); // Import database connection
const router = express.Router();

// Route for checking validity
router.get('/checkvalid', async (req, res) => {
    const collectionName = req.query.collection;
    const field = req.query.field;
    const value = req.query.value;

    if (!collectionName || !field || !value) {
        return res.status(400).json({ error: 'Missing data in request' });
    }

    const collection = db.collection(collectionName);
    const query = { [field]: value };
    const result = await collection.findOne(query);

    if (result) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

// Route for the home page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'homePage.html'));
});

// Route for the play page
router.get('/play', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'play.html'));
});

// Route to retrieve countries
router.get('/countries', async (req, res) => {
    try {
        const collection = db.collection('country');
        const countries = await collection.find().toArray();
        countries.forEach(country => {
            country._id = country._id.toString();  // Convert ObjectId to string
        });
        res.json(countries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
