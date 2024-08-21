// @ts-nocheck
import Discord from 'discord.js';
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
import { SlashCommandBuilder } from "@discordjs/builders";
import rp from 'request-promise';
import { defaultRateLimiter } from '../include/limiter';
import { getUserAssociation, getUserDisclaimerStatus } from '../queries/supabase';
import { constants, betaGuilds, splitTextIntoSections, bannedUsers } from '../include/helpers';

const askCommandRateLimiter = defaultRateLimiter;

askCommandRateLimiter.setGuildConfig('179641883222474752', { enabled: true, cooldownTime: 5 });
askCommandRateLimiter.setGuildConfig('1009038673284714526', { enabled: true, cooldownTime: 5 });
askCommandRateLimiter.setGuildConfig('867876356304666635', { enabled: true, cooldownTime: 5 });
askCommandRateLimiter.setGuildConfig('1163815737790578759', { enabled: true, cooldownTime: 5 });
askCommandRateLimiter.setGuildConfig('1037189729294225518', { enabled: true, cooldownTime: 5 });

const postAndParseURL = async (url: string, payload: any) => {
  try {
    const options = {
      method: 'POST',
      uri: url,
      body: payload,
      json: true
    };

    const responseData = await rp(options);
    return { data: responseData }
  } catch (error) {
    console.error(`Error in postAndParseURL: ${error}`);
    return null;
  }
}

async function fetchQuestionFromPsyAI(question: string, model = 'openai', temperature = 0.2, tokens = 3000): Promise<Response | null> {
  try {
    const raw: PsyAIOptions = model === 'gemini' ? { question } : { question, temperature, tokens };
    console.log(raw);
    return await postAndParseURL(`${process.env.BASE_URL_BETA}/prompt?model=${model}`, raw);
  } catch (error) {
    console.error(`Error in fetchQuestionFromPsyAI: ${error}`);
    return null;
  }
}


export const applicationCommandData = new SlashCommandBuilder()
  .setName("ask")
  .setDescription("Ask me anything drug-related.")
  .addStringOption(option => option
    .setName("query")
    .setDescription("The question you'd like to ask")
    .setRequired(true))
  .toJSON() as unknown as Discord.ApplicationCommandData;

// split long sections into smaller chunks
function splitSection(section, maxLength) {
  const chunks = [];
  let currentChunk = '';

  section.split('\n').forEach(line => {
    if (currentChunk.length + line.length + 1 <= maxLength) {
      currentChunk += (currentChunk ? '\n' : '') + line;
    } else {
      chunks.push(currentChunk);
      currentChunk = line;
    }
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}
async function createEmbedFields(embed, assistantTextSections) {
  try {
    for (const section of assistantTextSections) {
      const sectionContent = section.trim();

      if (sectionContent !== '') {
        const sectionChunks = splitSection(sectionContent, 1024);

        for (const [chunkIndex, chunk] of sectionChunks.entries()) {
          const fieldTitle = chunkIndex === 0 ? '\u200B' : '\u200B';
          const fieldValue = chunk.length > 1024 ? chunk.slice(0, 1021) + '...' : chunk;

          try {
            embed.addFields([{ name: fieldTitle, value: fieldValue }]);
          } catch (error) {
            console.error(`Error adding field "${fieldTitle}": ${error}`);
          }
        }
      }
    }

    try {
      embed.addFields([{ name: 'Contact', value: 'Email: `0@sernyl.dev` // Discord: `sernyl`' }]);
    } catch (error) {
      console.error(`Error adding contact information field: ${error}`);
    }
  } catch (error) {
    console.error(`Error creating embed fields: ${error}`);
    throw error;
  }
}
export async function performInteraction(interaction: Discord.CommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply("This command can only be used in a guild.");
    return;
  }

  try {
    const discordUserId = interaction.user.id;
    const guildId = interaction.guild.id;
    const special = [process.env.SPECIAL_DISCORD_ID].includes(discordUserId);
    const user_association = await getUserAssociation(discordUserId);
    const user_disclaimer = await getUserDisclaimerStatus(discordUserId);

    if (bannedUsers.includes(discordUserId)) { 
      await interaction.reply("I'm sorry; you are access has been restricted. You probably asked me something naughty, e.g. 'How to make meth?'.\n\nPlease contact my creator (@sernyl) for more information.");
      return;
    }
    const query = interaction.options.getString("query", true);
    if (query.toLowerCase().includes("##thanks")) {
      await interaction.reply(query);
      return;
    }
    

    if (!user_disclaimer) {
      await interaction.reply(constants("SORRY_NOTSORRY"));
      return;
    }

    if (!user_disclaimer.agreed) {
      const agreeButton = new ButtonBuilder()
        .setCustomId('agree_disclaimer')
        .setLabel('I Agree')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder()
        .addComponents(agreeButton);

      await interaction.reply({
        content: 'Please use either `/ask` or the `/info` command to read and agree to the disclaimer, before using the bot:\n\nhttps://publish.obsidian.md/psyai/Projects/PsyAI/Legal/Disclaimer',
        components: [row],
        ephemeral: true
      });
      return;
    }

    if (!!interaction.guild == false) {
      await interaction.deferReply();
      await interaction.editReply("PsyAI currently does not support interaction via direct messages. Please contact @sernyl for more information.");
      return;
    }

    if (!user_association) {
      return;
    }

    if (askCommandRateLimiter.isRateLimited(guildId, discordUserId)) {
      console.log(`User ${discordUserId} is rate limited`);
      const remainingCooldown = askCommandRateLimiter.getRemainingCooldown(guildId, discordUserId);
      await interaction.reply({
        content: `You're using this command too quickly. Please wait ${remainingCooldown} seconds before trying again.`,
        ephemeral: true
      });
      return;
    }
    // Capture messages posted to a given channel and remove all symbols and put everything into lower case
    const query = interaction.options.getString("query", true);
    console.log(`Requesting info for ${query}`);
    await interaction.deferReply();

    const question = `Check your context, and find out: ${query}\n\n(Please respond ${(special ? process.env.SPECIAL_ASK_INST : 'directly')} to the question.)`
    //const question = query + " " + (betaGuilds.includes(interaction.guild.id) ? "(please give an elaborate, detailed and lengthy response)." : "")
    const { data: dataQuestion } = await fetchQuestionFromPsyAI(question, (betaGuilds.includes(interaction.guild.id) ? 'gemini' : 'openai'), 0.3, 3000);
    if (!dataQuestion) {
      await interaction.editReply(constants("SORRY_RESPONSE"));
      return;
    }

    const truncatedQuery = query.length > 500 ? query.substring(0, 497) + "..." : query;

    const embed = new EmbedBuilder()
      .setColor('#5921CF')
      .setAuthor({ name: 'PsyAI' })
      .setTitle(truncatedQuery)
      .setDescription(constants("DISCLAIMER"))
      .setTimestamp()
      .setURL('https://sojourns.io')

    // Splitting the assistant text into sections
    const assistantTextSections = splitTextIntoSections(dataQuestion.assistant);

    // Create and add fields to the embed
    await createEmbedFields(embed, assistantTextSections);

    await interaction.followUp({ embeds: [embed] });
  } catch (error) {
    console.error(`Error in performInteraction: ${error}`);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(constants("SORRY_NOTSORRY"));
    } else {
      await interaction.reply(constants("SORRY_NOTSORRY"));
    }
  }
}
