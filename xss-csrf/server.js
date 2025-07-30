import express from 'express';
import cors from 'cors'
const app = express();

app.use(cors())
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

app.listen(5500, () => {
    console.log('Server running at http://localhost:3000');
});
