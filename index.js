require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

// ── Bot Admins ────────────────────────────────────────────────────────────────
// Add user IDs here OR in .env as ADMIN_IDS=id1,id2,id3
// Both sources are merged — no duplicates.
const HARDCODED_ADMINS = [
  // '408659138030206990',
  // '1130574602033180734',
];

function loadAdmins() {
  const fromEnv = (process.env.ADMIN_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(id => /^\d{17,20}$/.test(id)); // valid snowflake only
  return new Set([...HARDCODED_ADMINS, ...fromEnv]);
}

// Live-reloadable so you can update .env without restarting
let BOT_ADMINS = loadAdmins();

function isAdmin(userId) {
  return BOT_ADMINS.has(userId);
}

// ── Client ────────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Slash commands ────────────────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Advanced message purge utility (Bot Admins only)')
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Number of messages to delete (1–100, default 10)')
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('Only delete messages from this @mention'))
    .addStringOption(opt =>
      opt.setName('user_ids')
        .setDescription('Space-separated user IDs  e.g. 408659138030206990 1130574602033180734'))
    .addBooleanOption(opt =>
      opt.setName('bots')
        .setDescription('Only delete messages sent by bots'))
    .addStringOption(opt =>
      opt.setName('contains')
        .setDescription('Only delete messages containing this text'))
    .addStringOption(opt =>
      opt.setName('before')
        .setDescription('Delete messages before this message ID'))
    .addStringOption(opt =>
      opt.setName('after')
        .setDescription('Delete messages after this message ID'))
    .addBooleanOption(opt =>
      opt.setName('silent')
        .setDescription('Skip the public confirmation message (default false)')),

  new SlashCommandBuilder()
    .setName('admins')
    .setDescription('List current bot admins'),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),

  new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Show bot information'),
].map(cmd => cmd.toJSON());

// ── Ready ─────────────────────────────────────────────────────────────────────
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🛡️  Bot admins loaded: ${[...BOT_ADMINS].join(', ') || '(none)'}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ Slash commands registered globally');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
});

// ── Embed helpers ─────────────────────────────────────────────────────────────
const successEmbed = (desc, fields = []) =>
  new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('🧹 Messages Cleared')
    .setDescription(desc)
    .addFields(fields)
    .setTimestamp();

const errorEmbed = desc =>
  new EmbedBuilder()
    .setColor(0xED4245)
    .setTitle('❌ Error')
    .setDescription(desc)
    .setTimestamp();

const infoEmbed = (title, desc, fields = []) =>
  new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(title)
    .setDescription(desc)
    .addFields(fields)
    .setTimestamp();

const warnEmbed = (title, desc, fields = []) =>
  new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle(title)
    .setDescription(desc)
    .addFields(fields)
    .setTimestamp();

