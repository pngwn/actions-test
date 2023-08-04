import * as core from "@actions/core";
import * as github from "@actions/github";


type Octokit = ReturnType<typeof github.getOctokit>

const COMMENT_ID = 'GRADIO_GITHUB_ACTION_COMMENT_ID'

async function run() {
	const token = core.getInput("token");
	const octokit = github.getOctokit(token);	
	const context = github.context;
	const repo = context.repo;
	const pr_number = context.payload.pull_request?.number;
	const id = core.getInput("id");
	const message = core.getInput("message");
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
		await createComment(octokit, repo, pr_number, `<!-- ${COMMENT_ID} -->\n${make_message(message, id)}}`)
	} else {
		const comment = comments.data.find(comment => comment.body?.includes(COMMENT_ID))
		if (comment) {
			if (comment.body?.includes(id)) {
				const body = comment.body.replace(new RegExp(`<!-- BEGIN_MESSAGE: ${id} -->.*<!-- END_MESSAGE: ${id} -->`, 's'), make_message(message, id))
				await update_pr_comment(octokit, repo, pr_number, comment.id, body)
			} else {
				await update_pr_comment(octokit, repo, pr_number, comment.id, `${comment.body}\n${make_message(message, id)}`)
			}
			console.log('found comment', comment)
		} else {
			await createComment(octokit, repo, pr_number, `<!-- ${COMMENT_ID} -->\n${make_message(message, id)}}`)
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

function make_message(message: string, id: string) {
	return `<!-- BEGIN_MESSAGE: ${id} -->\n${message}\n<!-- END_MESSAGE: ${id} -->`
}

async function update_pr_comment(
	client: Octokit ,
	repo: {
    owner: string;
    repo: string;
	}, 
	issue_number: number,
	comment_id: number,
	body: string
	
	) {
		await client.rest.issues.updateComment({
			...repo,
			issue_number,
			body,
			comment_id
		})
}
