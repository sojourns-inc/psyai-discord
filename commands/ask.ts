// @ts-nocheck
import Discord from 'discord.js';
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
import { SlashCommandBuilder } from "@discordjs/builders";
import rp from 'request-promise';
import { getUserAssociation, getUserDisclaimerStatus } from '../queries/supabase';
import { splitTextIntoParagraphs, constants, betaGuilds, splitTextIntoSections } from '../include/helpers';

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

async function fetchQuestionFromPsyAI(question: string, model: string = 'openai', temperature: number = 0.2, tokens: number = 3000): Promise<Response | null> {
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

// Function to split long sections into smaller chunks
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
            // Handle the error for the specific field
            // You can choose to skip the field or take any other appropriate action
          }
        }
      }
    }

    // Add the contact information field
    try {
      embed.addFields([{ name: 'Contact', value: 'Email: `0@sernyl.dev` // Discord: `sernyl`' }]);
    } catch (error) {
      console.error(`Error adding contact information field: ${error}`);
      // Handle the error for the contact information field
    }
  } catch (error) {
    console.error(`Error creating embed fields: ${error}`);
    throw error;
  }
}
export async function performInteraction(interaction: Discord.CommandInteraction) {
  try {

    const discordUserId = interaction.user.id;
    const special = discordUserId === process.env.SPECIAL_DISCORD_ID;
    const user_association = await getUserAssociation(discordUserId);
    const user_disclaimer = await getUserDisclaimerStatus(discordUserId);

    if (!user_disclaimer) {
      await interaction.reply(constants("SORRY_NOTSORRY"));;
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
        content: 'Please read and agree to the disclaimer before using the bot:\n\nhttps://publish.obsidian.md/psyai/Projects/PsyAI/Legal/Disclaimer',
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

    /* Disabling subscriptions for now
    if (interaction.guild != null && (interaction.guild.id == "1032772277223297085" || interaction.guild.id == "1037189729294225518" || interaction.guild.id == "1163815737790578759")) {
      console.log("Guild ID: " + interaction.guild.id);
      console.log("Guild Name: " + interaction.guild.name);
      console.log("Guild Owner ID: " + interaction.user.id);
      console.log("Guild Owner ID: " + interaction.user.tag);
      console.log("Guild Owner ID: " + interaction.user.username);
      // The Culture Cave or Josie's Guild
    } else if ((!user_association.subscription_status && user_association.trial_prompts > 0)) {
      // Decrease the trial_prompts by 1
      const { error } = await supabase
        .from('user_association')
        .update({ trial_prompts: user_association.trial_prompts - 1 })
        .eq('discord_id', discordUserId);

      if (error) {
        console.error(error);
        // Handle the error (consider sending a message to the user)
      }
    } else if (!user_association.subscription_status && user_association.trial_prompts <= 0) {
      // Send the subscription message because the user is out of trial_prompts
      const paymentUrl = await startSubscription(discordUserId);
      await interaction.user.send(`Hi there, friend!\n\nYour trial has ended.\n\nSupport the devs today, for only $12.40 per YEAR!  ૮₍ ˶ᵔ ᵕᵔ˶₎ა  >[Subscribe Now](${paymentUrl})<`);
      await interaction.editReply("Please check your direct messages!");
      return;
    }
    */
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

    const truncatedQuery = query.length > 300 ? query.substring(0, 297) + "..." : query;

    const embed = new EmbedBuilder()
      .setColor('#5921CF')
      .setAuthor({ name: 'PsyAI' })
      .setTitle(truncatedQuery)
      .setTimestamp()
      .setURL('https://sojourns.io')
      .setFooter({ text: constants("DISCLAIMER_DUMB") });

    // Splitting the assistant text into sections
    const assistantTextSections = splitTextIntoSections(dataQuestion.assistant);

    // Create and add fields to the embed
    await createEmbedFields(embed, assistantTextSections);

    // Edit the reply with the embed
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
