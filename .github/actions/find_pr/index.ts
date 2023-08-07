import * as core from "@actions/core";
import * as github from "@actions/github";


type Octokit = ReturnType<typeof github.getOctokit>

const COMMENT_ID = 'GRADIO_GITHUB_ACTION_COMMENT_ID'

async function run() {
// 	const token = core.getInput("token");
// 	const octokit = github.getOctokit(token);	
	const context = github.context;
	console.log(JSON.stringify(context, null, 2))

	
}

run()

