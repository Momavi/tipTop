interface Room {
  id: string;
  playersCount: number;
  maxPlayers: number;
}

interface Player {
  id: string;
  username: string;
  number?: number;
  answer?: string;
  isCaptain?: boolean;
}

interface GameAnswer {
  username: string;
  answer: string;
}

export type { Room, Player, GameAnswer }