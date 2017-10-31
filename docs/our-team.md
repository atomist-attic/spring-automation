# Try it out in our sample team

THIS IS FICTION

Try Atomist out in our team! This page has some suggestions for automations to implement, to see what it's like.

### Play in a sample team

[ ] Get invited to our sample GitHub organization
[ ] Get invited to our Slack team

First, you should have a repository of your own to play with. We have our own automation node running that will do this for you:
in the #general channel, type `@atomist create project` and select a sample project to start with.
Atomist will ask you for a name (hereafter referred to as your-sample-project), then
create a repository populated with a starter project, and invite you to a Slack channel that gets
notifications about activity in that project.

To get your own automation node, you can clone this project and modify it -- or you can have Atomist do that for you!
In the channel you were just invited to, type `@atomist new automation node` and it'll make a repo for you in our sample organization, after it asks you a few pertinent questions.

#### I want to do it myself

No problem. Clone this repository, and then change the following things:

    - in `package.json`, change the "name" to something that's likely to be unique to you, your automation-node-name.
    - in `... this sample push handler ...` change the repoOfInterest constant to your repository.
    - if you're running in your own Slack team: in `atomist.config.ts`, configure the Slack team to your Team ID. You can find this in slack by asking atomist: `@atomist pwd` (or in a DM to atomist, `pwd`)

### Run the automation node

To authenticate with Atomist, you'll need node(LINK), npm(LINK), 
and a GitHub token to prove you're a member of your organization.

    - Make a GitHub token (LINK) with read:org access. 
    - place that GitHub token in an environment variable GITHUB_TOKEN (`export GITHUB_TOKEN=your-token-here`)
    - `npm install`
    - `npm run fast` (we were going to call it "npm run start" but that was boring)

When the node starts up, it connects to the Atomist API. It registers subscriptions to events and Slack commands.
See these subscriptions by connecting to the admin interface at `http://localhost:2688/what-is-the-url`

Now activate some automations! This sample responds to `@atomist hello, automation-node-name` in Slack, so type that 
in your Slack channel. Your admin interface will show that the command automation fired. Tweak the response in 
`hello world file.ts` and restart your node, if you like. (If you get tired of restarting, see _automatic node reloading_ (link))

Now see your automation respond to an event! Push a change to your-sample-project.
(You could update the README right on github, that counts.) Atomist will contact your node, which subscribes to push events
in `the file of the push handler.ts`. 

### Do more stuff

From here, you can play. You can do more in Slack (link to other section), 
you can look at code and modify it (link to another section), and you can get more information about the events you're 
responding to. Let's start with that last one.

#### Get more information

When that push happens, what else can you know about it? you could ask, what issues does it resolve? or,
who pushed those commits? or, was the build successful?
