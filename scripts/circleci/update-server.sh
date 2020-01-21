#!/bin/bash
set -e
set -u

# Make sure we are building the dist files using the correct version of the source code
git checkout $RELEASE_VERSION
npm run build-server

# Pull the static server repository into a temporary location so we can make changes to it
git clone --depth 1 git@github.com:$SERVER_REPO_ORG/$SERVER_REPO_NAME.git /tmp/repo-server
mkdir -p /tmp/repo-server/public

# Replace the existing dist files with new ones
RELEASE_VERSION_DIR=$(echo $RELEASE_VERSION | cut -d . -f 1)
rm -rf /tmp/repo-server/public/$RELEASE_VERSION_DIR
cp -r dist-server/$RELEASE_VERSION_DIR /tmp/repo-server/public

# Commit the new dist files and push to upstream
cd /tmp/repo-server
git config user.email $GIT_USER_EMAIL
git config user.name $GIT_USER_NAME
git add public
git commit -m "chore(release): $RELEASE_VERSION"
git push --follow-tags origin master
