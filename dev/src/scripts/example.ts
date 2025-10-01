/**
 * Example CS2 TypeScript Script
 * 
 * This example demonstrates the core features of CS2 scripting:
 * - Hot reload state persistence
 * - Player event handling
 * - Round management
 * - Entity validation
 * - Server commands
 * 
 * To use this script:
 * 1. Compile: npm run build
 * 2. In Hammer, add a point_script entity
 * 3. Set Script File to: scripts/example.js
 * 4. Launch CS2 with: cs2.exe -tools +map your_map
 */

import { CSPlayerController, CSPlayerPawn, Instance } from "cs_script/point_script";

// State that persists across hot reloads
let playerScores: Record<number, number> = {};
let roundNumber = 0;

/**
 * Initialize on first script activation
 * This runs ONCE when the map loads
 */
Instance.OnActivate(() => {
    Instance.Msg("🎮 Example script activated!");
    
    // Configure server for testing
    Instance.ServerCommand("mp_warmup_offline_enabled 1");
    Instance.ServerCommand("mp_warmup_pausetimer 1");
    Instance.ServerCommand("mp_roundtime 10");
});

/**
 * Save state before hot reload (requires -tools flag)
 * This preserves your data when you edit and recompile the script
 */
Instance.OnBeforeReload(() => {
    Instance.Msg("💾 Saving state before reload...");
    return {
        scores: playerScores,
        round: roundNumber
    };
});

/**
 * Restore state after hot reload (requires -tools flag)
 * This retrieves your saved data after recompilation
 */
Instance.OnReload((memory) => {
    if (memory) {
        playerScores = memory.scores || {};
        roundNumber = memory.round || 0;
        Instance.Msg(`🔄 Hot reload complete! Round ${roundNumber}, ${Object.keys(playerScores).length} players tracked`);
    }
});

/**
 * Player connects to server
 */
Instance.OnPlayerConnect((player: CSPlayerController) => {
    const name = player.GetPlayerName();
    Instance.Msg(`👋 ${name} connected to server`);
});

/**
 * Player spawns in game
 * This is where you typically set up the player's initial state
 */
Instance.OnPlayerActivate((player: CSPlayerController) => {
    if (!player.IsValid()) return;
    
    const slot = player.GetPlayerSlot();
    const name = player.GetPlayerName();
    
    // Initialize score if first time
    if (!(slot in playerScores)) {
        playerScores[slot] = 0;
    }
    
    Instance.Msg(`✨ ${name} spawned! Current score: ${playerScores[slot]}`);
    
    // Auto-join Terrorist team
    player.JoinTeam(2);
    
    // Get the player's pawn and give them equipment
    const pawn = player.GetPlayerPawn();
    if (pawn && pawn.IsValid()) {
        pawn.SetHealth(100);
        pawn.SetArmor(100);
        pawn.GiveNamedItem("weapon_ak47", true);
        pawn.GiveNamedItem("weapon_knife", false);
    }
});

/**
 * Player disconnects from server
 */
Instance.OnPlayerDisconnect((playerSlot: number) => {
    Instance.Msg(`👋 Player slot ${playerSlot} disconnected`);
    // Optionally clean up their score
    // delete playerScores[playerSlot];
});

/**
 * Round starts
 */
Instance.OnRoundStart(() => {
    roundNumber++;
    Instance.Msg(`🎯 Round ${roundNumber} started!`);
    
    // Example: Give bonus armor on round 3+
    if (roundNumber >= 3) {
        const players = Instance.FindEntitiesByClass("player");
        players.forEach((entity) => {
            const pawn = entity as CSPlayerPawn;
            if (pawn && pawn.IsValid()) {
                pawn.SetArmor(100);
                Instance.Msg("🛡️ Bonus armor awarded!");
            }
        });
    }
});

/**
 * Round ends
 */
Instance.OnRoundEnd((winningTeam: number) => {
    const teamName = winningTeam === 2 ? "Terrorists" : winningTeam === 3 ? "Counter-Terrorists" : "Unknown";
    Instance.Msg(`🏁 Round ${roundNumber} ended! Winner: ${teamName} (team ${winningTeam})`);
    
    // Display all scores
    Instance.Msg("📊 Current Scores:");
    Object.entries(playerScores).forEach(([slot, score]) => {
        const player = Instance.GetPlayerController(parseInt(slot));
        if (player && player.IsValid()) {
            Instance.Msg(`  ${player.GetPlayerName()}: ${score} points`);
        }
    });
});

