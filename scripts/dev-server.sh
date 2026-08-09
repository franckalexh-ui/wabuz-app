#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev --port 3000
  echo "Server exited, restarting in 2s..."
  sleep 2
done
