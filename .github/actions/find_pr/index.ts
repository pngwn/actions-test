import { getInput, setOutput, setFailed, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";

type Client = ReturnType<typeof getOctokit>;

interface PullRequestResponse {
	repository: {
		pullRequests: {
			edges: {
				node: {
					number: number;
					headRepository: {
						nameWithOwner: string;
					};
					headRefName: string;
				};
			}[];
		};
	};
}

type PullRequests = PullRequestResponse["repository"]["pullRequests"]["edges"];

async function run() {
	const octokit = getOctokit(getInput("github_token"));
	const { repo, owner } = context.repo;

	console.log(JSON.stringify(context, null, 2));

	if (context.payload.workflow_run.event === "pull_request") {
		const open_pull_requests = await get_prs(octokit, repo, owner);
		const [branch_name, pr_number] =
			get_pr_number_from_refs(open_pull_requests);
		console.log("branch_name", branch_name);
		console.log("pr_number", pr_number);
	} else if (context.payload.workflow_run.event === "push") {
	} else if (context.payload.workflow_run.event === "issue_comment") {
	} else {
		setFailed(
			"This action can only be run on pull_request, push, or issue_comment events."
		);
	}

	// if (!pr_number) {
	// 	setFailed("Could not determine PR number.");
	// }

	// setOutput("pr_number", pr_number);
	// setOutput("branch_name", branch_name);
	// } catch (e: any) {
	// 	warning("Could not determine PR number branch and repository.");
	// 	setFailed(e.message);
	// }
}

run();

async function get_prs(octokit: Client, repo: string, owner: string) {
	let pull_requests: PullRequests = [];
	try {
		const {
			repository: {
				pullRequests: { edges: open_pull_requests },
			},
		}: PullRequestResponse = await octokit.graphql(`
{	
	repository(name: "${repo}", owner: "${owner}") {
		pullRequests(first: 50, states: OPEN) {
			edges {
				node {
					number
					headRepository {
						nameWithOwner
					}
					headRefName
				}
			}
		}
	}
}`);

		pull_requests = open_pull_requests;
	} catch (e: any) {
		setFailed(e.message);
	}

	return pull_requests;
}

function get_pr_number_from_refs(pull_requests: PullRequests) {
	const source_repo: string | null =
		context.payload.workflow_run?.head_repository?.full_name;
	const source_branch: string | null =
		context.payload.workflow_run?.head_branch;

	console.log("source_repo", source_repo);
	console.log("source_branch", source_branch);
	console.log("open_pull_requests", JSON.stringify(pull_requests, null, 2));

	if (!source_repo || !source_branch) {
		setFailed("Could not determine source repository and branch.");
	}

	const [, , pr_number] = (
		pull_requests.map((pr) => [
			pr.node.headRepository.nameWithOwner,
			pr.node.headRefName,
			pr.node.number,
		]) as [string, string, number][]
	).find(
		([repo, branch]) => source_repo === repo && source_branch === branch
	) || [null, null, null];

	return [source_branch, pr_number];
}
