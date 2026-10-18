Run `bash capture-evidence.sh` from the `final_project` directory while the server is running. The script writes actual cURL commands and outputs to files named for the rubric.

The `githubrepo` item is intentionally not fabricated: create a fork in your own GitHub account first, then save the output of `curl -sS "https://api.github.com/repos/YOUR_GITHUB_USERNAME/expressBookReviews"` here as `githubrepo` and verify it contains `"fork": true` and the IBM starter as its parent.
