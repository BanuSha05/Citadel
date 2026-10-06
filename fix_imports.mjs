import fs from 'fs';
let opt = fs.readFileSync('ml/optimizer.ts', 'utf8');
opt = opt.replace(/from '\.\.\/types'/g, "from '@types'");
fs.writeFileSync('ml/optimizer.ts', opt);

let pred = fs.readFileSync('ml/predictor.ts', 'utf8');
pred = pred.replace(/from '\.\.\/types'/g, "from '@types'");
pred = pred.replace(/from '\.\/thermal'/g, "from '@thermal/thermal'");
fs.writeFileSync('ml/predictor.ts', pred);

let therm = fs.readFileSync('thermal-engine/thermal.ts', 'utf8');
therm = therm.replace(/from '\.\.\/types'/g, "from '@types'");
fs.writeFileSync('thermal-engine/thermal.ts', therm);
