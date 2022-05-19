#!/bin/sh

if [ "$HEROKU_API_KEY" = "" ]
then
    echo -n "HEROKU_API_KEY: "
    read HEROKU_API_KEY
fi

dpl --provider=heroku --app=comp1531quiz --api-key=$HEROKU_API_KEY
