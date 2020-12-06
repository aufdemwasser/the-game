
class WelcomeUI extends PIXI.Container {
  constructor() {
    super()

    const titleText = new PIXI.Text('The Game');
    this.addChild(titleText);
    titleText.x = 50;
    titleText.y = 100;

    const joinButton = new PIXI.Text('Host New Game');
    this.addChild(joinButton);
    joinButton.x = 50;
    joinButton.y = 200;

    joinButton.interactive = true;
    joinButton.buttonMode = true;
    joinButton.on('pointerdown', onJoinButtonClick);
    function onJoinButtonClick() {

    }
  }

  parseGameState(gameState) {
    this.visible = gameState.state == "welcome";
    if (!this.visible)
      return

  }
}
