import Discord from 'discord.js';

import { applicationCommandData as about_data, performInteraction as about } from "./about";
import { applicationCommandData as info_data,  performInteraction as info_perform } from './info';
import { applicationCommandData as ask_data,  performInteraction as ask_perform } from './ask';
// import { applicationCommandData as fx_data,  performInteraction as fx_perform } from './fx'; TODO: DEPRECATED
//import { applicationCommandData as sub_data,  performInteraction as sub_perform } from './sub'; TODO: DEPRECATED

export interface V2Command {
    data: Discord.ApplicationCommandData;
    perform: (interaction: Discord.CommandInteraction) => void;
}

export const v2commands: { [key: string]: V2Command } = {
    "about": { data: about_data, perform: about },
    "info":  { data: info_data,  perform: info_perform },
    "ask":  { data: ask_data,  perform: ask_perform },
    // "fx":  { data: fx_data,  perform: fx_perform }, TODO: DEPRECATED
    //"sub": { data: sub_data, perform: sub_perform }
};
