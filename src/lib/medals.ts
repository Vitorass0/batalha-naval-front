/**
 * Medal System Configuration
 * 
 * Defines all available medals and their unlock criteria.
 */
import { Medal } from '@/components/profile/MedalBadge';
import { User } from '@/types/api-responses';

/**
 * Medal definitions with unlock criteria
 */
export const MEDAL_DEFINITIONS = [
  {
    id: 'first-win',
    name: 'Primeira Vitória',
    description: 'Vença sua primeira batalha naval',
    icon: '🏆',
    requirement: 'Vencer 1 partida',
    checkUnlocked: (user: User) => user.wins >= 1,
    getProgress: (user: User) => ({ current: user.wins, max: 1 }),
  },
  {
    id: 'veteran',
    name: 'Veterano',
    description: 'Participe de 10 batalhas',
    icon: '🎮',
    requirement: 'Jogar 10 partidas',
    checkUnlocked: (user: User) => user.gamesPlayed >= 10,
    getProgress: (user: User) => ({ current: user.gamesPlayed, max: 10 }),
  },
  {
    id: 'five-wins',
    name: 'Comandante',
    description: 'Alcance 5 vitórias',
    icon: '⭐',
    requirement: 'Vencer 5 partidas',
    checkUnlocked: (user: User) => user.wins >= 5,
    getProgress: (user: User) => ({ current: user.wins, max: 5 }),
  },
  {
    id: 'ten-wins',
    name: 'Capitão de Mar e Guerra',
    description: 'Conquiste 10 vitórias',
    icon: '💎',
    requirement: 'Vencer 10 partidas',
    checkUnlocked: (user: User) => user.wins >= 10,
    getProgress: (user: User) => ({ current: user.wins, max: 10 }),
  },
  {
    id: 'champion',
    name: 'Almirante',
    description: 'Vença 25 batalhas e prove sua superioridade',
    icon: '👑',
    requirement: 'Vencer 25 partidas',
    checkUnlocked: (user: User) => user.wins >= 25,
    getProgress: (user: User) => ({ current: user.wins, max: 25 }),
  },
  {
    id: 'legend',
    name: 'Lenda dos Mares',
    description: 'Alcance o ápice com 50 vitórias',
    icon: '🌟',
    requirement: 'Vencer 50 partidas',
    checkUnlocked: (user: User) => user.wins >= 50,
    getProgress: (user: User) => ({ current: user.wins, max: 50 }),
  },
  {
    id: 'perfect-record',
    name: 'Invencível',
    description: 'Mantenha 100% de vitórias com pelo menos 5 jogos',
    icon: '🛡️',
    requirement: '5+ jogos sem derrotas',
    checkUnlocked: (user: User) => user.gamesPlayed >= 5 && user.losses === 0,
    getProgress: (user: User) => ({ 
      current: user.losses === 0 ? user.gamesPlayed : 0, 
      max: 5 
    }),
  },
  {
    id: 'persistent',
    name: 'Persistente',
    description: 'Continue lutando mesmo após 10 derrotas',
    icon: '💪',
    requirement: 'Sofrer 10 derrotas',
    checkUnlocked: (user: User) => user.losses >= 10,
    getProgress: (user: User) => ({ current: user.losses, max: 10 }),
  },
  {
    id: 'high-win-rate',
    name: 'Estrategista',
    description: 'Mantenha uma taxa de vitória acima de 70% com 10+ jogos',
    icon: '🧠',
    requirement: '70%+ de vitórias (mín. 10 jogos)',
    checkUnlocked: (user: User) => {
      if (user.gamesPlayed < 10) return false;
      return (user.wins / user.gamesPlayed) >= 0.7;
    },
    getProgress: (user: User) => ({ 
      current: Math.min(user.gamesPlayed, 10), 
      max: 10 
    }),
  },
  {
    id: 'centurion',
    name: 'Centurião',
    description: 'Participe de 100 batalhas épicas',
    icon: '🎖️',
    requirement: 'Jogar 100 partidas',
    checkUnlocked: (user: User) => user.gamesPlayed >= 100,
    getProgress: (user: User) => ({ current: user.gamesPlayed, max: 100 }),
  },
  {
    id: 'comeback-king',
    name: 'Rei do Comeback',
    description: 'Vença após ter perdido os 3 primeiros navios',
    icon: '🔥',
    requirement: 'Vencer uma partida difícil',
    checkUnlocked: () => false, // Requires match-specific data
    getProgress: () => ({ current: 0, max: 1 }),
  },
  {
    id: 'sharpshooter',
    name: 'Atirador de Elite',
    description: 'Vença com 80%+ de acertos',
    icon: '🎯',
    requirement: 'Taxa de acerto de 80% em uma vitória',
    checkUnlocked: () => false, // Requires match-specific data
    getProgress: () => ({ current: 0, max: 1 }),
  },
];

/**
 * Generate medal instances for a user
 * 
 * @param user - User profile data
 * @returns Array of medals with unlocked states
 */
export const getUserMedals = (user: User): Medal[] => {
  return MEDAL_DEFINITIONS.map((def) => {
    const unlocked = def.checkUnlocked(user);
    const progress = def.getProgress(user);

    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      requirement: def.requirement,
      unlocked,
      progress: progress.current,
      maxProgress: progress.max,
    };
  });
};

/**
 * Calculate total unlocked medals
 * 
 * @param medals - Array of medals
 * @returns Number of unlocked medals
 */
export const getUnlockedMedalCount = (medals: Medal[]): number => {
  return medals.filter((m) => m.unlocked).length;
};

/**
 * Get medals sorted by unlock status (unlocked first)
 * 
 * @param medals - Array of medals
 * @returns Sorted array with unlocked medals first
 */
export const sortMedalsByStatus = (medals: Medal[]): Medal[] => {
  return [...medals].sort((a, b) => {
    if (a.unlocked === b.unlocked) return 0;
    return a.unlocked ? -1 : 1;
  });
};
