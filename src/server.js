const express = require('express');
const jsonDB = require('node-json-db');
const { json } = require('body-parser');
const cors = require('cors');
const app = express();
const fetch = require('node-fetch');
const path = require('path')

const db = new jsonDB.JsonDB(path.resolve('./db/db.json'), false, true, '/');

app.use(cors());

app.use(json());

const gaiaLinkRegex = /^https:\/\/[\d\w\.\/]+vote-v1.json$/;
const didRegex = /^did:btc-addr:[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
const bitcoinAddressRegex = /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/;
console.log(db.count('/voting/votes'))
app.post('/add-vote', async (req, res) => {
  const link = req.body.vote_public_link;
  if (!gaiaLinkRegex.test(req.body.vote_public_link)) {
    return res.status(400).json({ error: 'malformed gaia url' });
  }

  const extractedGaiaAddress = link.match(bitcoinAddressRegex);

  const didAlreadyVote = db.getData('/voting/gaiaUrls/' + extractedGaiaAddress);

  if (didAlreadyVote) {
    return res.status(400).json({error: 'you already voted'});
  }

  try {
    const gaiaRes = await fetch.default(link);
    const text = await gaiaRes.text();
    const textIsDID = didRegex.test(text);
    if (!textIsDID) {
      return res.status(400).json({ error: 'malformed vote' });
    }

    db.push('/voting/gaiaUrls/' + extractedGaiaAddress, true)
    db.push('/voting/votes[]', text, true);
    db.save()
  } catch (e) {
    return res.status(500).json({ error: 'could not get vote from gaia hub' });
  }
  console.log(req.body.vote_public_link);
  res.end();
});

app.get('/votes-count', (req, res) => {
  res.json({
    count: db.count('/voting/votes')
  });
})

const port = process.env.PORT || 4555;
app.listen(port, () => {
  console.log('listening on port', port);
});
