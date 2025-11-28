const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const CONTACT_FILE = path.join(DATA_DIR, 'contacts.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read JSON safely
function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || 'null') || fallback;
  } catch (e) {
    console.error('Error reading', filePath, e);
    return fallback;
  }
}

// Helper to write JSON safely
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing', filePath, e);
  }
}

// API: Get all listings
app.get('/api/listings', (req, res) => {
  const listings = readJson(LISTINGS_FILE, []);
  res.json(listings);
});

// API: Add a new listing (simple, no auth - for demo only)
app.post('/api/admin/listings', (req, res) => {
  const listings = readJson(LISTINGS_FILE, []);
  const { title, location, price, beds, baths, size, status } = req.body;

  if (!title || !location || !price) {
    return res.status(400).json({ error: 'title, location, and price are required' });
  }

  const newListing = {
    id: Date.now(),
    title,
    location,
    price,
    beds: beds || '',
    baths: baths || '',
    size: size || '',
    status: status || 'For Sale',
    createdAt: new Date().toISOString()
  };

  listings.push(newListing);
  writeJson(LISTINGS_FILE, listings);
  res.json({ success: true, listing: newListing });
});

// API: Contact form
app.post('/api/contact', (req, res) => {
  const contacts = readJson(CONTACT_FILE, []);
  const { name, email, phone, type, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const newContact = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    type: type || 'General',
    message: message || '',
    createdAt: new Date().toISOString()
  };

  contacts.push(newContact);
  writeJson(CONTACT_FILE, contacts);

  res.json({ success: true, message: 'Contact message received. We will get back to you shortly.' });
});

// Fallback route for multi-page app (serves index.html by default)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});