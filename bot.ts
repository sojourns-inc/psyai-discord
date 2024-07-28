// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import Discord, { Client, GatewayIntentBits, Partials } from 'discord.js';

const DiscordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

import * as CommandSystem from "./command-system";
import { updateUserDisclaimerStatus } from './queries/supabase';

DiscordClient.on('ready', async () => {
  console.log('PsyAI is online - beep boop');

  if (!DiscordClient.user) {
    console.log("No discord user. What?");
    return;
  }

  if (DiscordClient.application) {
    console.log("Setting application commands.");
    DiscordClient.application.commands.set(CommandSystem.applicationCommandData);
  } else {
    console.error("No discord client application found. Unable to set commands.");
  }

  // Update game message on launch
  const presence = DiscordClient.user.setActivity(`my part in reducing harm!`, { type: 'PLAYING' });
  console.log(`Activity set: ${JSON.stringify(presence.activities)}`);

  // Print guild list
  const guilds = DiscordClient.guilds.cache;
  const userCount = guilds
    .map((guild: Discord.Guild) => guild.memberCount)
    .reduce((x, y) => x + y, 0);

  console.log(`Currently serving ${userCount} users on ${guilds.size} guilds`);
  for (const guildComponents of guilds.sort((x, y) => y.memberCount - x.memberCount)) {
    const guildId = guildComponents[0];
    const guild = guildComponents[1];

    console.log(guildId, `since ${guild.joinedAt}`, `${guild.memberCount} members`, guild.name);
  }
});

DiscordClient.on('guildCreate', guild => {
  console.log(`New server joined - Name: ${guild.id} ${guild.name} Members: ${guild.memberCount}`);
});

DiscordClient.on('messageCreate', async (message: Discord.Message) => {
  // Ignore messages from bots to prevent potential loops
  if (message.author.bot) return;

  const clientUser = DiscordClient.user;
  if (!clientUser) {
    console.warn('Received message before client user was initialized');
    return;
  }

  // Check if the message starts with a mention of PsyAI
  const botMention = `<@${clientUser.id}>`;
  if (message.content.startsWith(botMention)) {
    // Extract the query by removing the mention and any leading/trailing whitespace
    const query = message.content.slice(botMention.length).trim();

    if (query) {
      try {
        // Create a fake interaction object
        const fakeInteraction = {
          commandName: 'ask',
          options: {
            getString: (name: string) => name === 'query' ? query : null,
          },
          user: message.author,
          guild: message.guild,
          channel: message.channel,
          reply: async (content: string | { content: string, ephemeral: boolean }) => {
            if (typeof content === 'string') {
              await message.reply(content);
            } else {
              await message.reply(content.content);
            }
          },
          deferReply: async () => message.channel.sendTyping(),
          editReply: message.reply.bind(message),
          followUp: message.reply.bind(message),
        } as unknown as Discord.CommandInteraction;

        // Call existing /ask command handler
        CommandSystem.executeCommandInteraction(fakeInteraction);
      } catch (error) {
        console.error("Error handling mention query", error);
        await message.reply("Sorry, I encountered an error while processing your request.");
      }
    }
  }
});
DiscordClient.on('interactionCreate', async (interaction: Discord.Interaction) => {
  if (interaction.isButton() && interaction.customId === 'agree_disclaimer') {
    await updateUserDisclaimerStatus(interaction.user.id, true);
    await interaction.update({
      content: 'Thank you for agreeing to the disclaimer. You can now use the bot.',
      components: []
    });
  }

  if (!interaction.isCommand()) {
    return;
  }

  try {
    CommandSystem.executeCommandInteraction(interaction);
  } catch (error) {
    console.error("caught error executing interaction", interaction, error);
  }
});

DiscordClient.on('debug', (message: string) => {
  // console.log("!!! DEBUG !!!", message);
});

DiscordClient.on('warn', (message: string) => {
  console.log("!!! WARN !!!", message);
});

DiscordClient.login(process.env.DISCORD_API_TOKEN);
