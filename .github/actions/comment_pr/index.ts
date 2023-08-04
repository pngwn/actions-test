import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
	const token = core.getInput("token");
	const octokit = github.getOctokit(token);	
	const context = github.context;
	const repo = context.repo;
	const pr_number = context.payload.pull_request?.number;

	if (!pr_number) {
		core.setFailed("No PR number found.");
		return;
	}

	const pr = await octokit.rest.pulls.get({
		...repo,
		pull_number: pr_number,
	});

	// get pr comments
	const comments = await octokit.rest.issues.listComments({
		...repo,
		issue_number: pr_number,

	});


	console.log(comments)


	
}

run()
