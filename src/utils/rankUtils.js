/**
 * Eco-Operator Ranking System
 * Tiers change every 3 levels.
 */

export const RANKINGS = [
    { tier: 1, minLevel: 1, maxLevel: 3, name: "Carbon Cadet", color: "text-gray-400", glow: "shadow-gray-500/20" },
    { tier: 2, minLevel: 4, maxLevel: 6, name: "Bin Camper", color: "text-blue-400", glow: "shadow-blue-500/20" },
    { tier: 3, minLevel: 7, maxLevel: 9, name: "Garden Grunt", color: "text-green-500", glow: "shadow-green-500/20" },
    { tier: 4, minLevel: 10, maxLevel: 12, name: "Compost Commando", color: "text-emerald-400", glow: "shadow-emerald-500/20" },
    { tier: 5, minLevel: 13, maxLevel: 15, name: "Recycle Recon", color: "text-cyan-400", glow: "shadow-cyan-500/20" },
    { tier: 6, minLevel: 16, maxLevel: 18, name: "Guerrilla Gardener", color: "text-lime-400", glow: "shadow-lime-500/20" },
    { tier: 7, minLevel: 19, maxLevel: 21, name: "Solar Sniper", color: "text-yellow-400", glow: "shadow-yellow-500/20" },
    { tier: 8, minLevel: 22, maxLevel: 24, name: "Apex Pollinator", color: "text-orange-500", glow: "shadow-orange-500/20" },
    { tier: 9, minLevel: 25, maxLevel: 27, name: "Terraform Titan", color: "text-purple-500", glow: "shadow-purple-500/20" },
    { tier: 10, minLevel: 28, maxLevel: 1000, name: "Ghost of Gaia", color: "text-nana-green", glow: "shadow-nana-green/40" },
];

export const getRankData = (level) => {
    const rank = RANKINGS.find(r => level >= r.minLevel && level <= r.maxLevel);
    return rank || RANKINGS[0];
};

export const getRankName = (level) => getRankData(level).name;
