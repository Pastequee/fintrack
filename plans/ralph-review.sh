set -e

claude --permission-mode acceptEdits "@plans/prd.json @progress.txt \
1. All the features in the PRD have been completed, verify each task that do not have the property 'verified' to true. \
This should be the one YOU decide has the highest priority - not necessarily the first one on the list. \
2. Check that the types check via 'bun typecheck' and that the linter is fine with 'bun lint' \
3. Update the PRD with the work that was done. \
4. Append your progress to the progress.txt file. \
Use this to leave a note for the next person working in the codebase. \
5. Make sure that the feature is complete and well implemented, if not, fix it. \
5. Make a git commit of that feature. \
ONLY WORK ON A SINGLE REVIEW.
"
