#!/usr/bin/env bash

set -o xtrace

WORKING_DIRECTORY="www/lab08_quiz"
USERNAME="comp1531quiz"
SSH_HOST="ssh-comp1531quiz.alwaysdata.net"

# Can also use scp but this is more efficient.
rsync\
    --archive\
    --verbose\
    --progress\
    package.json package-lock.json ./tsconfig.json ./src\
    $USERNAME@$SSH_HOST:$WORKING_DIRECTORY

ssh "$USERNAME@$SSH_HOST" "cd $WORKING_DIRECTORY && npm install --only=production"
