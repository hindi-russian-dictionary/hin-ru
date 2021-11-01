import fs from 'fs';
import path from 'path';

import 'tools/dotenv';
import 'tools/ignore-extensions';
import {renderApp} from 'server/react/html';
import {paths} from 'tools/paths';
import {manifestUtils} from 'server/lib/manifest-utils';

const generateHtml = () => {
  fs.writeFileSync(
    path.join(paths.build, 'client/index.html'),
    renderApp({
      scripts: manifestUtils.getScripts(
        manifestUtils.getManifest(
          path.join(paths.build, 'client/manifest.json')
        )
      ),
      location: '/',
      mode: 'production',
    })
  );
};

function run() {
  console.log('Ready to generate HTML');
  generateHtml();
  console.log('HTML generated');
  process.exit(0);
}

run();
