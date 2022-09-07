#!/usr/bin/env sh
if [ -d ".git" ]; then
    echo "Directory is under the control of git, skipping..."
else
    git init
fi