// ── Interaction handler ───────────────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // ── /ping ──────────────────────────────────────────────────────────────────
  if (interaction.commandName === 'ping') {
    const sent = await interaction.reply({ content: '🏓 Pinging…', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply({
      content: '',
      embeds: [
        infoEmbed('🏓 Pong!', null, [
          { name: 'Roundtrip Latency',  value: `\`${latency}ms\``,      inline: true },
          { name: 'WebSocket Heartbeat', value: `\`${client.ws.ping}ms\``, inline: true },
        ]),
      ],
    });
    return;
  }

  // ── /botinfo ───────────────────────────────────────────────────────────────
  if (interaction.commandName === 'botinfo') {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);
    await interaction.reply({
      embeds: [
        infoEmbed('🤖 Bot Information', `**${client.user.tag}**`, [
          { name: 'Servers',    value: `\`${client.guilds.cache.size}\``, inline: true },
          { name: 'Uptime',     value: `\`${h}h ${m}m ${s}s\``,          inline: true },
          { name: 'Ping',       value: `\`${client.ws.ping}ms\``,         inline: true },
          { name: 'discord.js', value: `\`v14\``,                         inline: true },
          { name: 'Node.js',    value: `\`${process.version}\``,          inline: true },
          { name: 'Admins',     value: `\`${BOT_ADMINS.size}\``,          inline: true },
        ]),
      ],
      ephemeral: true,
    });
    return;
  }

  // ── /admins ────────────────────────────────────────────────────────────────
  if (interaction.commandName === 'admins') {
    BOT_ADMINS = loadAdmins(); // reload live
    const adminList = [...BOT_ADMINS];
    const desc = adminList.length
      ? adminList.map(id => `<@${id}> (\`${id}\`)`).join('\n')
      : '*No bot admins configured.*\nAdd IDs to `ADMIN_IDS` in your `.env` file.';

    await interaction.reply({
      embeds: [infoEmbed('🛡️ Bot Admins', desc)],
      ephemeral: true,
    });
    return;
  }

  // ── /clear ─────────────────────────────────────────────────────────────────
  if (interaction.commandName === 'clear') {
    BOT_ADMINS = loadAdmins(); // reload live on every clear

    // ── Admin gate ────────────────────────────────────────────────────────────
    if (!isAdmin(interaction.user.id)) {
      return interaction.reply({
        embeds: [errorEmbed('🚫 You are not a **Bot Admin**.\nAsk the bot owner to add your ID to the admin list.')],
        ephemeral: true,
      });
    }

    // ── Bot permission check ──────────────────────────────────────────────────
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        embeds: [errorEmbed('I need the **Manage Messages** permission in this server.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // ── Parse options ─────────────────────────────────────────────────────────
    const amount      = interaction.options.getInteger('amount') ?? 10;
    const mentionUser = interaction.options.getUser('user');
    const userIdsRaw  = interaction.options.getString('user_ids') ?? '';
    const botsOnly    = interaction.options.getBoolean('bots');
    const contains    = interaction.options.getString('contains');
    const beforeId    = interaction.options.getString('before');
    const afterId     = interaction.options.getString('after');
    const silent      = interaction.options.getBoolean('silent') ?? false;

    // Merge @mention + raw IDs into one Set (deduped automatically)
    const targetIds = new Set();
    if (mentionUser) targetIds.add(mentionUser.id);
    for (const raw of userIdsRaw.split(/\s+/)) {
      const id = raw.trim();
      if (/^\d{17,20}$/.test(id)) {
        targetIds.add(id);
      } else if (id) {
        console.warn(`[clear] Skipping invalid user ID: "${id}"`);
      }
    }

    // ── Fetch messages ────────────────────────────────────────────────────────
    const fetchLimit   = Math.min(amount * 4, 100);
    const fetchOptions = { limit: fetchLimit };
    if (beforeId) fetchOptions.before = beforeId;
    if (afterId)  fetchOptions.after  = afterId;

    let messages;
    try {
      messages = await interaction.channel.messages.fetch(fetchOptions);
    } catch {
      return interaction.editReply({
        embeds: [errorEmbed('Failed to fetch messages. Check my channel permissions.')],
      });
    }

    // ── Apply filters ─────────────────────────────────────────────────────────
    let filtered = [...messages.values()];

    // Discord bulk-delete only allows messages < 14 days old
    const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    filtered = filtered.filter(m => m.createdTimestamp > twoWeeksAgo);

    if (targetIds.size > 0) filtered = filtered.filter(m => targetIds.has(m.author.id));
    if (botsOnly === true)  filtered = filtered.filter(m => m.author.bot);
    if (contains)           filtered = filtered.filter(m => m.content.toLowerCase().includes(contains.toLowerCase()));
    if (afterId)            filtered = filtered.filter(m => BigInt(m.id) > BigInt(afterId));

    filtered = filtered.slice(0, amount);

    if (filtered.length === 0) {
      return interaction.editReply({
        embeds: [
          warnEmbed(
            '⚠️ Nothing to Delete',
            'No messages matched your filters.\n\n**Possible reasons:**\n- Messages are older than **14 days**\n- No messages from the specified user(s)\n- The `contains` text didn\'t match anything',
          ),
        ],
      });
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    let deleted = 0;
    try {
      if (filtered.length === 1) {
        await filtered[0].delete();
        deleted = 1;
      } else {
        const result = await interaction.channel.bulkDelete(filtered, true);
        deleted = result.size;
      }
    } catch (err) {
      return interaction.editReply({
        embeds: [errorEmbed(`Deletion failed: ${err.message}`)],
      });
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    const filterParts = [];
    if (targetIds.size > 0) {
      filterParts.push(`Users: ${[...targetIds].map(id => `<@${id}>`).join(', ')}`);
    }
    if (botsOnly === true) filterParts.push('Bots only');
    if (contains)          filterParts.push(`Contains: \`${contains}\``);
    if (beforeId)          filterParts.push(`Before: \`${beforeId}\``);
    if (afterId)           filterParts.push(`After: \`${afterId}\``);

    const fields = [
      { name: 'Deleted',   value: `\`${deleted}\` message${deleted !== 1 ? 's' : ''}`, inline: true },
      { name: 'Channel',   value: `${interaction.channel}`,                             inline: true },
      { name: 'Moderator', value: `${interaction.user}`,                                inline: true },
    ];
    if (filterParts.length) {
      fields.push({ name: 'Filters Applied', value: filterParts.join('\n'), inline: false });
    }

    await interaction.editReply({
      embeds: [successEmbed(`Purged messages in ${interaction.channel}.`, fields)],
    });

    // Public confirmation — auto-deletes after 5 s
    if (!silent) {
      const pub = await interaction.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x57F287)
            .setDescription(`🧹 **${deleted}** message${deleted !== 1 ? 's' : ''} deleted by ${interaction.user}.`)
            .setTimestamp(),
        ],
      });
      setTimeout(() => pub.delete().catch(() => {}), 5000);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
