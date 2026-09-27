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
        const { flags, positional } = parseArgs(rest);
        return resolveUrl(cmdConfig, positional, flags);
    }

    return null;
}

function renderHelp(config) {
    const base = window.location.href.split('?')[0];
    document.getElementById('search-url').textContent = `${base}?q=%s`;

    const rows = [];
    for (const [name, cmd] of Object.entries(config.links || {})) {
        const names = [name, ...(cmd.aliases || [])].join(', ');
        if (cmd.subcommands) {
            for (const [sub, subCmd] of Object.entries(cmd.subcommands)) {
                const flagList = subCmd.flags ? Object.keys(subCmd.flags).map(f => `--${f}`).join(', ') : '';
                rows.push({ cmd: `${name} ${sub}`, url: subCmd.url, flags: flagList });
            }
        }
        if (cmd.url) {
            const flagList = cmd.flags ? Object.keys(cmd.flags).map(f => `--${f}`).join(', ') : '';
            rows.push({ cmd: names, url: cmd.url, flags: flagList });
        }
    }

    const tbody = document.getElementById('commands-body');
    tbody.innerHTML = rows.map(r =>
        `<tr><td><code>${r.cmd}</code></td><td>${r.url}</td><td>${r.flags}</td></tr>`
    ).join('\n');

    document.getElementById('help').style.display = '';
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

main();
