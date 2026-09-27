// notbunnylol command config.
// Edit this to add or modify commands, then commit + push.
// $1, $2, ... = individual positional args, $* = all args joined by space.
// aliases: ['other', 'names'] lets a command be triggered by more than one keyword.
const CONFIG = {
  links: {
    gh: {
      subcommands: {
        repo: {
          url: 'https://github.com/search?type=repositories&q=$*',
          flags: {
            lang: 'language', // --lang python  →  &language=python
            sort: 's',        // --sort stars   →  &s=stars
          },
        },
        code: {
          url: 'https://github.com/search?type=code&q=$*',
          flags: {
            lang: 'l', // --lang python  →  &l=python
          },
        },
        pr: {
          url: 'https://github.com/search?type=pullrequests&q=$*',
        },
        user: {
          url: 'https://github.com/$1',
        },
      },
    },

    g: {
      url: 'https://www.google.com/search?q=$*',
    },

    yt: {
      url: 'https://www.youtube.com/results?search_query=$*',
    },

    wiki: {
      url: 'https://en.wikipedia.org/wiki/$1',
    },

    maps: {
      url: 'https://www.google.com/maps/search/$*',
    },

    npm: {
      url: 'https://www.npmjs.com/search?q=$*',
    },

    mdn: {
      url: 'https://developer.mozilla.org/en-US/search?q=$*',
    },

    amz: {
      url: 'https://www.amazon.co.uk/s?k=$*',
    },

    claude: {
      url: 'https://claude.ai/new?q=$*',
    },

    ig: {
      url: 'https://www.instagram.com/$1/', // profile lookup, Instagram has no public search endpoint
    },

    fb: {
      url: 'https://www.facebook.com/$1', // profile/page lookup, Facebook has no public search endpoint
    },

    netflix: {
      url: 'https://www.netflix.com/search?q=$*',
    },

    flights: {
      url: 'https://www.google.com/travel/flights?q=$*', // loose text query only, no structured from/to/date
    },

    reddit: {
      url: 'https://www.reddit.com/search/?q=$*',
    },

    tr: {
      url: 'https://translate.google.com/?sl=auto&tl=en&text=$*&op=translate',
      aliases: ['translate'],
    },
  },
};
