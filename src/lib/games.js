export const GAMES = [
  { id: 'valorant', name: 'Valorant', icon: '🎯' },
  { id: 'league-of-legends', name: 'League of Legends', icon: '⚔️' },
  { id: 'fortnite', name: 'Fortnite', icon: '🏗️' },
  { id: 'minecraft', name: 'Minecraft', icon: '⛏️' },
  { id: 'cs2', name: 'CS2', icon: '🔫' },
  { id: 'rocket-league', name: 'Rocket League', icon: '🚗' },
  { id: 'gta-v', name: 'GTA V', icon: '🚙' },
  { id: 'call-of-duty', name: 'Call of Duty', icon: '🎖️' },
  { id: 'roblox', name: 'Roblox', icon: '🧱' },
  { id: 'rust', name: 'Rust', icon: '🔧' },
  { id: 'dota2', name: 'Dota 2', icon: '🗡️' },
  { id: 'warzone', name: 'Warzone', icon: '🏅' },
  { id: 'halo-infinite', name: 'Halo Infinite', icon: '🪐' },
  { id: 'marvel-rivals', name: 'Marvel Rivals', icon: '🦸' },
  { id: 'wow', name: 'World of Warcraft', icon: '🐉' },
  { id: 'other', name: 'Otro juego', icon: '🎮' },
]

export function getGame(id) {
  return GAMES.find(g => g.id === id) || { id, name: id, icon: '🎮' }
}
