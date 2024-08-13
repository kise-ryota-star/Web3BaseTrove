#!/bin/bash

# Start Anvil
anvil &

# Capture the PID of the anvil process
ANVIL_PID=$!

# Wait for Anvil to start
sleep 2

# Run Forge script to deploy contracts or set up the environment
echo "Running Forge setup script..."
forge script script/DeployTroveAll.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Load state if it exists
if [ -f "blockchain_state.txt" ]; then
  echo "Restoring state from blockchain_state.txt"

  # Create a temporary JSON file to hold the RPC call data
  TEMP_JSON=$(mktemp)

  # Write the state into the JSON file
  cat <<EOF > $TEMP_JSON
{
  "jsonrpc": "2.0",
  "method": "anvil_loadState",
  "params": ["$(cat blockchain_state.txt)"],
  "id": 1
}
EOF

  # Use curl to send the JSON file
  RESPONSE=$(curl -X POST -H "Content-Type: application/json" --data @$TEMP_JSON http://localhost:8545)

  # Clean up the temporary file
  rm $TEMP_JSON

  # Check if the response contains the expected success message
  if [[ "$RESPONSE" == '{"jsonrpc":"2.0","id":1,"result":true}' ]]; then
    echo "State restored successfully."
  else
    echo "Failed to restore state. Response: $RESPONSE"
  fi
else
  echo "No state file found, starting with a fresh blockchain."
fi

# Keep the script running so that Anvil stays in the foreground
wait $ANVIL_PID

# Keep Anvil running in the foreground
# fg
