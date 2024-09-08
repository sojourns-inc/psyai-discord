import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const USER_ASSOC_TABLE_NAME = 'user_association';
const USER_DISCLAIMER_TABLE_NAME = 'user_disclaimer';
const supabase = createClient(SUPABASE_URL as string, SUPABASE_KEY as string);

export async function getUserAssociation(discordUserId: string) {
  try {
    console.log('Fetching user association for discordUserId:', discordUserId);
    const { data, error } = await supabase
      .from(USER_ASSOC_TABLE_NAME)
      .select('*')
      .eq('discord_id', discordUserId)
      .single();

    if (!data) {
      console.log('User association not found, creating a new one');
      return await createUserAssociation(discordUserId);
    }

    if (error) {
      console.error('Error fetching user association:', error);
      return null;
    }

    console.log('User association fetched successfully:', data);
    return data;
  } catch (error) {
    console.error(`Error fetching user association: ${error}`);
    return null;
  }
}

export async function createUserAssociation(discordUserId: string) {
  try {
    console.log('Creating user association for discordUserId:', discordUserId);
    const { data, error } = await supabase
      .from(USER_ASSOC_TABLE_NAME)
      .upsert([{ discord_id: discordUserId, subscription_status: false, stripe_id: "placeholder", trial_prompts: 5 }]);

    if (error) {
      console.error('Error creating user association:', error);
      return null;
    }

    console.log('User association created successfully:', data);
    return data;
  } catch (error) {
    console.error(`Error creating user association: ${error}`);
    return null;
  }
}

export async function checkStripeSub(discordUserId: string) {
  console.log('Checking Stripe subscription for discordUserId:', discordUserId);
  const user_association = await getUserAssociation(discordUserId);
  const subscriptionStatus = user_association?.subscription_status || false;
  console.log('Stripe subscription status:', subscriptionStatus);
  return subscriptionStatus;
}

export async function getUserDisclaimerStatus(discordUserId: string) {
  return new Promise((resolve, reject) => resolve({agreed: true}));
  // try {
  //   console.log('Fetching user disclaimer status for discordUserId:', discordUserId);
  //   const { data, error } = await supabase
  //     .from(USER_DISCLAIMER_TABLE_NAME)
  //     .select('*')
  //     .eq('discord_id', discordUserId)
  //     .single();
  //   console.log('User disclaimer status fetched:', data);

  //   if (!data) {
  //     console.log('User disclaimer status not found, creating a new one');
  //     return await createUserDisclaimerStatus(discordUserId);
  //   }

  //   if (error) {
  //     console.error('Error fetching user disclaimer status:', error);
  //     return null;
  //   }

  //   return data;
  // } catch (error) {
  //   console.error(`Error fetching user disclaimer status: ${error}`);
  //   return null;
  // }
}

export async function createUserDisclaimerStatus(discordUserId: string) {
  return new Promise((resolve, reject) => resolve({agreed: true}));
  // try {
  //   console.log('Creating user disclaimer status for discordUserId:', discordUserId);
  //   const { data, error } = await supabase
  //     .from(USER_DISCLAIMER_TABLE_NAME)
  //     .upsert([{ discord_id: discordUserId, agreed: false }]);

  //   if (error) {
  //     console.error('Error creating user disclaimer status:', error);
  //     return null;
  //   }

  //   if (data === null) {
  //     // Return a default object when data is null (i.e., a new row was inserted)
  //     console.log('User disclaimer status created successfully');
  //     return { discord_id: discordUserId, agreed: false };
  //   } else {
  //     console.log('User disclaimer status updated successfully:', data);
  //     return data;
  //   }

  // } catch (error) {
  //   console.error(`Error creating user disclaimer status: ${error}`);
  //   return null;
  // }
}

export async function updateUserDisclaimerStatus(discordUserId: string, agreed: boolean) {
  try {
    console.log('Updating user disclaimer status for discordUserId:', discordUserId);
    const { data, error } = await supabase
      .from(USER_DISCLAIMER_TABLE_NAME)
      .update({ agreed })
      .eq('discord_id', discordUserId);

    if (error) {
      console.error('Error updating user disclaimer status:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error updating user disclaimer status: ${error}`);
    return null;
  }
}