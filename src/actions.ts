import {
  Absolute,
  Card,
  Coordinate,
  Game,
  LobbyState,
  PlayerLobby,
} from './interfaces'
import { Cards } from './data/cards'
import { InitialBoard } from './data/board'
import { clone } from './helpers/clone'
import { possibleMoves, doesCardHaveMove } from './helpers/moves'
import { equalCoordinates } from './helpers/coordinates'
import { shuffle } from './helpers/shuffle'

export function makeMove(
  game: Game,
  origin: Coordinate<Absolute>,
  target: Coordinate<Absolute>,
  card?: Card
): Game | 'specify-card' {
  let nextGame = clone(game)

  // Find all our possible moves, we will use this to see if it is valid
  // or needs more information from the player
  const possibleMoveOptions = possibleMoves(nextGame, origin).filter(c =>
    equalCoordinates(c, target)
  )

  // If there are multiple cards that get us to our target
  if (possibleMoveOptions.length > 1 && !card) return 'specify-card'

  // Swap the card that was used for the next card
  if (possibleMoveOptions.length > 1 && card) {
    const cardIndex = nextGame.players[0].cards[0].name === card.name ? 0 : 1
    nextGame.players[0].cards[cardIndex] = nextGame.card
    nextGame.card = card
  } else if (
    doesCardHaveMove(nextGame, origin, target, nextGame.players[0].cards[0])
  ) {
    nextGame.card = game.players[0].cards[0]
    nextGame.players[0].cards[0] = game.card
  } else {
    nextGame.card = game.players[0].cards[1]
    nextGame.players[0].cards[1] = game.card
  }

  nextGame.lastMove = { origin, target }

  // Move the piece
  nextGame.board[target[0]][target[1]] = game.board[origin[0]][origin[1]]
  nextGame.board[origin[0]][origin[1]] = false

  // Rotate the players
  nextGame.players = [nextGame.players[1], nextGame.players[0]]

  return nextGame
}

export function makeGame(
  players: [PlayerLobby, PlayerLobby],
  initialCards?: LobbyState['cards']
): Game {
  let cards = shuffle(
    (initialCards || ([] as Card[])).concat(shuffle(Cards)).slice(0, 5)
  )

  const shuffledPlayers = shuffle(players)

  return {
    card: cards[0],
    players: [
      {
        cards: [cards[1], cards[2]],
        color: 'blue',
        id: shuffledPlayers[0].id,
        name: shuffledPlayers[0].name,
      },
      {
        cards: [cards[3], cards[4]],
        color: 'red',
        id: shuffledPlayers[1].id,
        name: shuffledPlayers[1].name,
      },
    ],
    board: InitialBoard,
    lastMove: null,
  }
}
