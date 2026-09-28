const test = require('node:test');
const assert = require('node:assert/strict');

const { tokenize, parseArgs, resolveUrl, findCommand, handleQuery } = require('../app.js');
const CONFIG = require('../config.js');

test('tokenize', async (t) => {
    await t.test('splits on whitespace', () => {
        assert.deepEqual(tokenize('gh repo notbunnylol'), ['gh', 'repo', 'notbunnylol']);
    });

    await t.test('keeps quoted strings together', () => {
        assert.deepEqual(
            tokenize('gh repo "my project" --lang python'),
            ['gh', 'repo', 'my project', '--lang', 'python'],
        );
    });

    await t.test('returns an empty array for blank input', () => {
        assert.deepEqual(tokenize(''), []);
        assert.deepEqual(tokenize('   '), []);
    });
});

test('parseArgs', async (t) => {
    await t.test('separates positional args from flags', () => {
        assert.deepEqual(
            parseArgs(['notbunnylol', '--lang', 'python', '--sort', 'stars']),
            { flags: { lang: 'python', sort: 'stars' }, positional: ['notbunnylol'] },
        );
    });

    await t.test('treats a trailing flag with no value as boolean true', () => {
        assert.deepEqual(
            parseArgs(['foo', '--verbose']),
            { flags: { verbose: true }, positional: ['foo'] },
        );
    });

    await t.test('treats a flag immediately followed by another flag as boolean true', () => {
        assert.deepEqual(
            parseArgs(['--verbose', '--lang', 'python']),
            { flags: { verbose: true, lang: 'python' }, positional: [] },
        );
    });
});

test('resolveUrl', async (t) => {
    await t.test('substitutes positional placeholders', () => {
        const url = resolveUrl({ url: 'https://example.com/$1/$2' }, ['a', 'b'], {});
        assert.equal(url, 'https://example.com/a/b');
    });

    await t.test('joins all positional args for $*', () => {
        const url = resolveUrl({ url: 'https://example.com/search?q=$*' }, ['hello', 'world'], {});
        assert.equal(url, 'https://example.com/search?q=hello%20world');
    });

    await t.test('encodes positional args', () => {
        const url = resolveUrl({ url: 'https://example.com/wiki/$1' }, ['C++ & Rust'], {});
        assert.equal(url, 'https://example.com/wiki/C%2B%2B%20%26%20Rust');
    });

    await t.test('maps configured flags onto query params', () => {
        const url = resolveUrl(
            { url: 'https://example.com/search?q=$*', flags: { lang: 'language' } },
            ['x'],
            { lang: 'python' },
        );
        assert.equal(url, 'https://example.com/search?q=x&language=python');
    });

    await t.test('uses flagValues for boolean flags', () => {
        const url = resolveUrl(
            {
                url: 'https://example.com/search?q=$*',
                flags: { mine: 'sort' },
                flagValues: { mine: 'newest' },
            },
            ['x'],
            { mine: true },
        );
        assert.equal(url, 'https://example.com/search?q=x&sort=newest');
    });

    await t.test('ignores unconfigured flags', () => {
        const url = resolveUrl(
            { url: 'https://example.com/search?q=$*', flags: { lang: 'language' } },
            ['x'],
            { bogus: 'y' },
        );
        assert.equal(url, 'https://example.com/search?q=x');
    });
});

test('findCommand', async (t) => {
    await t.test('finds a command by its primary name', () => {
        assert.equal(findCommand('translate', CONFIG), CONFIG.links.translate);
    });

    await t.test('finds a command by alias', () => {
        assert.equal(findCommand('tr', CONFIG), CONFIG.links.translate);
    });

    await t.test('returns null for an unknown command', () => {
        assert.equal(findCommand('nope', CONFIG), null);
    });
});

