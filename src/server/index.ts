import path from 'path';
import fs from 'fs';
import express from 'express';

const root = path.join(__dirname, '../../');
const buildPath = path.join(root, 'build');

const app = express();

const indexFile = fs.readFileSync(path.join(buildPath, 'index.html'));
app.use(express.static(buildPath));
app.use('*', (_req, res) => {
  res.send(indexFile);
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`HTTP service started at port ${port}`);
});
