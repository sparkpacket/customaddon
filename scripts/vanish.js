import { world, system, EntityQueryOptions, Player } from "@minecraft/server";

let vanishEnabled = false;
let collisionMode = "collide"; // collide, wall, all
let outlineEnabled = false;

function toggleVanish(player) {
    vanishEnabled = !vanishEnabled;
    
    if (vanishEnabled) {
        player.addEffect("invisibility", 999999, 1); // Vanilla invisibility effect
        hideItems(player);
    } else {
        player.removeEffect("invisibility");
        showItems(player);
    }
}

function hideItems(player) {
    // Hide held items using setVisualSlot or forcing empty hands
    player.getComponent("minecraft:inventory").container.clearAll();
}

function showItems(player) {
    // Restore items (you can store them in a temp array)
}

function toggleCollision() {
    if (collisionMode === "collide") collisionMode = "wall";
    else if (collisionMode === "wall") collisionMode = "all";
    else collisionMode = "collide";
}

function applyCollision(player) {
    switch (collisionMode) {
        case "collide":
            player.isCollidable = true;
            break;
        case "wall":
            player.isCollidable = false; // lets you pass walls but not floor
            break;
        case "all":
            player.isCollidable = false; // full noclip
            break;
    }
}

function toggleOutline(player) {
    outlineEnabled = !outlineEnabled;
    
    if (outlineEnabled) {
        spawnOutlineEntity(player);
    } else {
        removeOutlineEntity(player);
    }
}

function spawnOutlineEntity(player) {
    const pos = player.location;
    // Create an invisible armor stand or marker entity
    const entity = world.spawnEntity("armor_stand", pos);
    entity.setInvisible(true);
    entity.addTag("outline");
    // Add particles at entity to simulate outline
    system.runInterval(() => {
        if (!outlineEnabled) return;
        world.sendMessage(`outline particle at ${player.location.x}`);
    }, 5);
}

function removeOutlineEntity(player) {
    const outlineEntities = world.getEntities({ tags: ["outline"] });
    outlineEntities.forEach(e => e.kill());
}

// Example input binding (replace with actual keybind or command handling)
world.events.beforeChat.subscribe((event) => {
    const msg = event.message.toLowerCase();
    const player = event.sender;
    
    if (msg === "/vanish") toggleVanish(player);
    if (msg === "/collision") toggleCollision();
    if (msg === "/outline") toggleOutline(player);
});

system.runInterval(() => {
    const players = world.getPlayers();
    players.forEach(player => {
        if (vanishEnabled) player.isInvisible = true;
        applyCollision(player);
    });
}, 2);
