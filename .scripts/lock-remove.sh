# git -c core.hookspath=/dev/null commit -m "test"
PACKAGEJSON=$(node -p "const package = require('./package.json'); delete package.workspaces; JSON.stringify(package, null, 2);" | jq)

echo $PACKAGEJSON

echo $PACKAGEJSON | jq >./package.json

cat ./package.json

rm yarn.lock
