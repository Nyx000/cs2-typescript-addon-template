# CS2 TypeScript Addon Template

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![CS2](https://img.shields.io/badge/CS2-Workshop%20Tools-orange.svg)](https://developer.valvesoftware.com/wiki/Counter-Strike_2_Workshop_Tools)

A modern, production-ready template for creating Counter-Strike 2 addons with TypeScript. This template provides a complete development environment with hot reload support, comprehensive type definitions, and best practices for CS2 scripting.

## 🎯 Features

- ✅ **Full TypeScript Support** - Type-safe CS2 scripting with comprehensive type definitions
- 🔥 **Hot Reload** - Update scripts without restarting CS2 (requires `-tools` flag)
- 🏗️ **Multi-Root Workspace** - Organized project structure optimized for development
- 📦 **Modern Tooling** - ESLint, Prettier, and TypeScript configured out of the box
- 📚 **Example Code** - Working examples demonstrating key CS2 scripting patterns
- 🤖 **AI-Friendly** - Includes LLM instructions for AI-assisted development
- 🔄 **Watch Mode** - Automatic compilation on file save

## 📋 Prerequisites

### Required

- **Node.js** v18 or higher
- **Counter-Strike 2** installed via Steam
- **CS2 Workshop Tools** (free DLC on Steam)

### Recommended

- **VS Code** or **Cursor IDE** for the best development experience
- Basic TypeScript knowledge

## 🚀 Quick Start

### 1. Clone or Download This Template

```bash
git clone https://github.com/YOUR_USERNAME/cs2-typescript-addon-template.git my-cs2-addon
cd my-cs2-addon
```

Or click "Use this template" on GitHub to create your own repository.

### 2. Setup Node.js (First Time Only)

#### Windows / macOS / Linux (Standard)

Download and install from [nodejs.org](https://nodejs.org/) (LTS version recommended)

#### WSL / Linux (Using nvm - Recommended)

If you don't have Node.js installed:

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell configuration
source ~/.bashrc

# Install Node.js LTS
nvm install 20
nvm use 20

# Verify installation
node --version
npm --version
```

### 3. Install Dependencies

```bash
cd dev
npm install
```

### 4. Start Development

```bash
# Watch mode - automatically compiles on save
npm run dev

# Or one-time build
npm run build

# Format code with Prettier
npm run format

# Lint code with ESLint
npm run lint
```

This will compile TypeScript files from `dev/src/scripts/` to JavaScript in the `scripts/` folder.

### 5. Open the Workspace

**From Command Line:**

```bash
# With VS Code
code ts_addon_template.code-workspace

# With Cursor
cursor ts_addon_template.code-workspace
```

**From File Explorer:**
Double-click `ts_addon_template.code-workspace`

### 6. Test in CS2

1. Copy this addon folder to your CS2 content directory:

   ```text
   C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\content\csgo_addons\
   ```

2. Open your map in Hammer Editor

3. Add a `point_script` entity:

   - **Entity Name:** `my_script`
   - **Script File:** `scripts/example.js`

4. Launch CS2 with tools mode:

   ```batch
   cs2.exe -tools +map your_map_name
   ```

## 📁 Project Structure

```text
ts_addon_template/
├── dev/                          # Development source code
│   ├── src/
│   │   ├── scripts/              # TypeScript scripts (EDIT HERE)
│   │   │   └── example.ts        # Example script with comments
│   │   └── types/
│   │       └── cs_script.d.ts    # Official CS2 API type definitions
│   ├── package.json              # Node.js dependencies
│   └── tsconfig.json             # TypeScript configuration
├── scripts/                      # Compiled JavaScript (auto-generated)
├── maps/                         # Your .vmap files
├── .cursor/
│   └── rules/
│       └── cs2-dev.mdc           # Cursor IDE rules for AI assistance
├── LLM_INSTRUCTIONS.txt          # Instructions for AI code assistants
├── ts_addon_template.code-workspace  # Multi-root workspace config
├── README.md                     # This file
├── LICENSE                       # MIT License
└── .gitignore                    # Git ignore patterns
```

## 🛠️ Development Workflow

### Writing Scripts

1. Create or edit TypeScript files in `dev/src/scripts/`
2. Use imports from `"cs_script/point_script"` for CS2 API
3. Full IntelliSense and type checking available

**Example:**

```typescript
import { Instance, CSPlayerController } from "cs_script/point_script";

Instance.OnPlayerActivate((player: CSPlayerController) => {
  const pawn = player.GetPlayerPawn();
  if (pawn && pawn.IsValid()) {
    pawn.GiveNamedItem("weapon_ak47", true);
    Instance.Msg(`${player.GetPlayerName()} spawned with AK-47!`);
  }
});
```

### Building

```bash
# One-time build
npm run build

# Watch mode (recommended)
npm run dev

# Clean compiled files
npm run clean
```

### Hot Reload Workflow

When running CS2 with `-tools`:

1. Edit your TypeScript file
2. Save (auto-compiles if watch mode is running)
3. CS2 automatically reloads the script
4. State is preserved via `OnBeforeReload`/`OnReload` callbacks

**Example State Persistence:**

```typescript
let playerScores: Record<number, number> = {};

Instance.OnBeforeReload(() => {
  return { scores: playerScores }; // Save state
});

Instance.OnReload((memory) => {
  if (memory) {
    playerScores = memory.scores; // Restore state
  }
});
```

## 📚 Key CS2 Scripting Concepts

### Event Handlers (Sept 24, 2025 API)

| Event                | When It Fires      | Use Case                           |
| -------------------- | ------------------ | ---------------------------------- |
| `OnActivate`         | Script first loads | Initialize variables, server setup |
| `OnPlayerConnect`    | Player connects    | Track connections                  |
| `OnPlayerActivate`   | Player spawns      | Give weapons, set team, teleport   |
| `OnPlayerDisconnect` | Player leaves      | Clean up player data               |
| `OnRoundStart`       | Round begins       | Reset game state                   |
| `OnRoundEnd`         | Round ends         | Calculate scores, display results  |
| `OnPlayerKill`       | Player dies        | Award points, track stats          |
| `OnPlayerChat`       | Player sends chat  | Chat commands, filters             |
| `OnGunFire`          | Weapon fired       | Track shots, ammo management       |
| `OnGrenadeThrow`     | Grenade thrown     | Custom grenade mechanics           |

### Critical Rules

#### ❌ NEVER

- Store entity references directly (they become invalid on hot reload)
- Use `OnGameEvent` (removed in Sept 2025 update)
- Assume entities stay valid across ticks
- Forget to clear `SetNextThink` in `OnBeforeReload`
- Reference `.ts` files in Hammer (always use `.js`)

#### ✅ ALWAYS

- Store entity names as strings, refetch with `FindEntityByName`
- Check `entity.IsValid()` before every operation
- Use specific event handlers instead of generic events
- Clear think loops: `Instance.SetNextThink(-1)` before reload
- Reference compiled `.js` files in Hammer

### Entity Validation Pattern

```typescript
// ❌ WRONG - can crash if entity removed
const door = Instance.FindEntityByName("door");
door.Kill(); // May crash if door was removed

// ✅ CORRECT
const door = Instance.FindEntityByName("door");
if (door && door.IsValid()) {
  door.Kill();
}
```

### State Persistence Pattern

```typescript
let entityNames: string[] = []; // Store names, not entities

Instance.OnActivate(() => {
  // Refetch entities by name on activation
  entityNames.forEach((name) => {
    const entity = Instance.FindEntityByName(name);
    if (entity && entity.IsValid()) {
      // Use entity
    }
  });
});

Instance.OnBeforeReload(() => {
  Instance.SetNextThink(-1); // Clear think loops
  return { names: entityNames }; // Save state
});

Instance.OnReload((memory) => {
  if (memory) {
    entityNames = memory.names; // Restore state
  }
});
```

## 🎨 VS Code / Cursor Features

This template is optimized for VS Code and Cursor IDE:

### Pre-configured Settings

- ✅ Auto-format on save (Prettier)
- ✅ TypeScript IntelliSense
- ✅ Organize imports on save
- ✅ File type associations (`.vscript` → JavaScript)
- ✅ Optimized search (excludes `node_modules`)

### Build Tasks

- Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac)
- Select "Build TypeScript" or "Watch TypeScript"

### Recommended Extensions

The workspace will prompt you to install:

- **Prettier** - Code formatting
- **ESLint** - TypeScript linting
- **Error Lens** - Inline error display

### AI Assistance (Cursor IDE)

- The `.cursor/rules/cs2-dev.mdc` file provides AI context for Cursor IDE
- Multi-root workspace gives AI full project context
- Type definitions provide excellent context for autocomplete and AI assistance

The AI will understand:

- CS2 API patterns and best practices
- Hot reload state management
- Entity validation requirements
- Event handler usage

## 📖 Example Use Cases

### Custom Game Mode

```typescript
let roundWinner: number | null = null;

Instance.OnRoundEnd((winningTeam: number) => {
  roundWinner = winningTeam;
  const teamName = winningTeam === 2 ? "Terrorists" : "Counter-Terrorists";
  Instance.Msg(`Round won by ${teamName}!`);
});

Instance.OnRoundStart(() => {
  if (roundWinner === 2) {
    // Give T-side bonus
  }
});
```

### Chat Commands

```typescript
Instance.OnPlayerChat(
  (speaker: CSPlayerController, team: number, text: string) => {
    if (text === "!hp") {
      const pawn = speaker.GetPlayerPawn();
      if (pawn && pawn.IsValid()) {
        Instance.Msg(`${speaker.GetPlayerName()} HP: ${pawn.GetHealth()}`);
      }
    }
  }
);
```

### Spawn Management

```typescript
const spawnPoints = ["spawn_1", "spawn_2", "spawn_3"];

Instance.OnPlayerActivate((player: CSPlayerController) => {
  const pawn = player.GetPlayerPawn();
  if (pawn && pawn.IsValid()) {
    // Random spawn
    const spawnName =
      spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    const spawn = Instance.FindEntityByName(spawnName);
    if (spawn && spawn.IsValid()) {
      pawn.Teleport(spawn.GetAbsOrigin(), spawn.GetAbsAngles(), null);
    }
  }
});
```

## 🐛 Troubleshooting

### TypeScript not compiling?

```bash
cd dev
npm run build
# Check for errors in terminal
```

### CS2 not detecting script changes?

- Ensure you're running CS2 with `-tools` flag
- Check that `.js` files exist in `scripts/` folder
- Verify `point_script` entity has correct path: `scripts/your_script.js`
- Try `script_reload` console command

### IntelliSense not working?

- Make sure you opened the `.code-workspace` file, not just the folder
- Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- Check `tsconfig.json` paths are correct

### Hot reload losing state?

- Implement `OnBeforeReload` to save state
- Implement `OnReload` to restore state
- Don't store entity references - store entity names

## 📝 Customization

### Rename Your Addon

1. Rename folder from `ts_addon_template` to `your_addon_name`
2. Update `package.json` name field
3. Update workspace file name and folder paths
4. Update README.md

### Add More Scripts

1. Create new `.ts` file in `dev/src/scripts/`
2. Import CS2 API: `import { Instance } from "cs_script/point_script";`
3. Compile with `npm run build`
4. Add `point_script` entity in Hammer with new script path

## 🤝 Contributing

Contributions welcome! Please:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

Free to use, modify, and distribute for any purpose.

## 🔗 Resources

### Official Documentation

- [CS2 Workshop Tools Wiki](https://developer.valvesoftware.com/wiki/Counter-Strike_2_Workshop_Tools)
- [Scripting API Reference](https://developer.valvesoftware.com/wiki/Counter-Strike_2_Workshop_Tools/Scripting_API)

### This Template

- [Type Definitions](dev/src/types/cs_script.d.ts) - Full CS2 API with comments
- [Example Script](dev/src/scripts/example.ts) - Comprehensive example
- [Cursor Rules](.cursor/rules/cs2-dev.mdc) - AI development guidelines

### Community

- CS2 Modding Discord - Share your projects (link TBD)
- Steam Workshop - Publish your addons (link TBD)

## 🎉 Getting Started

1. ✅ Clone/download this template
2. ✅ Run `npm install` in `dev/` folder
3. ✅ Start watch mode: `npm run dev`
4. ✅ Edit `dev/src/scripts/example.ts`
5. ✅ Open workspace file in VS Code/Cursor
6. ✅ Create your map in Hammer
7. ✅ Add `point_script` entity
8. ✅ Launch CS2 with `-tools +map your_map`
9. ✅ Start coding!

---

### Happy scripting! 🚀

Made with ❤️ for the CS2 modding community
