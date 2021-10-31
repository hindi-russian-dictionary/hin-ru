import path from 'path';
import express from 'express';

import {app} from 'server/app';
import {manifestUtils} from 'server/lib/manifest-utils';
import {paths} from 'tools/paths';
import {renderApp} from 'server/react/html';
import {mode} from 'tools/mode';

app.use('/static', express.static(path.join(paths.build, 'client')));

const manifest = manifestUtils.getManifest(
  path.join(paths.build, 'client/manifest.json')
);
app.use((req, res) => {
  const scripts = manifestUtils.getScripts(manifest);
  const app = renderApp({
    scripts,
    location: req.url,
    mode,
  });
  res.send(app);
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`HTTP service started at port ${port}`);
});
