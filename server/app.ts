import express from 'express';
import {paths} from 'tools/paths';

const app = express();

app.use(express.static(paths.publicDir));
app.get('/ping', (req, res) => res.sendStatus(200));

export {app};
