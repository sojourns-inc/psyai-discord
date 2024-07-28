# Credit

This code is a fork of [DoseBot](https://github.com/dosebotredux/DosebotRedux). I take credit for essentially nothing except `ask.ts`, `info.ts`, `/queries` and some stuff in the `/include` directory. The rest is their work. We're on the shoulders of giants. <3

Some of the text below is copied verbatim from DoseBot's README.md.

## PsyAI

**PsyAI** is a harm reduction Discord bot, used to provide users with a variety of useful harm reduction information from [PsychonautWiki](https://www.psychonautwiki.org) and effect information from [Effect Index](https://www.effectindex.com).

**Harm reduction** is the set of practical strategies and ideas at reducing negative consequences associated with substance use. Harm reduction is also a movement for social justice built on a belief in, and respect for, the rights of people who use substances - [Harm Reduction Coalition](http://harmreduction.org/about-us/principles-of-harm-reduction/).

The **drug abuse epidemic** that has been sweeping the the United States has cost 63,600 lives in 2016 alone [CDC](https://www.cdc.gov/nchs/products/databriefs/db294.htm), with a median age of 20. Every day PsyAI provides scientifically backed best practices to tens of thousands of users that helps save lives.

## Message content restriction

Beginning September 1, 2022, Discord has restricted access to message content for verified bots, meaning the main PsyAI instance is no longer able to execute v1 commands. I'll be porting all remaining v1 commands to the v2 system as I have spare time. Pull requests are welcome.

## Features

- Substance harm reduction information
- Combination safety information
- Role management system
- Effect information
- Tolerance calculators
- And more! Say `--help` for the full command list.

## Contributors

This project is maintained by members of the [sojourns inc. organization](https://github.com/sojourns-inc) on Github.

## Usage

1.  Clone repo
2.  `$ npm install` to download dependencies
3.  `$ npx tsc` to compile
4.  `DISCORD_API_TOKEN=xxx npx node ./dist/bot.js` to start bot

## Docker usage

1.  Clone repo
2.  Create a `.env` file like so:
```env
DISCORD_TOKEN="your token goes here"
```
3.  `./start.sh` to build the container and start bot

### In memoriam

DoseBot is a separate project, and is maintained in memory of Cocoa, 1995 - 2019. Cocoa was the creator of the original DoseBot. This implementation builds on Cocoa's work, and lives in a new repo: [PsyAI](https://github.com/sojourns-inc/PsyAI).
