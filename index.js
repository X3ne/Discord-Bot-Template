/* eslint-disable array-callback-return */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-console */
require('dotenv').config();
const { Client, Intents, Collection } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const fs = require('fs');

const maintenance = 'false';

// Boot
client.on('ready', async () => {
  console.log(`
        ╔═════════════════════════════════╗
        ║-->  Bot Name : ${client.user.username}
        ╟─────────────────────────────────╢
        ║-->  Prefix   : ${process.env.PREFIX}
        ╚═════════════════════════════════╝
        Prêt !
    `);
  function richpresence() {
    client.user.setActivity('🚧 En développement', { type: 'WATCHING' });
    setTimeout(richpresence, 1000);
    if (maintenance === 'false') client.user.setActivity(`Beta ${process.env.PREFIX}prefix}help`, { type: 'WATCHING' });
    if (maintenance === 'true') client.user.setActivity('⚠️ Bot en maintenance !', { type: 'WATCHING' });
  }
  richpresence();
});

// Commands loader
client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync('./commands/');

const folders = ['Utility'];
const foldernum = folders.length;

Array.from({ length: foldernum }, (x, num) => {
  fs.readdir(`./commands/${folders[num]}`, (err, file) => {
    if (err) console.log(err);

    const jsfile = file.filter((f) => f.split('.').pop() === 'js');
    if (jsfile.length <= 0) {
      console.log('❌  ->Impossible de trouver la commande !');
      return;
    }

    jsfile.forEach((f) => {
      const props = require(`./commands/${folders[num]}/${f}`);
      console.log(`✔️  -> ${f} loaded !`);
      client.commands.set(props.help.name, props);
      props.help.aliases.forEach((alias) => {
        client.aliases.set(alias, props.help.name);
      });
    });
  });
});

client.on('messageCreate', async (msg) => {
  const message = msg.content.toLowerCase();
  if (message.endsWith('quoi')) {
    msg.channel.send('feur');
  }
});

client.on('messageCreate', async (msg) => {
  // Dm
  if (msg.author.bot) return;
  if (msg.channel.type === 'dm') return;

  // prefix
  const { prefix } = process.env;

  // Commands
  const args = msg.content.slice(prefix.length).trim().split(' ');
  const cmd = args.shift().toLowerCase();
  let command;

  if (!msg.content.startsWith(prefix)) return;
  if (client.commands.has(cmd)) {
    command = client.commands.get(cmd);
  } else {
    command = client.commands.get(client.aliases.get(cmd));
  }

  if (command) command.run(client, msg, args, prefix);
});

// Token
client.login(process.env.TOKEN);
client.on('error', console.error);
