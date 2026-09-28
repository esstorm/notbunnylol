// notbunnylol — static, client-side bunnylol-style redirector.
// Reads CONFIG (from config.js), resolves the ?q= query into a target URL, and redirects.

// Splits a query string into tokens, respecting quoted strings.
// e.g. 'gh repo "my project" --lang python' → ['gh', 'repo', 'my project', '--lang', 'python']
function tokenize(query) {
    const tokens = [];
    const re = /[^\s"]+|"([^"]*)"/g;
    let match;
    while ((match = re.exec(query)) !== null) {
        tokens.push(match[1] !== undefined ? match[1] : match[0]);
    }
    return tokens;
}

// Splits tokens into named flags (--key value or --bool) and positional args.
function parseArgs(tokens) {
    const flags = {};
    const positional = [];
    let i = 0;
    while (i < tokens.length) {
        if (tokens[i].startsWith('--')) {
            const key = tokens[i].slice(2);
            const next = tokens[i + 1];
            if (next !== undefined && !next.startsWith('--')) {
                flags[key] = next;
                i += 2;
            } else {
                flags[key] = true;
                i++;
            }
        } else {
            positional.push(tokens[i]);
            i++;
        }
    }
    return { flags, positional };
}

// Resolves a command config + parsed args into a final redirect URL.
function resolveUrl(cmdConfig, positional, flags) {
    let url = cmdConfig.url;

    for (let i = 0; i < positional.length; i++) {
        url = url.replace(`$${i + 1}`, encodeURIComponent(positional[i]));
    }

    if (url.includes('$*')) {
        url = url.replace('$*', encodeURIComponent(positional.join(' ')));
    }

    if (cmdConfig.flags && Object.keys(flags).length > 0) {
        const urlObj = new URL(url);
        for (const [flagName, paramName] of Object.entries(cmdConfig.flags)) {
            const val = flags[flagName];
            if (val !== undefined && val !== true) {
                urlObj.searchParams.set(paramName, val);
            } else if (val === true && cmdConfig.flagValues?.[flagName]) {
                urlObj.searchParams.set(paramName, cmdConfig.flagValues[flagName]);
            }
        }
        url = urlObj.toString();
    }

    return url;
}

// Looks up a command by name, or by one of its configured aliases.
function findCommand(name, config) {
    if (config.links?.[name]) return config.links[name];
    for (const cmd of Object.values(config.links || {})) {
        if (cmd.aliases?.includes(name)) return cmd;
    }
    return null;
}

function handleQuery(query, config) {
    const tokens = tokenize(query.trim());
    if (!tokens.length) return null;

    const [command, ...rest] = tokens;
    const cmdConfig = findCommand(command, config);
    if (!cmdConfig) return null;

    if (cmdConfig.subcommands && rest.length > 0) {
        const subConfig = cmdConfig.subcommands[rest[0]];
        if (subConfig) {
            const { flags, positional } = parseArgs(rest.slice(1));
            return resolveUrl(subConfig, positional, flags);
        }
    }

    if (cmdConfig.url) {
        if (cmdConfig.emptyUrl && rest.length === 0) return cmdConfig.emptyUrl;
        const { flags, positional } = parseArgs(rest);
        return resolveUrl(cmdConfig, positional, flags);
    }

    return null;
}

// Builds one tree node (and its subcommand children, if any) as a DOM element.
function renderNode(name, cmd) {
    const node = document.createElement('div');
    node.className = 'node';

    const names = [name, ...(cmd.aliases || [])].join(', ');
    const flagList = cmd.flags ? Object.keys(cmd.flags).map(f => `--${f}`).join(' ') : '';

    const row = document.createElement('div');
    row.className = 'node-row';
    row.innerHTML = `
        <code class="cmd">${names}</code>
        ${cmd.url ? `<span class="url">${cmd.url}</span>` : '<span class="url muted">subcommands below</span>'}
        ${flagList ? `<span class="flags">${flagList}</span>` : ''}
    `;
    node.appendChild(row);

    if (cmd.subcommands) {
        const children = document.createElement('div');
        children.className = 'children';
        for (const [sub, subCmd] of Object.entries(cmd.subcommands)) {
            children.appendChild(renderNode(sub, subCmd));
        }
        node.appendChild(children);
    }

    return node;
}

// Wires up the "try it out" bar: live-previews the resolved URL as the user
// types, and opens it in a new tab on submit (so the help page stays open).
function setupTryBar(config) {
    const form = document.getElementById('try-form');
    const input = document.getElementById('try-input');
    const preview = document.getElementById('try-preview');

    function resolve(query) {
        return handleQuery(query, config) || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    input.addEventListener('input', () => {
        const query = input.value.trim();
        if (!query) {
            preview.textContent = '';
            preview.className = 'try-preview';
            return;
        }
        const matched = handleQuery(query, config);
        preview.textContent = matched ? `→ ${matched}` : `→ ${resolve(query)} (no match, falls back to Google)`;
        preview.className = matched ? 'try-preview' : 'try-preview muted';
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        window.open(resolve(query), '_blank', 'noopener');
    });
}

function renderHelp(config) {
    const base = window.location.href.split('?')[0];
    document.getElementById('search-url').textContent = `${base}?q=%s`;

    const groups = new Map();
    for (const [name, cmd] of Object.entries(config.links || {})) {
        const group = cmd.group || 'Other';
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group).push([name, cmd]);
    }

    const container = document.getElementById('tree');
    container.innerHTML = '';
    for (const [group, entries] of groups) {
        const section = document.createElement('section');
        section.className = 'group';

        const title = document.createElement('h2');
        title.className = 'group-title';
        title.textContent = group;
        section.appendChild(title);

        const tree = document.createElement('div');
        tree.className = 'tree';
        for (const [name, cmd] of entries) {
            tree.appendChild(renderNode(name, cmd));
        }
        section.appendChild(tree);

        container.appendChild(section);
    }

    document.getElementById('help').style.display = '';
    setupTryBar(config);
}

function main() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q) {
        const redirect = handleQuery(q, CONFIG) || `https://www.google.com/search?q=${encodeURIComponent(q)}`;
        window.location.replace(redirect);
        return;
    }

    renderHelp(CONFIG);
}

if (typeof window !== 'undefined') main();

// Expose the pure logic for unit tests (Node), without affecting browser usage.
if (typeof module !== 'undefined') {
    module.exports = { tokenize, parseArgs, resolveUrl, findCommand, handleQuery };
}
