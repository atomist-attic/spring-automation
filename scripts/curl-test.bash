#!/bin/bash
# test the spring generator via HTTP POST
# the client must be running

declare Pkg=curl-test
declare Version=0.1.0

function msg () {
    echo "$Pkg: $*"
}

function err () {
    msg "$*" 1>&2
}

function main () {
    if [[ ! $GITHUB_TOKEN ]]; then
        err "the GITHUB_TOKEN environment variable is not set"
        return 10
    fi
    local iteration=$1
    if [[ ! $iteration ]]; then
        iteration=0
    else
        shift
    fi
    local owner=$1
    if [[ ! $owner ]]; then
        owner=atomisthqa
    else
        shift
    fi
    local team=$1
    if [[ ! $team ]]; then
        team=T1L0VDKJP
    else
        shift
    fi

    local post_data
    printf -v post_data '{
  "name": "springBootGenerator",
  "corrid": "local-test-from-hoff-%s",
  "parameters": [{
    "name": "target.repo",
    "value": "aa-spring-test-%s"
  }, {
    "name": "groupId",
    "value": "com.atomist"
  }, {
    "name": "artifactId",
    "value": "demo-test"
  }, {
    "name": "version",
    "value": "0.1.0-SNAPSHOT"
  }, {
    "name": "rootPackage",
    "value": "com.atomist"
  }, {
    "name": "target.description",
    "value": "this is only a test"
  }],
  "mapped_parameters": [{
    "name": "target.owner",
    "value": "%s"
  }, {
    "name": "slackTeam",
    "value": "%s"
  }],
  "secrets": [{
    "name": "github://user_token?scopes=repo,user",
    "value": "%s"
  }]
}' "$iteration" "$iteration" "$owner" "$team" "$GITHUB_TOKEN"
    if ! curl -v -X POST -H "Authorization: bearer $GITHUB_TOKEN" -H 'Content-Type: application/json' \
         -d "$post_data" http://localhost:2866/command/spring-boot-generator
    then
        err "curl failed"
        return 1
    fi
}

main "$@" || exit 1
exit 0
