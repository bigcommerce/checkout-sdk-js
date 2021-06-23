#!/bin/bash
set -e
set -u

# Clone checkout-sdk-js-server repo
git clone --depth 1 git@github.com:bigcommerce/checkout-sdk-js-server.git /tmp/repo-server

# Copy previous releases into a folder for further modification
cp -rf /tmp/repo-server/public/* ~/repo/dist-cdn

# Rewrite the placeholder text contained in those releases with the production URL
for file in ~/repo/dist-cdn/*/loader-v*.js; do
  sed -i "s#__ASSET_HOST__#https://checkout-sdk.bigcommerce.com#g" $file
done
