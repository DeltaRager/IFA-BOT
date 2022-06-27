## SCPF Discord Bot
This bot provides useful and fun commands for the SCPF's Discords.

### Environemnt Variables
- ``PREFIX``: The prefix the bot will respond to following the command name. E.g. ``~ban``
- ``BOT_TOKEN``: The Discord API token for the bot.
- ``CONNECTION_STRING``: The MongoDB connection string.
- ``ADMIN_ROLE``: Discord role id of users who should have admin.

### How To Run In Development
- Set environment variables.
- Build and run with ``cargo run``

### How to Run In Production
This should automatically be handled by an AWS CI/CD pipeline that follows this architecture:
- Pulls source automatically from GitHub
- Builds source in docker container.
- Builds docker container with compiled source binary and dependencies.
- ~~Deploys to server and runs the binary.~~
-
- Currently you have to manually deploy it on the EC2 server. There is already a script that does this automatically.
- SSH into the server.
- Go to the bot directory: ``cd bot/``
- Run the update script: ``./update-bot.sh`` and the bot will update and restart automatically. Note: You have to wait until code pipeline is done building and pushing the new container to ECR.
- You can use ``docker compose logs`` to see the logs from the bot.

If manually deploying, follow these steps:
- Build release version of binary with ``cargo build --release``
- Copy binary from ``target/release/scpf_bot.exe`` to production environment.
- Set environment variables.
- Run the release binary.
