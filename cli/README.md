# Erda-ui cli
Command line interface for rapid Erda UI development.

## Install
> npm install @erda-ui/cli

## Usage

#### setup module config
> erda-ui setup <module> <port>

#### launch modules
> erda-ui launch

#### build erda-ui
> erda-ui build
>
> Options:
>   -i, —image        release based on docker image
>   -l, —local          enable local build mode, default be false, if image is given, it would forcibly be true

#### copy build directory to public

> erda-ui copy <module>

#### build and make docker image
> erda-ui release
>
> Options:
>   -i, —image        release based on docker image

#### do translate job

> erda-ui i18n [workDir]

#### check file license header
> erda-ui check-license

#### add license header to files
> erda-ui add-license

## How to debug ts script

create a `launch.json` config in vscode. Add content below.
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "erda-ui-cli-debugger",
            "type": "node",
            "request": "launch",
            "runtimeExecutable": "node",
            "runtimeArgs": ["--nolazy", "-r", "ts-node/register/transpile-only"],
            "args": ["${workspaceRoot}/cli/lib/util/log.ts"], // this should be your target file
            "cwd": "${workspaceRoot}/cli",
            "internalConsoleOptions": "openOnSessionStart",
            "skipFiles": ["<node_internals>/**", "node_modules/**"]
        }
    ]
}
```