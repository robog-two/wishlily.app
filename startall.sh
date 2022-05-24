#!/bin/bash
export ENVIRONMENT=development
echo "VITE_ENVIRONMENT=development" > .env
cd ../mathilda
screen -dmS wlly-mathilda ~/.deno/bin/denon run --allow-net --allow-env $(pwd)/mathilda.ts
cd ../wishlily-db
screen -dmS wlly-db ~/.deno/bin/denon run --allow-read --allow-write --allow-net --allow-env $(pwd)/wishlily-db.ts
cd ../wishlily.app
clear
screen -S wlly-svelte npm run devreal
screen -XS wlly-mathilda quit
screen -XS wlly-db quit
rm -rf .env
