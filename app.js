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

// Resolves a command, falling back to emptyUrl (or null) when a required
// $1/$2/... placeholder wasn't filled by a positional arg, so a command like
// `ig` (https://www.instagram.com/$1/) typed with no args never leaks a
// literal "$1" into the redirect URL.
function resolveOrFallback(cmdConfig, positional, flags) {
    const url = resolveUrl(cmdConfig, positional, flags);
    if (/\$\d/.test(url)) {
        return cmdConfig.emptyUrl || null;
    }
    return url;
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
            return resolveOrFallback(subConfig, positional, flags);
        }
    }

    if (cmdConfig.url) {
        if (cmdConfig.emptyUrl && rest.length === 0) return cmdConfig.emptyUrl;
        const { flags, positional } = parseArgs(rest);
        return resolveOrFallback(cmdConfig, positional, flags);
    }

    return null;
}

// Flattens CONFIG into one row per triggerable command, grouped by cmd.group.
// A command with subcommands contributes one row per subcommand (labeled
// "gh repo", "gh code", ...) rather than a nested tree, so every row stands
// on its own in the table.
function commandRows(config) {
    const rows = [];
    for (const [name, cmd] of Object.entries(config.links || {})) {
        const group = cmd.group || 'Other';
        if (cmd.subcommands) {
            for (const [sub, subCmd] of Object.entries(cmd.subcommands)) {
                rows.push({ group, label: `${name} ${sub}`, cmd: subCmd });
            }
        } else {
            const label = [name, ...(cmd.aliases || [])].join(', ');
            rows.push({ group, label, cmd });
        }
    }
    return rows;
}

// Builds a <tbody> for one command: a compact header row (Command +
// Description) plus a detail row (Example / Redirects to / Flags) that
// expands in place when the header row is clicked or activated via keyboard.
// The pair shares one dataset.search blob so the "/" filter shows/hides both
// as a unit.
function renderRow({ label, cmd }) {
    const tbody = document.createElement('tbody');
    tbody.className = 'cmd-group';
    tbody.dataset.search = [label, cmd.description, cmd.example, cmd.url]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    const header = document.createElement('tr');
    header.className = 'cmd-row';
    header.tabIndex = 0;
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');
    header.innerHTML = `
        <td><code class="cmd">${label}</code></td>
        <td class="desc">${cmd.description || ''}<span class="chevron" aria-hidden="true">&rsaquo;</span></td>
    `;

    function toggle() {
        const expanded = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', String(!expanded));
    }
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggle();
    });

    const flagList = cmd.flags ? Object.keys(cmd.flags).map(f => `--${f}`).join(' ') : '';
    const items = [];
    if (cmd.example) {
        items.push(`<div class="detail-item"><span class="detail-label">Example</span><code>${cmd.example}</code></div>`);
    }
    if (cmd.url) {
        items.push(`<div class="detail-item"><span class="detail-label">Redirects to</span><span class="url">${cmd.url}</span></div>`);
    }
    if (flagList) {
        items.push(`<div class="detail-item"><span class="detail-label">Flags</span><span class="flags">${flagList}</span></div>`);
    }

    const detail = document.createElement('tr');
    detail.className = 'cmd-detail-row';
    detail.innerHTML = `
        <td colspan="2">
            <div class="detail-collapse"><div class="detail-inner">${items.join('')}</div></div>
        </td>
    `;

    tbody.appendChild(header);
    tbody.appendChild(detail);
    return tbody;
}

// Wires up the "/" shortcut and live filtering for the command table: typing
// hides non-matching command groups and any section left with none visible.
function setupCommandSearch() {
    const input = document.getElementById('cmd-search');
    if (!input) return;

    function applyFilter() {
        const query = input.value.trim().toLowerCase();
        document.querySelectorAll('#tree .group').forEach((section) => {
            let anyVisible = false;
            section.querySelectorAll('tbody.cmd-group').forEach((group) => {
                const match = !query || group.dataset.search.includes(query);
                group.hidden = !match;
                if (match) anyVisible = true;
            });
            section.hidden = !anyVisible;
        });
    }

    input.addEventListener('input', applyFilter);

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            input.value = '';
            applyFilter();
            input.blur();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== '/') return;
        const target = event.target;
        const isTyping = target instanceof HTMLElement
            && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        if (isTyping) return;
        event.preventDefault();
        input.focus();
        input.select();
    });
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
    for (const row of commandRows(config)) {
        if (!groups.has(row.group)) groups.set(row.group, []);
        groups.get(row.group).push(row);
    }

    const container = document.getElementById('tree');
    container.innerHTML = '';
    for (const [group, rows] of groups) {
        const section = document.createElement('section');
        section.className = 'group';

        const title = document.createElement('h2');
        title.className = 'group-title';
        title.textContent = group;
        section.appendChild(title);

        const scroll = document.createElement('div');
        scroll.className = 'table-scroll';

        const table = document.createElement('table');
        table.className = 'cmd-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th class="cmd">Command</th>
                    <th class="desc">Description</th>
                </tr>
            </thead>
        `;
        for (const row of rows) {
            table.appendChild(renderRow(row));
        }
        scroll.appendChild(table);
        section.appendChild(scroll);

        container.appendChild(section);
    }

    document.getElementById('menubar').hidden = false;
    document.getElementById('help').hidden = false;
    setupTryBar(config);
    setupCommandSearch();
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
