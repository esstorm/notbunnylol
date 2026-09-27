// notbunnylol command config.
// Edit this to add or modify commands, then commit + push.
// $1, $2, ... = individual positional args, $* = all args joined by space.
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
  },
};
