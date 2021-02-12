# CMSC435 Discord Bot

![Node CI](https://github.com/DanRowe/cmsc435-discord-bot/workflows/Node%20CI/badge.svg?branch=main)

Notifies you when Dr. Purtilo makes a new [blog post](https://seam.cs.umd.edu/purtilo/435/blog.html) by sending a message to a discord text channel.

## Setup

First, make sure you have Node installed. You should be using node `v10` or higher. However, because this project uses TypeScript, you can change the target ECMAScript version to suit your needs. Secondly, we're also using the [yarn](https://yarnpkg.com) package manager instead of `npm`. You'll need `v1.2.x` installed.

Once that's sorted out, get the code and build it.

```sh
git clone https://github.com/DanRowe/cmsc435-discord-bot.git
cd cmsc435-discord-bot
yarn --frozen-lockfile
yarn build
```

You can then run the program using `yarn start`. If you're deploying this on your VM, you're gonna want to set up a cron job. This will make the program check for updates periodically. To edit your cronjobs, run `crontab -e`. For root-level cronjobs, prefix this with `sudo`, but a user-level one will work fine for our purposes.

Make your cronjob file look something like this:

```cronjob
SHELL=/bin/bash
# Optional. Cronjob status updates are sent to this email
MAILTO=root@example.com
# Make sure node and yarn are available on the path. Adjust as necessary
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

*/15 * * * * (cd /path/to/your/cmsc435-discord-bot; 
```

This makes the bot run every 15 minutes. For more info on how to configure this, see this [helpful article](https://opensource.com/article/17/11/how-use-cron-linux) or use `man crontab`.
