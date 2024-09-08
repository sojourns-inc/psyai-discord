import Discord from 'discord.js';
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
import { SlashCommandBuilder } from "@discordjs/builders";
import rp from 'request-promise';
import { getUserDisclaimerStatus } from '../queries/supabase.js';
import { constants, bannedUsers, calcDowntime } from '../include/helpers';


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

async function fetchQuestionFromPsyAI(question: string, model = 'openai', temperature = 0.0, tokens = 3000): Promise<Response | null> {
  try {
    const raw: PsyAIOptions = model === 'gemini' ? { question } : { question, temperature, tokens, drug: true, format: "pyd", model: "openai", "version": "v2" };
    console.log(raw);
    return await postAndParseURL(`${process.env.BASE_URL_BETA}/q`, raw);
  } catch (error) {
    console.error(`Error in fetchQuestionFromPsyAI: ${error}`);
    return null;
  }
};

interface DrugInfo {
  drug_name: string;
  search_url?: string;
  chemical_class?: string;
  psychoactive_class?: string;
  dosages?: {
    routes_of_administration?: Array<{
      route?: string;
      units?: string;
      dose_ranges?: {
        threshold?: string;
        light?: string;
        common?: string;
        strong?: string;
        heavy?: string;
      };
    }>;
  };
  duration?: {
    total_duration?: string;
    onset?: string;
    peak?: string;
    offset?: string;
    after_effects?: string;
  };
  addiction_potential?: string;
  interactions?: {
    dangerous?: string[];
    unsafe?: string[];
    caution?: string[];
  };
  notes?: string;
  subjective_effects?: string[];
  tolerance?: {
    full_tolerance?: string;
    half_tolerance?: string;
    zero_tolerance?: string;
    cross_tolerances?: string[];
  };
  half_life?: string;
  trip_reports?: string;
}

export async function createOptimizedDrugInfoEmbed(interaction: Discord.CommandInteraction, substanceName: string) {
  try {
    const { data: drugInfo } = await fetchQuestionFromPsyAI(substanceName);
    const info: DrugInfo = drugInfo.assistant;

    console.log(info)

    const embed = new EmbedBuilder()
      .setColor('#7721CF')
      .setTitle(`🧪 ${info.drug_name}`)
      .setURL(info.search_url)
      .addFields(
        { name: '🔬 Chemical Class', value: info.chemical_class, inline: true },
        { name: '🧠 Psychoactive Class', value: info.psychoactive_class, inline: true },
        { name: '⚠️ Addiction Potential', value: info.addiction_potential, inline: false },
      );

    // Add dosage information
    !!info.dosages && !!info.dosages.routes_of_administration && info.dosages.routes_of_administration.forEach(route => {
      let doseInfo = ``;
      Object.entries(route.dose_ranges ?? {}).forEach(([range, dose]) => {
        if (dose) {
          doseInfo += `> **${range.charAt(0).toUpperCase() + range.slice(1)}:** ${dose}\n`;
        }
      });
      embed.addFields({ name: `⚖️ Dosage (${route.route})`, value: doseInfo, inline: true });
    });

    // Add duration information
    if (info.duration !== null) {
      let durationInfo = '';
      Object.entries(info.duration ?? {}).forEach(([key, value]) => {
        if (value) {
          durationInfo += `**${key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:** ${value}\n`;
        }
      });
      embed.addFields({ name: '⏱️ Duration', value: durationInfo, inline: false });
    }

    

    // Add interaction information
    Object.entries(info.interactions ?? []).forEach(([key, value]) => {
      if (!!value && value.length > 0) {
        embed.addFields({
          name: `⚠️ ${key.charAt(0).toUpperCase() + key.slice(1)} Interactions`,
          value: value.join(', '),
          inline: true
        });
      }
    });

    // Add subjective effects
    if (!!info.subjective_effects && info.subjective_effects.length > 0) {
      embed.addFields({ name: '🌈 Subjective Effects', value: info.subjective_effects.join(', '), inline: false });
    }

    // Add tolerance information
    let toleranceInfo = '';
    Object.entries(!!info.tolerance ?? {}).forEach(([key, value]) => {
      if (value) {
        toleranceInfo += `**${key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:** ${Array.isArray(value) ? value.join(', ') : value}\n`;
      }
    });
    if (toleranceInfo !== '') {
      embed.addFields({ name: '📈 Tolerance', value: toleranceInfo, inline: false });
    }

    // Add additional fields if available
    if (info.notes) embed.addFields({ name: '📝 Notes', value: info.notes, inline: false });
    if (info.half_life) embed.addFields({ name: '(λ) Half-life', value: info.half_life, inline: true });
    if (info.trip_reports) {
      embed.addFields({ name: '🌀 Trip Reports', value: info.trip_reports.split('\n').slice(0, 3).join('\n'), inline: false });
      embed.addFields({ name: '‎', value: "> Read more on [Bluelight.org](https://bluelight.org)", inline: false });
    }

    embed.setFooter({ text: 'Data provided by PsyAI - Use responsibly' })
      .setTimestamp();

    return [embed, interaction];
  } catch (error) {
    console.error(`Error creating drug info embed: ${error}`);
    return [createErrorEmbed(substanceName), interaction];
  }
}

