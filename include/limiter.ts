// ./include/limiter.ts

import { Collection } from 'discord.js';

interface RateLimitConfig {
  cooldownTime: number;
  enabled: boolean;
}

export class RateLimiter {
  private cooldowns: Collection<string, Collection<string, number>>;
  private configs: Collection<string, RateLimitConfig>;
  private defaultConfig: RateLimitConfig;

  constructor(defaultCooldownTimeInSeconds: number) {
    this.cooldowns = new Collection();
    this.configs = new Collection();
    this.defaultConfig = { cooldownTime: defaultCooldownTimeInSeconds * 1000, enabled: false };
    console.log(`RateLimiter initialized with default cooldown time: ${defaultCooldownTimeInSeconds} seconds`);
  }

  setGuildConfig(guildId: string, config: Partial<RateLimitConfig>) {
    const currentConfig = this.configs.get(guildId) || { ...this.defaultConfig };
    const newConfig = { ...currentConfig, ...config };
    if (config.cooldownTime) {
      newConfig.cooldownTime *= 1000; // Convert to millis
    }
    this.configs.set(guildId, newConfig);
    console.log(`Guild config set for ${guildId}:`, this.configs.get(guildId));
  }

  isRateLimited(guildId: string, userId: string): boolean {
    console.log(`Checking rate limit for guild ${guildId}, user ${userId}`);
    const config = this.configs.get(guildId) || this.defaultConfig;
    console.log(`Config for guild ${guildId}:`, config);
  
    if (!config.enabled) {
      console.log(`Rate limiting not enabled for guild ${guildId}`);
      return false;
    }
  
    const now = Date.now();
    let guildCooldowns = this.cooldowns.get(guildId);
    if (!guildCooldowns) {
      guildCooldowns = new Collection();
      this.cooldowns.set(guildId, guildCooldowns);
      console.log(`Created new cooldown collection for guild ${guildId}`);
    }
  
    const userCooldown = guildCooldowns.get(userId);
    if (userCooldown) {
      console.log(`User ${userId} cooldown: ${new Date(userCooldown).toISOString()} (${userCooldown - now}ms from now)`);
    } else {
      console.log(`No existing cooldown for user ${userId}`);
    }
  
    if (userCooldown && now < userCooldown) {
      console.log(`User ${userId} is rate limited. Cooldown ends at ${new Date(userCooldown).toISOString()}`);
      return true;
    }
  
    const newCooldown = now + config.cooldownTime;
    guildCooldowns.set(userId, newCooldown);
    console.log(`Set new cooldown for user ${userId}. Ends at ${new Date(newCooldown).toISOString()} (${config.cooldownTime}ms from now)`);
    return false;
  }

  getRemainingCooldown(guildId: string, userId: string): number {
    console.log(`Getting remaining cooldown for guild ${guildId}, user ${userId}`);
    const config = this.configs.get(guildId) || this.defaultConfig;
    if (!config.enabled) {
      console.log(`Rate limiting not enabled for guild ${guildId}`);
      return 0;
    }

    const guildCooldowns = this.cooldowns.get(guildId);
    if (!guildCooldowns) {
      console.log(`No cooldowns found for guild ${guildId}`);
      return 0;
    }

    const userCooldown = guildCooldowns.get(userId);
    if (!userCooldown) {
      console.log(`No cooldown found for user ${userId}`);
      return 0;
    }

    const remaining = userCooldown - Date.now();
    const remainingSeconds = remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    console.log(`Remaining cooldown for user ${userId}: ${remainingSeconds} seconds`);
    return remainingSeconds;
  }
}

export const defaultRateLimiter = new RateLimiter(30);
console.log('Default RateLimiter instance created');