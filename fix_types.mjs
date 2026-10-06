import fs from 'fs';

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/from '@types'/g, "from '@app-types'");
  fs.writeFileSync(file, content);
}

fix('ml/optimizer.ts');
fix('ml/predictor.ts');
fix('thermal-engine/thermal.ts');