// function createDosageFields(info: DrugInfo) {
//   const fields_final = info.dosages.routes_of_administration.flatMap(route => {
//     const fields = [];
//     let doseList = ``;

//     for (const [range, dose] of Object.entries(route.dose_ranges)) {
//       if (dose) {
//         doseList += `> **${range.charAt(0).toUpperCase() + range.slice(1)}:** ${dose}\n`;
//       }
//     }

//     fields.push({ name: `⚖️ **ROA: (${route.route})**`, value: doseList, inline: true });

//     return fields;
//   });
//   while (fields_final.length < info.dosages.routes_of_administration.length) {
//     fields_final.push({ name: '\u200B', value: '\u200B', inline: true });
//   }
//   return fields_final;
// }

// function createDurationFields(info: DrugInfo) {
//   let durationList = '';
//   for (const [key, value] of Object.entries(info.duration)) {
//     if (value) {
//       durationList += `> **${key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:** ${value}\n`;
//     }
//   }
//   return [{ name: '⏱️ Duration', value: durationList, inline: false }];
// }

// function createInteractionFields(info: DrugInfo) {
//   return Object.entries(info.interactions)
//     .filter(([_, value]) => value.length > 0)
//     .map(([key, value]) => ({
//       name: `⚠️ (${key.charAt(0).toUpperCase() + key.slice(1)}) Interactions`,
//       value: value.map(item => `> ${item}`).join('\n'),
//       inline: true
//     }));
// }

// function createToleranceFields(info: DrugInfo) {
//   let toleranceList = '';
//   for (const [key, value] of Object.entries(info.tolerance)) {
//     if (value) {
//       toleranceList += `> **${key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:** ${Array.isArray(value) ? value.join(', ') : value
//         }\n`;
//     }
//   }
//   return [{ name: '📈 Tolerance', value: toleranceList, inline: false }];
// }

function createErrorEmbed(substanceName: string): Discord.EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('Error Fetching Drug Information')
    .setDescription(`Unable to retrieve information for ${substanceName}. Please try again later or contact support.`)
    .setFooter({ text: 'PsyAI Error' })
    .setTimestamp();
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
    const user_disclaimer = await getUserDisclaimerStatus(discordUserId);

    if (bannedUsers.includes(discordUserId)) {
      await interaction.reply("I'm sorry; you are access has been restricted. You probably asked me something naughty, e.g. 'How to make meth?'.\n\nPlease contact my creator (@sernyl) for more information.");
      return;
    }

    if (calcDowntime()) {
      await interaction.reply(`Dude, I am **way** too high to answer questions right now ᎧᏇᎧ.\n\nJust kidding -- I'm actually undergoing routine maintenance.  Estimated time: ${calcDowntime()}.`);
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

    const substanceName = interaction.options.get("substance").value! as string;
    await interaction.deferReply();
    const [embed, Out] = await createOptimizedDrugInfoEmbed(interaction, substanceName);

    await Out.followUp({ embeds: [embed] });
  } catch (error) {
    console.error(`Error in performInteraction: ${error}`);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(constants("SORRY_NOTSORRY"));
    } else {
      await interaction.reply(constants("SORRY_NOTSORRY"));
    }
  }
}
