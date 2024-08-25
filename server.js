const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes'); // Import routes

const app = express();
app.use(cors());

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'templates')));

app.use(express.static(path.join(__dirname, 'static')));

// Use the routes defined in routes.js
app.use(routes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
