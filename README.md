# conas-public

A public collection of tools, plugins, and interfaces crafted by **CONAS**.
Everything here is free to explore; each project carries its own usage terms.

## Contents

| Name | Type | Description |
| --- | --- | --- |
| [prompt-kit](./plugins/prompt-kit) | Claude plugin | Encourages Claude to plan with you before it builds. Includes a prompt widget, planning mode, and a build signal. *(Korean)* |

## Claude plugins

This repository doubles as a Claude plugin marketplace. To install a plugin:

- **Desktop app**: **+** → **Plugins** → **Add marketplace** → `conascode/conas-public` → **Add plugin**, then choose the plugin.
- **Terminal (Claude Code)**:
  ```
  /plugin install <plugin-name> --marketplace conascode/conas-public
  ```

Refer to each plugin's own README for details.

## Repository layout

```
conas-public/
├─ .claude-plugin/marketplace.json   Plugin marketplace index
└─ plugins/                          Claude plugins
   └─ prompt-kit/
```

## Usage terms

Each project defines its own terms in its folder (see the `LICENSE` file within it).
These projects are independent work by CONAS and are not affiliated with or endorsed by Anthropic.

---

**CONAS is apocryphal and actual.**
/만들어 CONAS
