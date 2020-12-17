import * as PIXI from './pixi.mjs';
import * as PIXITEXTINPUT from './PIXI.TextInput.js';

export class LobbyUI extends PIXI.Container {
  constructor(websocket) {
    super()

    const titleText = new PIXI.Text('The Game\'s Lobby');
    this.addChild(titleText);
    titleText.x = 50;
    titleText.y = 100;

    this.tokenText = new PIXITEXTINPUT.TextInput({
      input: {fontSize: '25px'},
      box: {fill: 0xEEEEEE}
    })
    this.tokenText.x = 50
    this.tokenText.y = 150
    //this.tokenText.disabled = true;
    this.addChild(this.tokenText)

    this.playerStatesText = new PIXI.Text('');
    this.addChild(this.playerStatesText);
    this.playerStatesText.x = 50;
    this.playerStatesText.y = 200;


    const readyButton = new PIXI.Text('Ready');
    this.addChild(readyButton);
    readyButton.x = 50;
    readyButton.y = 400;

    readyButton.interactive = true;
    readyButton.buttonMode = true;

    var self = this;
    console.debug(self)
    readyButton.on('pointerdown', onReadyButtonClick);
    function onReadyButtonClick() {
      console.debug(self.gameToken)
      var text = JSON.stringify(
        {
          "gameToken": self.gameToken,
          "playerToken": self.playerToken,
          "actionId": "start",
          "playerName": self.playerName,
          "cardId": "",
        }
      )
      console.debug(text)
      websocket.send(text);
    }

    this.visible = false
    this.targetVisible = false
  }

  parseGameState(gameState) {

    // Main switch animation
    var visibleBefore = this.targetVisible;
    this.targetVisible = gameState.gameState?.readyEvent?.name === "lobby";

    if (visibleBefore != this.targetVisible) {
      if (this.tween)
        this.tween.stop()

      const coords = {scale: visibleBefore ? 1 : 0}

      var self = this;
      this.tween = new TWEEN.Tween(coords)
        .to({scale: this.targetVisible ? 1 : 0}, 750)
        .easing(TWEEN.Easing.Quadratic.In)
        .onUpdate(() => {
          self.scale.x = coords.scale;
          self.scale.y = coords.scale;
        })
        .onStart(()=>{
          if (this.targetVisible)
            self.visible = true
        })
        .onComplete(()=>{
          if (!this.targetVisible)
            self.visible = false
        })
        .start()
    }

    if (!this.targetVisible)
      return

    this.playerName = gameState.gameState.playerName;
    this.playerToken = gameState.gameState.playerToken;
    this.gameToken = gameState.gameState.gameToken;

    this.tokenText.text = gameState.gameState.gameToken;

    this.playerStatesText.text = "";
    for (const [playerId, playerName] of Object.entries(gameState.gameState.playerNames)) {
      this.playerStatesText.text += playerName
      this.playerStatesText.text += " " + (gameState.gameState.readyEvent.ready.includes(parseInt(playerId)) ? "ready" : "not ready")
      this.playerStatesText.text += "\n"
    }

  }


}