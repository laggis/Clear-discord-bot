const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json'); // Ensure you store your token in a config.json file or use environment variables
const USER_ID = ''; // Replace with the user ID you want to restrict the command to

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag} - ${client.user.id}`);
    console.log('Ready to clear messages!');
});

client.on('messageCreate', async message => {
    // Command prefix and command name
    const prefix = ',';
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'clear') {
        // Check if the user invoking the command has the specific user ID
        if (message.author.id === USER_ID) {
            const amount = parseInt(args[0]);

            if (isNaN(amount)) {
                return message.reply('Please provide a valid number of messages to delete.').then(msg => {
                    setTimeout(() => msg.delete(), 5000);
                });
            }

            const messages = await message.channel.bulkDelete(amount, true);
            message.channel.send(`Deleted ${messages.size} message(s)`).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        } else {
            message.reply('You do not have permission to use this command.').then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        }
    }
});

client.login(token);