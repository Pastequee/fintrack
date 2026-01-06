set -e 

if [ -z "$1" ]; then
	echo "Usage: $0 <plan>"
	exit 1
fi

plan="$1"

for ((i=1; i<=$1; i++)); do
	echo "Iteration $i"
	echo "-------------------------------"
	result=$(claude --permission-mode acceptEdits -p "@plans/prd.json @progress.txt \
1. Find the highest-priority feature to work on and work only on that feature. \
This should be the one YOU decide has the highest priority - not necessarily the first one on the list. \
2. Check that the tyepes check via bun typecheck and that the tests pass via bun run test. \
3. Update the PRD with the work that was done. \
4. Append your progress to the progress.txt file. \
Use this to leave a note for the next person working in the codebase. \
5. Make a git commit of that feature. \
6. When working on backend features, WRITE TESTS before that fails, and then implement the feature for it to pass. \
ONLY WORK ON A SINGLE FEATURE. \
If, while implementing the feature, you notice the PRD is complete, output <promise>COMPLETE</promise>. \
")

	echo "$result"

	if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
		echo "PRD is complete"
		exit 0
	fi
done