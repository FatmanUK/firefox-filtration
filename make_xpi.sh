#!/bin/env bash
set -euo pipefail

echo Backing up old xpi file.
mkdir -p pkgs
[ -e *.xpi ] && mv *.xpi pkgs/

echo Making xpi file.
VER=$(/bin/jq <manifest.json .version | tr -d \")
DATE=$(date +%Y%m%d%H%M%S)
/bin/zip -r -FS fff-${VER}.${DATE}.xpi * -x '*.xpi' -x 'pkgs/*' -x '*.sh'