/**
 * Player kills another player
 */
Instance.OnPlayerKill((victim: CSPlayerPawn, info: { weapon?: any, attacker?: any, inflictor?: any }) => {
    if (!victim || !victim.IsValid()) return;
    
    const victimController = victim.GetPlayerController();
    if (victimController && victimController.IsValid()) {
        Instance.Msg(`💀 ${victimController.GetPlayerName()} was killed`);
        
        // Award points to attacker if it's a player
        if (info.attacker && info.attacker.IsValid()) {
            const attackerController = info.attacker.GetPlayerController?.();
            if (attackerController && attackerController.IsValid()) {
                const attackerSlot = attackerController.GetPlayerSlot();
                playerScores[attackerSlot] = (playerScores[attackerSlot] || 0) + 1;
                attackerController.AddScore(1);
                Instance.Msg(`🎯 ${attackerController.GetPlayerName()} scored! Total: ${playerScores[attackerSlot]}`);
            }
        }
    }
});

/**
 * Player sends chat message
 */
Instance.OnPlayerChat((speaker: CSPlayerController, team: number, text: string) => {
    if (!speaker || !speaker.IsValid()) return;
    
    const name = speaker.GetPlayerName();
    const teamStr = team === 0 ? "[ALL]" : "[TEAM]";
    Instance.Msg(`💬 ${teamStr} ${name}: ${text}`);
    
    // Example: Chat commands
    if (text.startsWith("!score")) {
        const slot = speaker.GetPlayerSlot();
        Instance.Msg(`Your score: ${playerScores[slot] || 0}`);
    } else if (text.startsWith("!heal")) {
        const pawn = speaker.GetPlayerPawn();
        if (pawn && pawn.IsValid()) {
            pawn.SetHealth(100);
            Instance.Msg("🏥 Health restored!");
        }
    }
});

/**
 * Player fires a gun
 */
Instance.OnGunFire((weapon: any) => {
    if (!weapon || !weapon.IsValid()) return;
    
    // Example: Track shots fired
    // const weaponName = weapon.GetData().GetName();
    // Instance.Msg(`🔫 Weapon fired: ${weaponName}`);
});

/**
 * Player throws a grenade
 */
Instance.OnGrenadeThrow((weapon: any, projectile: any) => {
    if (!weapon || !weapon.IsValid()) return;
    
    const owner = weapon.GetOwner();
    if (owner && owner.IsValid()) {
        const controller = owner.GetPlayerController();
        if (controller && controller.IsValid()) {
            Instance.Msg(`💣 ${controller.GetPlayerName()} threw a grenade`);
        }
    }
});

/**
 * Handle input from Hammer entities
 * In Hammer: Create an entity that fires "RunScriptInput" with parameter "example_action"
 */
Instance.OnScriptInput("example_action", ({ caller, activator }) => {
    Instance.Msg("🎬 Script input triggered!");
    if (caller) {
        Instance.Msg(`  Caller: ${caller.GetEntityName()}`);
    }
    if (activator) {
        Instance.Msg(`  Activator: ${activator.GetEntityName()}`);
    }
});

// Example: Think loop for continuous updates
let thinkEnabled = true;

if (thinkEnabled) {
    Instance.SetThink(() => {
        // This runs every tick when enabled
        // Example: Display game time (only visible with -tools flag)
        const gameTime = Instance.GetGameTime().toFixed(1);
        Instance.DebugScreenText(
            `Game Time: ${gameTime}s | Round: ${roundNumber}`,
            10,
            10,
            0,
            { r: 255, g: 255, b: 0 }
        );
        
        // Schedule next think (1 second from now)
        Instance.SetNextThink(Instance.GetGameTime() + 1.0);
    });
    
    // Start the think loop
    Instance.SetNextThink(Instance.GetGameTime());
}

// CRITICAL: Clear think loop before hot reload to prevent issues
Instance.OnBeforeReload(() => {
    if (thinkEnabled) {
        Instance.SetNextThink(-1); // Stop thinking
    }
    return { scores: playerScores, round: roundNumber };
});

Instance.Msg("📜 Example script loaded successfully!");

