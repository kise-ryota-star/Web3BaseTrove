# Variables
DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL := http://127.0.0.1:8545
CURL := curl -s -H "Content-Type: application/json" -X POST --data

# Check if RPC URL is reachable
check-rpc:
	@RESPONSE=$$($(CURL) '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}' $(RPC_URL)); \
	if echo "$$RESPONSE" | grep -q '"jsonrpc"'; then \
		echo "RPC URL reachable."; \
	else \
		echo "Error: Unable to reach RPC URL $(RPC_URL). Please ensure the Anvil node is running."; \
		exit 1; \
	fi

# Targets
increase-12hr: check-rpc
	$(CURL) '{"id":1337,"jsonrpc":"2.0","method":"evm_increaseTime","params":[43200]}' $(RPC_URL)
	$(CURL) '{"id":1338,"jsonrpc":"2.0","method":"evm_mine","params":[]}' $(RPC_URL)
	@echo "Increased blockchain time by 12 hours and mined a block."

increase-24hr: check-rpc
	$(CURL) '{"id":1339,"jsonrpc":"2.0","method":"evm_increaseTime","params":[86400]}' $(RPC_URL)
	$(CURL) '{"id":1340,"jsonrpc":"2.0","method":"evm_mine","params":[]}' $(RPC_URL)
	@echo "Increased blockchain time by 24 hours and mined a block."

increase-6d: check-rpc
	$(CURL) '{"id":1341,"jsonrpc":"2.0","method":"evm_increaseTime","params":[518400]}' $(RPC_URL)
	$(CURL) '{"id":1342,"jsonrpc":"2.0","method":"evm_mine","params":[]}' $(RPC_URL)
	@echo "Increased blockchain time by 6 days and mined a block."

save-state: check-rpc
	$(CURL) '{"id":1343, "jsonrpc":"2.0","method":"anvil_dumpState","params":[]}' $(RPC_URL) | jq -r '.result' > blockchain_state.txt
	@echo "Blockchain state saved to blockchain_state.txt."
