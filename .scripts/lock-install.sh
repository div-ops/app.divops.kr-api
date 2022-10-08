PACKAGEJSON=$(node -p "const package = require('./package.json'); package.workspaces=['shared/*']; JSON.stringify(package, null, 2);" | jq)

echo $PACKAGEJSON

echo $PACKAGEJSON | jq >./package.json

cat ./package.json

git submodule update --init

YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install
