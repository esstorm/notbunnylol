// notbunnylol command config.
// Edit this to add or modify commands, then commit + push.
// $1, $2, ... = individual positional args, $* = all args joined by space.
// aliases: ['other', 'names'] lets a command be triggered by more than one keyword.
// group: 'Name' clusters commands together in the help page tree view.
const CONFIG = {
  links: {
    gh: {
      group: 'Dev',
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

    npm: {
      group: 'Dev',
      url: 'https://www.npmjs.com/search?q=$*',
    },

    mdn: {
      group: 'Dev',
      url: 'https://developer.mozilla.org/en-US/search?q=$*',
    },

    g: {
      group: 'Search',
      url: 'https://www.google.com/search?q=$*',
    },

    wiki: {
      group: 'Search',
      url: 'https://en.wikipedia.org/wiki/$1',
    },

    maps: {
      group: 'Search',
      url: 'https://www.google.com/maps/search/$*',
    },

    yt: {
      group: 'Media',
      url: 'https://www.youtube.com/results?search_query=$*',
    },

    netflix: {
      group: 'Media',
      url: 'https://www.netflix.com/search?q=$*',
    },

    ig: {
      group: 'Social',
      url: 'https://www.instagram.com/$1/', // profile lookup, Instagram has no public search endpoint
    },

    fb: {
      group: 'Social',
      url: 'https://www.facebook.com/$1', // profile/page lookup, Facebook has no public search endpoint
    },

    reddit: {
      group: 'Social',
      url: 'https://www.reddit.com/search/?q=$*',
    },

    amz: {
      group: 'Shopping',
      url: 'https://www.amazon.co.uk/s?k=$*',
    },

    flights: {
      group: 'Travel',
      url: 'https://www.google.com/travel/flights?q=$*', // loose text query only, no structured from/to/date
    },

    claude: {
      group: 'Tools',
      url: 'https://claude.ai/new?q=$*',
    },

    tr: {
      group: 'Tools',
      url: 'https://translate.google.com/?sl=auto&tl=en&text=$*&op=translate',
      aliases: ['translate'],
    },
  },
};
