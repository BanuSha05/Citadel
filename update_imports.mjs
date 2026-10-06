import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

function processFile(filePath) {
    if (!filePath.match(/\.(ts|tsx)$/)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/from\s+['"](?:\.\.\/)*engine\/thermal['"]/g, "from '@thermal/thermal'");
    content = content.replace(/from\s+['"](?:\.\.\/)*engine\/solar['"]/g, "from '@thermal/solar'");
    content = content.replace(/from\s+['"](?:\.\.\/)*engine\/predictor['"]/g, "from '@ml/predictor'");
    content = content.replace(/from\s+['"](?:\.\.\/)*engine\/optimizer['"]/g, "from '@ml/optimizer'");
    content = content.replace(/from\s+['"](?:\.\.\/)*data\/climates['"]/g, "from '@data/climates'");
    content = content.replace(/from\s+['"](?:\.\.\/)*data\/materials['"]/g, "from '@data/materials'");
    content = content.replace(/from\s+['"](?:\.\.\/)*assets\/([^'"]+)['"]/g, "from '/$1'");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
}

['frontend', 'thermal-engine', 'ml', 'database'].forEach(dir => {
    let p = path.join('c:/Users/PC User/Citadel', dir);
    if (fs.existsSync(p)) walkDir(p, processFile);
});
