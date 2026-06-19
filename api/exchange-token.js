// 这是 Vercel Serverless Function
const axios = require('axios');

module.exports = async (req, res) => {
    // 允许跨域（你的前端页面才能访问）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Missing code' });
    }

    try {
        // 用授权码换取 access_token
        const response = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
            },
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        // 返回 token 给前端
        res.status(200).json({
            access_token: response.data.access_token,
            token_type: response.data.token_type,
            scope: response.data.scope,
        });
    } catch (error) {
        console.error('Exchange token error:', error);
        res.status(500).json({ error: 'Failed to exchange token' });
    }
};
