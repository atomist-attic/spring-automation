# Atomist

Atomist is a toolset for development automation. Get more background on Atomist [here](atomist.md)
It lets you automate development tasks to a degree that has not been practical before.

The toolset includes GraphQL access (query and subscribe) to events important to software development, like commits and builds and deploys; sweet Slack integration; and tools to modify code and make pull requests.

This repository gives you a starting point, so you can try out automations of your own within minutes.

You can react to events like code pushes, build results, deploys, and Slack messages. Include
information about related commits, people, and issues. These reactions can do anything
you can program, with special support for editing code, making pull requests, and sending or updating Slack messages.
Plus they have access to a GraphQL view of the relationships between commits, builds, deploys, and issues.

To create your own development automations, run an Atomist node: clone this repository and modify the automations
to your liking. This automation node connects to the Atomist API. Let Atomist configure your Github, CI, and 
deployment webhooks to send in events that build up the graph of your software's evolution; your node subscribes to events
and is triggered to run your automations. 
Bring the Atomist bot into your Slack team, and your automations can also respond to commands
and interact with people.

Proceed with [README.md]