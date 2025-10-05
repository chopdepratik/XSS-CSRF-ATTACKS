import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise'; // <-- corrected: use promise API

const app = express();
app.use(express.json());

app.use(cors());
app.get('/', (req, res) => {
    const userInput = req.query.userInput || '';

    res.send(`
        <html>
            <head><title>Reflected XSS Demo</title></head>
            <body>
                <h2>Welcome!</h2>
                <p>You searched for: ${userInput}</p>
                
            </body>
        </html>
    `);
});


app.post('/stored', async (req, res) => {
    try {
        const { content, mode } = req.body;
        console.log(mode)
        // simple HTML escape for safe mode
        function escapeHtml(s) {
            if (s == null) return '';
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        const toStore = mode === 'safe' ? escapeHtml(content) : content;

        // insert into DB using the existing pool (parameterized query)
        await pool.execute('INSERT INTO entries (content, mode) VALUES (?, ?)', [toStore, mode]);

        res.status(201).send(`Saved in ${mode} mode.`);
    } catch (error) {
        console.error('Error in /stored:', error);
        res.status(500).send('DB error');
    }
})
// Add this directly after your POST /stored route
app.get('/storedFetch', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, content, mode, created_at FROM entries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error in GET /stored:', err);
    res.status(500).json({ error: 'DB error' });
  }
});


const DB_CONFIG = {
    host: "localhost",
    user: "root",
    password: "#Mysqlroot#123",
    database: "xss",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};
let pool;
async function initDb() {
    pool = await mysql.createPool(DB_CONFIG); // <-- corrected to use promise pool
    console.log("connected")
    // optional: ensure table exists (safe to run if table already exists)
    await pool.execute(`
    CREATE TABLE IF NOT EXISTS entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content TEXT NOT NULL,
      mode ENUM('safe','unsafe') NOT NULL DEFAULT 'unsafe',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

await initDb();
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
