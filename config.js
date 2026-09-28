// notbunnylol command config.
// Edit this to add or modify commands, then commit + push.
// $1, $2, ... = individual positional args, $* = all args joined by space.
// aliases: ['other', 'names'] lets a command be triggered by more than one keyword.
// group: 'Name' clusters commands together in the help page tree view.
// emptyUrl: used instead of url when the command is typed with no args at all.
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
      aliases: ['rd'],
    },

    amazon: {
      group: 'Shopping',
      url: 'https://www.amazon.co.uk/s?k=$*',
      aliases: ['amz'],
    },

    flights: {
      group: 'Travel',
      url: 'https://www.google.com/travel/flights?q=$*', // loose text query only, no structured from/to/date
      aliases: ['fl'],
    },

    claude: {
      group: 'Tools',
      url: 'https://claude.ai/new?q=$*',
      aliases: ['cl'],
    },

    translate: {
      group: 'Tools',
      url: 'https://translate.google.com/?sl=auto&tl=en&text=$*&op=translate',
      aliases: ['tr'],
    },

    docs: {
      group: 'Docs',
      url: 'https://drive.google.com/drive/search?q=type:document%20$*', // searches your Drive for matching Docs
      emptyUrl: 'https://docs.new', // no args → new blank Doc
    },

    sheets: {
      group: 'Docs',
      url: 'https://drive.google.com/drive/search?q=type:spreadsheet%20$*', // searches your Drive for matching Sheets
      emptyUrl: 'https://sheets.new', // no args → new blank Sheet
    },

    slides: {
      group: 'Docs',
      url: 'https://drive.google.com/drive/search?q=type:presentation%20$*', // searches your Drive for matching Slides decks
      emptyUrl: 'https://slides.new', // no args → new blank Slides deck
    },
  },
};

// Expose CONFIG for unit tests (Node), without affecting browser usage.
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}
