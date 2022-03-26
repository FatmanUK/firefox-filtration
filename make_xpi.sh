#!/bin/env bash
set -euo pipefail

echo Backing up old xpi file.
mkdir -p pkgs
[ -e *.xpi ] && mv *.xpi pkgs/

echo Making xpi file.
VER=$(/bin/jq <manifest.json .version | tr -d \")
DATE=$(date +%Y%m%d%H%M%S)
/bin/zip -r -FS -mx=9 fff-${VER}.${DATE}.xpi * --exclude '*.xpi' --exclude 'pkgs/*' --exclude '*.sh'

#%ZIP% a -tzip -mx=9 %dest%.xpi chrome\*
#%ZIP% a -tzip -mx=9 %dest%.xpi modules\*
#%ZIP% a -tzip -mx=9 %dest%.xpi install.rdf
#%ZIP% a -tzip -mx=9 %dest%.xpi chrome.manifest
#%ZIP% a -tzip -mx=9 %dest%.xpi defaults\preferences\*
