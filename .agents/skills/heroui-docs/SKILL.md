---
name: heroui-docs
description: Use when asked to create or modify UI, layout, or components to get correct HeroUI imports and component props.
---
<page url="/en/docs/react/getting-started/agents-md">
# AGENTS.md

**Category**: react
**URL**: https://www.heroui.com/en/docs/react/getting-started/agents-md
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/react/getting-started/(ui-for-agents)/agents-md.mdx
> Download HeroUI v3 React documentation for AI coding agents


***

Download HeroUI v3 React documentation directly into your project for AI assistants to reference.

<Callout>
  **Note:** The `agents-md` command is specifically for HeroUI React v3. Other CLI commands (like `add`, `init`, `upgrade`, etc.) are for HeroUI v2 (for now).
</Callout>

<DocsImage
  src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/agents-md.jpg"
  darkSrc="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/agents-md-dark.jpg"
  alt="HeroUI React v3 AGENTS.md"
/>

### Usage

```bash
npx heroui-cli@latest agents-md --react

```

Or specify output file:

```bash
npx heroui-cli@latest agents-md --react --output AGENTS.md

```

### What It Does

- Downloads latest HeroUI v3 React docs to `.heroui-docs/react/`
- Generates an index in `AGENTS.md` or `CLAUDE.md`
- Includes demo files for code examples
- Adds `.heroui-docs/` to `.gitignore` automatically

### Options

- `--react` - Download React docs only
- `--output <files...>` - Target file(s) (e.g., `AGENTS.md` or `AGENTS.md CLAUDE.md`)
- `--ssh` - Use SSH for git clone

### Requirements

- Tailwind CSS >= v4
- React >= 19.0.0
- `@heroui/react >= 3.0.0` or `@latest`

### Related Documentation

- [AGENTS.md](https://agents.md/) - Learn about the AGENTS.md format for coding agents
- [CLAUDE.md](https://code.claude.com/docs/en/best-practices#write-an-effective-claude-md) - Claude equivalent of AGENTS.md
- [AGENTS.md vs Skills](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) - AGENTS.md performance
</page>