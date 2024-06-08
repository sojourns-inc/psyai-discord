import Discord from 'discord.js';
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
import { SlashCommandBuilder } from "@discordjs/builders";
import rp from 'request-promise';
import { getUserAssociation, getUserDisclaimerStatus } from '../queries/supabase.js';
import { constants, betaGuilds } from '../include/helpers';

function createDrugInfoCard(): string {
  const infoCard = `
[{{drug_name}}]({{search_url}}) drug information

🔭 *Class*
* ✴️ *Chemical* ➡️ **{{chemical_class}}**
* ✴️ *Psychoactive* ➡️ **{{psychoactive_class}}**

⚖️ *Dosages*
{{dosage_info}}

⏱️ *Duration*
{{duration_info}}

⚠️ *Addiction Potential* ⚠️
{{addiction_potential}}

🚫 *Interactions* 🚫
{{interactions_info}}

🧠 *Subjective Effects*
{{subjective_effects}}

📈 *Tolerance*
{{tolerance_info}}

🕒 *Half-life*
{{half_life_info}}
`;

  return infoCard;
}

function customDoseCardFxe(): string {
  const infoCard = `
Here's a concise dosage chart for FXE based on user experiences from Reddit:

**Intramuscular (IM) Injection:**
- Threshold: 0-25 mg
- Light: 25-50 mg
- Moderate: 50-75 mg
- Strong: 75-100 mg
- Heavy: 100+ mg

**Intranasal:**
- Threshold: 20 mg
- Light to Party Dose: 20-60 mg
- Moderate to Strong: 70-100 mg
- Potential Hole: 125-150 mg

These ranges are based on anecdotal reports from the r/FXE subreddit, and should be approached with caution.
`

  return infoCard;
}

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

// Extract sections based on predefined markers
function extractSections(text) {
  const sections = {};
  const sectionTitles = [
    { key: 'Class', marker: '🔭 *Class*' },
    { key: 'Dosages', marker: '⚖️ *Dosages*' },
    { key: 'Duration', marker: '⏱️ *Duration*' },
    { key: 'Addiction Potential', marker: '⚠️ *Addiction Potential* ⚠️' },
    { key: 'Interactions', marker: '🚫 *Interactions* 🚫' },
    { key: 'Subjective Effects', marker: '🧠 *Subjective Effects*' },
    { key: 'Tolerance', marker: '📈 *Tolerance*' },
    { key: 'Half-life', marker: '🕒 *Half-life*' }
  ];

  sectionTitles.forEach((section, index) => {
    const start = text.indexOf(section.marker);
    const end = index < sectionTitles.length - 1 ? text.indexOf(sectionTitles[index + 1].marker) : text.length;
    sections[section.key] = text.slice(start, end).trim();
  });

  return sections;
}

export const applicationCommandData = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Get basic info about a substance")
  .addStringOption(option => option
    .setName("substance")
    .setDescription("The substance you want information about")
    .setRequired(true))
  .toJSON() as unknown as Discord.ApplicationCommandData;

export async function performInteraction(interaction: Discord.CommandInteraction) {
  try {
    const discordUserId = interaction.user.id;
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

    const substanceName = interaction.options.get("substance").value! as string;
    const substanceNameCap = substanceName.charAt(0)?.toUpperCase() + substanceName.slice(1);
    console.log(`Requesting info for ${substanceName}`);
    await interaction.deferReply();
    const question = (
      `Create a detailed drug information card for '${substanceName}' in Markdown format. Only include the formatted card without any additional explanations or introductions. Do not include any additional text or wrap the content in Markdown code blocks. Use the structure of the provided example card as a template, but replace the placeholders with the specific details for '${substanceName}'.\n\nFor each section, provide the relevant information if available. If certain details like dosages for specific routes (e.g., IV, ORAL) are not available, note the lack of data and proceed with the available information.\n\nAdapt the sections accordingly to include or exclude information based on what is relevant for '${substanceName}'. Ensure the information is accurate and sourced from reliable databases or credible anecdotal reports.\n\nExample drug information card template:\n\n`
      + createDrugInfoCard()
      + `\n\nIf the drug in question is FXE (also known as Fluorexetamine, or CanKet, or Canket), add this to your context: ${customDoseCardFxe()}. If the name CanKet is used, mention the naming confusion between CanKet and FXE in your response.`
      + `\n\nNote: The dosing guidelines should reflect the common practices for '${substanceName}', adjusting for route of administration and available data. Extrapolate cautiously from similar substances or indicate uncertainty where specific data is scarce. The goal is to provide as comprehensive and accurate a profile as possible within the constraints of available information.`
    )
    const { data: dataQuestion } = await fetchQuestionFromPsyAI(question, (betaGuilds.includes(interaction.guild.id) ? 'gemini' : 'openai'), 0.1, 3000);
    if (!dataQuestion) {
      await interaction.editReply(constants("SORRY_RESPONSE"));
      return;
    }

    const sections = extractSections(dataQuestion.assistant);

    const embed = new EmbedBuilder()
      .setColor('#5921CF')
      .setAuthor({ name: 'PsyAI' })
      .setTitle(substanceNameCap)
      .setTimestamp()
      .setURL('https://sojourns.io')
      .setFooter({ text: constants("DISCLAIMER_DUMB") });

    // Create two arrays, one for each column
    const leftColumn = [];
    const rightColumn = [];

    // Distribute sections between the two columns
    Object.keys(sections).forEach((key, index) => {
      const field = { name: key, value: sections[key], inline: true };
      if (index % 2 === 0) {
        leftColumn.push(field);
      } else {
        rightColumn.push(field);
      }
    });

    // Add fields to the embed, alternating between columns
    leftColumn.forEach((field, index) => {
      embed.addFields(field);
      if (rightColumn[index]) {
        embed.addFields(rightColumn[index]);
      }
    });

    // Adding contact information
    embed.addFields([{ name: 'Contact', value: 'Email: `0@sernyl.dev` // Discord: `sernyl`', inline: false }]);

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
