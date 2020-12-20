import * as PIXI from './pixi.mjs';

export class Styles {
  static headingStyle = new PIXI.TextStyle({
    dropShadow: true,
    dropShadowAlpha: 0.7,
    dropShadowBlur: 5,
    dropShadowColor: "#eaeaea",
    fill: "white",
    fontFamily: "Arial Black",
    fontSize: 50
  });
  static buttonStyle = new PIXI.TextStyle({
    dropShadow: true,
    dropShadowAlpha: 0.7,
    dropShadowBlur: 5,
    dropShadowColor: "#eaeaea",
    fill: "white",
    fontFamily: "Arial Black"
  });
  static infoStyle = new PIXI.TextStyle({
    dropShadow: true,
    dropShadowAlpha: 0.7,
    dropShadowBlur: 5,
    dropShadowColor: "#eaeaea",
    fill: "white",
    fontFamily: "Arial Black"
  });
  static popupTint = "0x222222"
}
