const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const unminify = require('unminify');

function getPackageMain(packageName) {
    const pkg = require(packageName + '/package.json');
    return packageName + '/' + pkg.main;
}

function copyMain(packageName) {
    const packageMain = getPackageMain(packageName);
    const tmpPackagePath = 'tmp/' + path.dirname(packageMain);

    mkdirp.sync(tmpPackagePath);

    const src = fs.readFileSync('node_modules/' + packageMain, 'utf-8');
    const dst = unminify.unminifySource(src, {
        safety: unminify.safetyLevels.USELESS,
    });

    fs.writeFileSync(tmpPackagePath + '/' + path.basename(packageMain), dst);
}

copyMain('automatons');