test('handleQuery against the real CONFIG', async (t) => {
    await t.test('resolves a simple command', () => {
        assert.equal(
            handleQuery('g best ramen tokyo', CONFIG),
            'https://www.google.com/search?q=best%20ramen%20tokyo',
        );
    });

    await t.test('resolves a subcommand', () => {
        assert.equal(
            handleQuery('gh repo notbunnylol', CONFIG),
            'https://github.com/search?type=repositories&q=notbunnylol',
        );
    });

    await t.test('resolves a subcommand with flags', () => {
        assert.equal(
            handleQuery('gh repo notbunnylol --lang python --sort stars', CONFIG),
            'https://github.com/search?type=repositories&q=notbunnylol&language=python&s=stars',
        );
    });

    await t.test('resolves an aliased command', () => {
        assert.equal(
            handleQuery('translate hola', CONFIG),
            'https://translate.google.com/?sl=auto&tl=en&text=hola&op=translate',
        );
    });

    await t.test('falls back to positional $1 substitution', () => {
        assert.equal(handleQuery('wiki Bunnylol', CONFIG), 'https://en.wikipedia.org/wiki/Bunnylol');
    });

    await t.test('returns null for an unknown command', () => {
        assert.equal(handleQuery('nonexistent foo', CONFIG), null);
    });

    await t.test('returns null for an empty query', () => {
        assert.equal(handleQuery('', CONFIG), null);
        assert.equal(handleQuery('   ', CONFIG), null);
    });

    await t.test('returns null for an unknown subcommand under a valid command', () => {
        assert.equal(handleQuery('gh bogus notbunnylol', CONFIG), null);
    });

    await t.test('uses emptyUrl when a command with no args is typed', () => {
        assert.equal(handleQuery('docs', CONFIG), 'https://docs.new');
        assert.equal(handleQuery('sheets', CONFIG), 'https://sheets.new');
        assert.equal(handleQuery('slides', CONFIG), 'https://slides.new');
    });

    await t.test('searches Drive by type when args are given', () => {
        assert.equal(
            handleQuery('docs budget', CONFIG),
            'https://drive.google.com/drive/search?q=type:document%20budget',
        );
        assert.equal(
            handleQuery('sheets budget', CONFIG),
            'https://drive.google.com/drive/search?q=type:spreadsheet%20budget',
        );
        assert.equal(
            handleQuery('slides budget', CONFIG),
            'https://drive.google.com/drive/search?q=type:presentation%20budget',
        );
    });

    await t.test('falls back to emptyUrl instead of leaking an unfilled $1 placeholder', () => {
        assert.equal(handleQuery('ig', CONFIG), 'https://www.instagram.com/');
        assert.equal(handleQuery('ig ', CONFIG), 'https://www.instagram.com/');
        assert.equal(handleQuery('fb', CONFIG), 'https://www.facebook.com/');
        assert.equal(handleQuery('wiki', CONFIG), 'https://en.wikipedia.org/');
        assert.equal(handleQuery('gh user', CONFIG), 'https://github.com/');
    });

    await t.test('still resolves ig/fb/wiki/gh user normally when an arg is given', () => {
        assert.equal(handleQuery('ig torvalds', CONFIG), 'https://www.instagram.com/torvalds/');
        assert.equal(handleQuery('fb zuck', CONFIG), 'https://www.facebook.com/zuck');
        assert.equal(handleQuery('gh user torvalds', CONFIG), 'https://github.com/torvalds');
    });
});

test('every configured command resolves to a valid absolute URL', () => {
    for (const [name, cmd] of Object.entries(CONFIG.links)) {
        if (cmd.url) {
            const url = resolveUrl(cmd, ['arg1', 'arg2'], {});
            assert.doesNotThrow(() => new URL(url), `${name} produced an invalid URL: ${url}`);
        }
        if (cmd.subcommands) {
            for (const [subName, subCmd] of Object.entries(cmd.subcommands)) {
                const url = resolveUrl(subCmd, ['arg1', 'arg2'], {});
                assert.doesNotThrow(() => new URL(url), `${name} ${subName} produced an invalid URL: ${url}`);
            }
        }
    }
});
