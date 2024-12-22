const web = require("./website/web.js");
const webhook = require("./webhook.js");
const parser = require("body-parser");
const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs").promises;

app.use('/cache', express.static(path.join(__dirname, 'cache')));
app.use('/tmp', express.static(path.join(__dirname, 'tmp')));

app.use(parser.json());
app.use(express.static("website"));
app.get("/config.json", (req, res) => {
  res.sendFile(path.join(__dirname, "config.json"));
});

app.get("/", (req, res) => {
  web.html(res);
});

app.get("/webhook", (req, res) => {
  web.verify(req, res);
});

setTimeout(() => {
  app.post("/webhook", (req, res) => {
    webhook.listen(req.body);
    res.sendStatus(200);
  });
}, 5000);

// Get JSON file names
app.get('/api/json-files', async (req, res) => {
    const tmpDir = path.join(__dirname, 'tmp'); // Adjust path as needed
    try {
        const files = await fs.readdir(tmpDir);
        const jsonFiles = files.filter(file => path.extname(file) === '.json');
        res.json(jsonFiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to read JSON directory' });
    }
});

// Get JSON file content
app.get('/api/json-content/:filename', async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'tmp', filename); // Adjust path
    try {
        const content = await fs.readFile(filePath, 'utf8');
        res.send(content);
    } catch (error) {
        console.error(error);
        res.status(404).send('File not found');
    }
});

// Get image file names
app.get('/api/image-files', async (req, res) => {
    const cacheDir = path.join(__dirname, 'cache');
    try {
        const files = await fs.readdir(cacheDir);
        const imageFiles = files.filter(file => ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase())); // Added more common image extensions
        res.json(imageFiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to read image directory' });
    }
});
//delete chache images
app.delete('/api/delete-cache-images', async (req, res) => {
    const cacheDir = path.join(__dirname, 'cache');
    try {
        const files = await fs.readdir(cacheDir);
        for (const file of files) {
            await fs.unlink(path.join(cacheDir, file));
        }
        res.status(200).json({ message: 'All images in cache have been deleted.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete images from cache' });
    }
});



app.listen(8080, () => {
  web.log();
});
