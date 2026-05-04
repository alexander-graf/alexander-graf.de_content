const express = require('express');
const axios = require('axios');
const { AuthorizationCode } = require('simple-oauth2');

const app = express();
const port = process.env.PORT || 3000;

const config = {
  client: {
    id: process.env.OAUTH_CLIENT_ID,
    secret: process.env.OAUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  },
};

const client = new AuthorizationCode(config);

app.get('/auth', (req, res) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: `${process.env.ORIGIN}/callback`,
    scope: 'repo,user',
    state: req.query.state,
  });
  res.redirect(authorizationUri);
});

app.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const options = {
    code,
    redirect_uri: `${process.env.ORIGIN}/callback`,
  };

  try {
    const accessToken = await client.getToken(options);
    const result = {
      token: accessToken.token.access_token,
      provider: 'github',
    };

    // Script to send token back to Decap CMS
    const response = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify(result)}',
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })()
      </script>
    `;
    res.send(response);
  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(500).json('Authentication failed');
  }
});

app.listen(port, () => {
  console.log(`OAuth Proxy listening at http://localhost:${port}`);
});
