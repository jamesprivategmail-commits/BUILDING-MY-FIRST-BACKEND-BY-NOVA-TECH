const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// This is the main page
app.get('/', (req, res) => {
  res.send(`
    <h1 style="text-align:center; font-family:Arial; margin-top:100px; color:#25D366;">
      CONGRATULATIONS YOUR BACKEND IS LIVE<br>
      <span style="color:#fff">NOVA TECH</span>
    </h1>
  `);
});

// Test API route
app.get('/api/test', (req, res) => {
  res.json({ 
    status: "success", 
    message: "CONGRATULATIONS YOUR BACKEND IS LIVE - NOVA TECH" 
  });
});

app.listen(PORT, () => {
  console.log(`NOVA TECH Backend running on port ${PORT}`);
});