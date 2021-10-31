import fs from 'fs';
import path from 'path';

import {paths} from 'tools/paths';

const copyPublic = () => {
  fs.copyFileSync(paths.publicDir, path.join(paths.build, 'client'));
};

function run() {
  copyPublic();
}

run();
