
const SERVER = {
    MESSAGE: {
        WAITING_FOR_USER: "WAITING_FOR_USER",
        READY_TO_START: "READY_TO_START",
        ROUND_LOST: "ROUND_LOST",
        ROUND_WON: "ROUND_WON",
        OPPONENT_LEFT: "OPPONENT_LEFT",  
        NO_ROOM_FOUND: "NO_ROOM_FOUND",
        OBSERVER_NEW_CONNECTION: 'OBSERVER_NEW_CONNECTION',
        OBSERVER_UPDATE_GAME: "OBSERVER_UPDATE_GAME",
    },
    CHAT: {
      NEW_CONNECTION: "NEW_CONNECTION",
    },
    PLAYER_TYPE: {
      HOST: 'HOST',
      OPPONENT: "OPPONENT",
      OBSERVER: "OBSERVER",
      PLAYER: "PLAYER"
    }

    
}

const CLIENT = {
  MESSAGE: {
      NEW_MESSAGE: "NEW_MESSAGE",
      USER_CONNECTED_TO_CHAT: "USER_CONNECTED_TO_CHAT"
  }
}


if (typeof module !== "undefined" && module.exports) {
    module.exports = exports = {     
      SERVER,
      CLIENT
    }
  }