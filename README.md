# notbunnylol

A [bunnylol](https://www.bunny1.org/)-style redirector. Type short commands in your browser's address bar and get redirected to the right URL. It's a static site (plain HTML/JS, no server), so it can be hosted for free on GitHub Pages and used from any device.

## Setup

**1. Enable GitHub Pages**

In the repo's Settings → Pages, set the source to the `main` branch (root). Your site will be published at:

```
https://<your-username>.github.io/notbunnylol/
```

**2. Add a browser search engine**

In your browser's settings, add a custom search engine with:
- **URL:** `https://<your-username>.github.io/notbunnylol/?q=%s`
- **Keyword:** `go` (or anything you like)

Then type `go gh repo myproject` in the address bar to use it.

## Local preview

Just open `index.html` directly in a browser (`file:///path/to/notbunnylol/index.html`) — no server needed. Append `?q=gh+repo+myproject` to the URL to test a redirect.

## Browsing the commands

The help page has a sticky search bar at the top — press `/` anywhere on the page to jump to it, then type to filter the command list by name, description, example, or URL. Click a command's row (or focus it and press Enter/Space) to expand it and see its example, full redirect URL, and any flags.

## Tests & linting

Requires Node.js. Run everything with:

```
make check
```

Or individually: `make test` (unit tests for the query-resolution logic in `app.js`, via Node's built-in test runner) and `make lint` (ESLint). `make install` fetches dev dependencies (just ESLint) without running anything.

## Commands

| Command | Example | Redirects to |
|---|---|---|
| `gh repo <query>` | `gh repo myproject` | GitHub repository search |
| `gh code <query>` | `gh code useState` | GitHub code search |
| `gh pr <query>` | `gh pr fix login bug` | GitHub PR search |
| `gh user [name]` | `gh user torvalds` | GitHub user profile, or github.com if no name |
| `g <query>` | `g best ramen tokyo` | Google search |
| `yt <query>` | `yt lo-fi beats` | YouTube search |
| `wiki [article]` | `wiki Bézier curve` | Wikipedia article, or wikipedia.org if no article |
| `maps <place>` | `maps Shinjuku Tokyo` | Google Maps |
| `npm <package>` | `npm express` | npm search |
| `mdn <topic>` | `mdn Array.prototype.map` | MDN docs |
| `amazon` / `amz <query>` | `amz mechanical keyboard` | Amazon search |
| `claude` / `cl <query>` | `claude what is the capital of peru` | Claude, prefilled new chat |
| `ig [user]` | `ig torvalds` | Instagram profile, or instagram.com if no user |
| `fb [user]` | `fb zuck` | Facebook profile/page, or facebook.com if no user |
| `netflix <query>` | `netflix stranger things` | Netflix search |
| `flights` / `fl <query>` | `flights nyc to tokyo` | Google Flights |
| `reddit` / `rd <query>` | `reddit cats` | Reddit search |
| `translate` / `tr <text>` | `tr hola como estas` | Google Translate |
| `docs [query]` | `docs budget` | Search your Drive for Docs, or a new blank Doc if no query |
| `sheets [query]` | `sheets budget` | Search your Drive for Sheets, or a new blank Sheet if no query |
| `slides [query]` | `slides budget` | Search your Drive for Slides decks, or a new blank deck if no query |

Unknown commands fall back to a Google search. `ig` and `fb` go straight to a profile/page (`$1`) rather than searching — neither site has a public search URL. `docs`, `sheets`, and `slides` require being signed in to Google, since they search your own Drive rather than a public index. Commands that take a required `$1` (`ig`, `fb`, `wiki`, `gh user`) fall back to that site's homepage instead of a broken link when typed with no argument.

## Flags

Commands can accept `--flag value` arguments that map to URL query parameters, as defined in `config.js`.

```
gh repo --lang python --sort stars django
# → https://github.com/search?type=repositories&q=django&language=python&s=stars

gh code --lang javascript useState
# → https://github.com/search?type=code&q=useState&l=javascript
```

## Configuration

Edit `config.js` to add or modify commands, then commit and push — GitHub Pages redeploys automatically within a minute or two.

```js
const CONFIG = {
  links: {
    cmd: {
      description: 'Search example.com', // shown on the help page
      example: 'cmd django',              // shown on the help page
      url: 'https://example.com/search?q=$*', // $* = all args, $1 $2 = positional
      flags: {
        lang: 'language', // --lang python → &language=python
      },
      aliases: ['other-name'], // both `cmd` and `other-name` trigger this entry
      // used instead of `url` when typed with no args, or when a $1/$2/... in
      // `url` isn't filled by a positional arg (so a required-arg command
      // never redirects to a URL with a literal "$1" in it)
      emptyUrl: 'https://example.com/new',
    },
    'cmd-with-subcommands': {
      subcommands: {
        sub: {
          url: 'https://example.com/$1',
          emptyUrl: 'https://example.com/', // subcommands can set this too
        },
      },
    },
  },
};
```
