// notbunnylol command config.
// Edit this to add or modify commands, then commit + push.
// $1, $2, ... = individual positional args, $* = all args joined by space.
// aliases: ['other', 'names'] lets a command be triggered by more than one keyword.
// group: 'Name' clusters commands together in the help page table.
// description / example: shown as columns on the help page.
// emptyUrl: used instead of url when the command is typed with no args at all,
//   or when a $1/$2/... in url wasn't filled by a positional arg.
const CONFIG = {
  links: {
    gh: {
      group: 'Dev',
      subcommands: {
        repo: {
          description: 'Search GitHub repositories',
          example: 'gh repo notbunnylol',
          url: 'https://github.com/search?type=repositories&q=$*',
          flags: {
            lang: 'language', // --lang python  →  &language=python
            sort: 's',        // --sort stars   →  &s=stars
          },
        },
        code: {
          description: 'Search code on GitHub',
          example: 'gh code useState',
          url: 'https://github.com/search?type=code&q=$*',
          flags: {
            lang: 'l', // --lang python  →  &l=python
          },
        },
        pr: {
          description: 'Search GitHub pull requests',
          example: 'gh pr fix login bug',
          url: 'https://github.com/search?type=pullrequests&q=$*',
        },
        user: {
          description: "Open a GitHub user's profile",
          example: 'gh user torvalds',
          url: 'https://github.com/$1',
          emptyUrl: 'https://github.com/',
        },
      },
    },

    npm: {
      group: 'Dev',
      description: 'Search npm packages',
      example: 'npm express',
      url: 'https://www.npmjs.com/search?q=$*',
    },

    mdn: {
      group: 'Dev',
      description: 'Search MDN Web Docs',
      example: 'mdn Array.prototype.map',
      url: 'https://developer.mozilla.org/en-US/search?q=$*',
    },

    g: {
      group: 'Search',
      description: 'Search Google',
      example: 'g best ramen tokyo',
      url: 'https://www.google.com/search?q=$*',
    },

    wiki: {
      group: 'Search',
      description: 'Open a Wikipedia article',
      example: 'wiki Bézier curve',
      url: 'https://en.wikipedia.org/wiki/$1',
      emptyUrl: 'https://en.wikipedia.org/',
    },

    maps: {
      group: 'Search',
      description: 'Search Google Maps',
      example: 'maps Shinjuku Tokyo',
      url: 'https://www.google.com/maps/search/$*',
    },

    yt: {
      group: 'Media',
      description: 'Search YouTube',
      example: 'yt lo-fi beats',
      url: 'https://www.youtube.com/results?search_query=$*',
    },

    netflix: {
      group: 'Media',
      description: 'Search Netflix',
      example: 'netflix stranger things',
      url: 'https://www.netflix.com/search?q=$*',
    },

    ig: {
      group: 'Social',
      description: 'Open an Instagram profile',
      example: 'ig torvalds',
      url: 'https://www.instagram.com/$1/', // profile lookup, Instagram has no public search endpoint
      emptyUrl: 'https://www.instagram.com/',
    },

    fb: {
      group: 'Social',
      description: 'Open a Facebook profile or page',
      example: 'fb zuck',
      url: 'https://www.facebook.com/$1', // profile/page lookup, Facebook has no public search endpoint
      emptyUrl: 'https://www.facebook.com/',
    },

    reddit: {
      group: 'Social',
      description: 'Search Reddit',
      example: 'reddit cats',
      url: 'https://www.reddit.com/search/?q=$*',
      aliases: ['rd'],
    },

    amazon: {
      group: 'Shopping',
      description: 'Search Amazon',
      example: 'amazon mechanical keyboard',
      url: 'https://www.amazon.co.uk/s?k=$*',
      aliases: ['amz'],
    },

    flights: {
      group: 'Travel',
      description: 'Search Google Flights',
      example: 'flights nyc to tokyo',
      url: 'https://www.google.com/travel/flights?q=$*', // loose text query only, no structured from/to/date
      aliases: ['fl'],
    },

    claude: {
      group: 'Tools',
      description: 'Start a new Claude chat, prefilled with your query',
      example: 'claude what is the capital of peru',
      url: 'https://claude.ai/new?q=$*',
      aliases: ['cl'],
    },

    translate: {
      group: 'Tools',
      description: 'Translate text to English with Google Translate',
      example: 'translate hola como estas',
      url: 'https://translate.google.com/?sl=auto&tl=en&text=$*&op=translate',
      aliases: ['tr'],
    },

    docs: {
      group: 'Docs',
      description: 'Search your Google Docs, or create a new blank Doc with no query',
      example: 'docs budget',
      url: 'https://drive.google.com/drive/search?q=type:document%20$*', // searches your Drive for matching Docs
      emptyUrl: 'https://docs.new', // no args → new blank Doc
    },

    sheets: {
      group: 'Docs',
      description: 'Search your Google Sheets, or create a new blank Sheet with no query',
      example: 'sheets budget',
      url: 'https://drive.google.com/drive/search?q=type:spreadsheet%20$*', // searches your Drive for matching Sheets
      emptyUrl: 'https://sheets.new', // no args → new blank Sheet
    },

    slides: {
      group: 'Docs',
      description: 'Search your Google Slides, or create a new blank deck with no query',
      example: 'slides budget',
      url: 'https://drive.google.com/drive/search?q=type:presentation%20$*', // searches your Drive for matching Slides decks
      emptyUrl: 'https://slides.new', // no args → new blank Slides deck
    },
  },
};

// Expose CONFIG for unit tests (Node), without affecting browser usage.
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}
