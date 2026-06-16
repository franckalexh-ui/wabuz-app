#!/usr/bin/env bash
# Smoke test for the new ClientOrders component.
# Keeps the Next.js dev server alive for the duration of the test.
set -u

PROJECT_DIR="/home/z/my-project"
SHOT_DIR="$PROJECT_DIR/screenshots/smoke2"
mkdir -p "$SHOT_DIR"

cd "$PROJECT_DIR"

# --- 1. Start dev server (detached, own session) ---------------------------
pkill -f "next dev" 2>/dev/null
pkill -f "next-server" 2>/dev/null
sleep 1
rm -f dev.log
setsid sh -c './node_modules/.bin/next dev -p 3000 > dev.log 2>&1' < /dev/null > /dev/null 2>&1 &
disown 2>/dev/null || true

READY=0
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
  if [ "$code" = "200" ]; then
    echo "==> dev server ready after ${i}s (HTTP $code)"
    READY=1
    break
  fi
  sleep 1
done
if [ "$READY" != "1" ]; then
  echo "!! dev server did not become ready"
  tail -n 20 dev.log
  exit 1
fi

# --- 2. Make sure no stale browser session -------------------------------
agent-browser close >/dev/null 2>&1 || true

echo "==> opening http://localhost:3000"
agent-browser open http://localhost:3000
agent-browser set viewport 420 900
agent-browser wait --load networkidle

echo "==> snapshot (interactive) of home"
agent-browser snapshot -i -c > "$SHOT_DIR/00-home-snapshot.txt" 2>&1
head -n 60 "$SHOT_DIR/00-home-snapshot.txt"

# --- 3. Click the Commandes tab (3rd in bottom nav) ----------------------
echo "==> looking for Commandes nav button"
agent-browser snapshot -i -c > "$SHOT_DIR/01-home-nav.txt" 2>&1

# Try semantic locator first
agent-browser find role button click --name "Commandes" 2>&1 | head -5
agent-browser wait 500

echo "==> screenshot after Commandes click"
agent-browser screenshot "$SHOT_DIR/02-commandes-initial.png"
agent-browser wait 500

echo "==> snapshot of orders view"
agent-browser snapshot -i -c > "$SHOT_DIR/03-orders-snapshot.txt" 2>&1
head -n 100 "$SHOT_DIR/03-orders-snapshot.txt"

# --- 4. Verify En cours tab + iPhone card -------------------------------
echo "==> full-text snapshot to verify content"
agent-browser snapshot > "$SHOT_DIR/04-orders-full.txt" 2>&1

echo "==> screenshot: En cours (iPhone) view"
agent-browser screenshot "$SHOT_DIR/05-en-cours-iphone.png"

# --- 5. Click Terminées tab + verify Robe Wax ---------------------------
echo "==> clicking Terminées tab"
agent-browser find role button click --name "Terminées" 2>&1 | head -5
agent-browser wait 500
agent-browser screenshot "$SHOT_DIR/06-terminées-robewax.png"
agent-browser snapshot > "$SHOT_DIR/07-terminées-full.txt" 2>&1

# --- 6. Back to En cours ------------------------------------------------
echo "==> back to En cours tab"
agent-browser find role button click --name "En cours" 2>&1 | head -5
agent-browser wait 500

# --- 7. Install window.confirm spy BEFORE clicking confirm --------------
echo "==> installing window.confirm spy (records call + message, returns true)"
agent-browser eval "(() => { window.__confirmCalled = false; window.__confirmMsg = null; window.__confirmOrig = window.confirm; window.confirm = (msg) => { window.__confirmCalled = true; window.__confirmMsg = msg; return true; }; return 'spy installed'; })();"

# --- 8. Click Confirmer la réception ------------------------------------
echo "==> clicking 'Confirmer la réception'"
agent-browser find role button click --name "Confirmer la réception" 2>&1 | head -5
agent-browser wait 1000

echo "==> read spy state"
agent-browser eval "JSON.stringify({ called: window.__confirmCalled, msg: window.__confirmMsg })"

echo "==> screenshot after confirm accepted"
agent-browser screenshot "$SHOT_DIR/08-after-confirm.png"
agent-browser snapshot > "$SHOT_DIR/09-after-confirm-full.txt" 2>&1

# --- 9. Click Terminées to verify both orders ---------------------------
echo "==> click Terminées to verify both orders now delivered"
agent-browser find role button click --name "Terminées" 2>&1 | head -5
agent-browser wait 500
agent-browser screenshot "$SHOT_DIR/10-terminées-both.png"
agent-browser snapshot > "$SHOT_DIR/11-terminées-both-full.txt" 2>&1

# --- 10. Final state checks via eval -----------------------------------
echo "==> reading app state via store"
agent-browser eval "(() => { try { const root = document.querySelector('main'); return root ? root.innerText.slice(0,2000) : 'no main'; } catch(e){ return 'err:'+e; } })();"

echo "==> DONE"
