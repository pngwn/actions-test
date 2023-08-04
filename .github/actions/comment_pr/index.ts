import * as core from "@actions/core";
import * as github from "@actions/github";
import type { Octokit } from "@octokit/core";


const COMMENT_ID = 'GRADIO_GITHUB_ACTION_COMMENT_ID'

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

	// const pr = await octokit.rest.pulls.get({
	// 	...repo,
	// 	pull_number: pr_number,
	// });

	// get pr comments
	const comments = await octokit.rest.issues.listComments({
		...repo,
		issue_number: pr_number,

	});

	if (comments.data.length === 0) {
		createComment(octokit, repo, pr_number, `<!-- ${COMMENT_ID} -->\nHello World`)
	} else {
		const comment = comments.data.find(comment => comment.body?.includes(COMMENT_ID))
		if (comment) {
			console.log('found comment', comment)
		} else {
			createComment(octokit, repo, pr_number, `<!-- ${COMMENT_ID} -->\nHello World`)
		}
	}


	console.log(comments)


	
}

run()

async function createComment(
	client: Octokit ,
	repo: {
    owner: string;
    repo: string;
}, 
	
	pr_number: number, 
	body: string
	) {

	

	if (!pr_number) {
		core.setFailed("No PR number found.");
		return;
	}

	await client.rest.issues.createComment({
		...repo,
		issue_number: pr_number,
		body
	})
}