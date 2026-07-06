const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// DISCORD WEBHOOK SETUP
// ============================================================
// 1. Go to your Discord server → Channel Settings → Integrations → Webhooks
// 2. Create a new webhook, copy the URL
// 3. Replace the URL below with your actual webhook URL
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1523598919060291705/H1hOhzQES2JTHjA9nePEqPwLdaRYhzp_15azR1COz0eGFOgYjCWH9Z2_Ca_jWLZx5_3u';

async function sendToDiscord(data) {
    const { name, email, game, message } = data;

    const embed = {
        title: '⚔️ New Oath of Allegiance',
        color: 0x2c2c2c,
        fields: [
            { name: '👤 Name', value: name, inline: true },
            { name: '📧 Email', value: email, inline: true },
            { name: '🎮 Realm', value: game, inline: true },
            { name: '📜 Message', value: message || 'No additional words.', inline: false }
        ],
        footer: {
            text: 'ARCHON • In darkness, we rise.',
            icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
        },
        timestamp: new Date().toISOString()
    };

    const payload = {
        content: `@everyone A new soul seeks the ARCHON covenant!`,
        embeds: [embed],
        username: 'ARCHON Oathkeeper',
        avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Discord API error: ${response.status} - ${errorText}`);
        }

        return true;
    } catch (error) {
        console.error('Failed to send to Discord:', error);
        throw error;
    }
}

// ============================================================
// API ROUTES
// ============================================================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, game, message } = req.body;

        // Validate
        if (!name || !email || !game) {
            return res.status(400).json({ error: 'Name, email, and game are required.' });
        }

        // Send to Discord
        await sendToDiscord({ name, email, game, message });

        res.status(200).json({ success: true, message: 'Oath recorded.' });
    } catch (error) {
        console.error('Error processing oath:', error);
        res.status(500).json({ error: 'Failed to process oath. Please try again.' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`⚔️ ARCHON Oathkeeper running on port ${PORT}`);
});