"use strict";function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function _instanceof(t,e){return null!=e&&"undefined"!=typeof Symbol&&e[Symbol.hasInstance]?!!e[Symbol.hasInstance](t):t instanceof e}function _defineProperties(t,e){for(var i=0;i<e.length;i++){var s=e[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s)}}function _createClass(t,e,i){return e&&_defineProperties(t.prototype,e),i&&_defineProperties(t,i),t}function _inheritsLoose(t,e){t.prototype=Object.create(e.prototype),t.prototype.constructor=t,t.__proto__=e}!function(t){var e=t.PIXI,i=function(t){function i(e){var i;return(i=t.call(this)||this)._input_style=Object.assign({position:"absolute",background:"none",border:"none",outline:"none",transformOrigin:"0 0",lineHeight:"1"},e.input),e.box?i._box_generator="function"==typeof e.box?e.box:new s(e.box):i._box_generator=null,i._input_style.hasOwnProperty("multiline")?(i._multiline=!!i._input_style.multiline,delete i._input_style.multiline):i._multiline=!1,i._box_cache={},i._previous={},i._dom_added=!1,i._dom_visible=!0,i._placeholder="",i._placeholderColor=11119017,i._selection=[0,0],i._restrict_value="",i._createDOMInput(),i.substituteText=!0,i._setState("DEFAULT"),i._addListeners(),i}_inheritsLoose(i,t);var n=i.prototype;return n.focus=function(){this._substituted&&!this.dom_visible&&this._setDOMInputVisible(!0),this._dom_input.focus()},n.blur=function(){this._dom_input.blur()},n.select=function(){this.focus(),this._dom_input.select()},n.setInputStyle=function(t,e){this._input_style[t]=e,this._dom_input.style[t]=e,!this._substituted||"fontFamily"!==t&&"fontSize"!==t||this._updateFontMetrics(),this._last_renderer&&this._update()},n.destroy=function(e){this._destroyBoxCache(),t.prototype.destroy.call(this,e)},n._createDOMInput=function(){for(var t in this._multiline?(this._dom_input=document.createElement("textarea"),this._dom_input.style.resize="none"):(this._dom_input=document.createElement("input"),this._dom_input.type="text"),this._input_style)this._dom_input.style[t]=this._input_style[t]},n._addListeners=function(){this.on("added",this._onAdded.bind(this)),this.on("removed",this._onRemoved.bind(this)),this._dom_input.addEventListener("keydown",this._onInputKeyDown.bind(this)),this._dom_input.addEventListener("input",this._onInputInput.bind(this)),this._dom_input.addEventListener("keyup",this._onInputKeyUp.bind(this)),this._dom_input.addEventListener("focus",this._onFocused.bind(this)),this._dom_input.addEventListener("blur",this._onBlurred.bind(this))},n._onInputKeyDown=function(t){this._selection=[this._dom_input.selectionStart,this._dom_input.selectionEnd],this.emit("keydown",t.keyCode)},n._onInputInput=function(t){this._restrict_regex&&this._applyRestriction(),this._substituted&&this._updateSubstitution(),this.emit("input",this.text)},n._onInputKeyUp=function(t){this.emit("keyup",t.keyCode)},n._onFocused=function(){this._setState("FOCUSED"),this.emit("focus")},n._onBlurred=function(){this._setState("DEFAULT"),this.emit("blur")},n._onAdded=function(){document.body.appendChild(this._dom_input),this._dom_input.style.display="none",this._dom_added=!0},n._onRemoved=function(){document.body.removeChild(this._dom_input),this._dom_added=!1},n._setState=function(t){this.state=t,this._updateBox(),this._substituted&&this._updateSubstitution()},n.renderWebGL=function(e){t.prototype.renderWebGL.call(this,e),this._renderInternal(e)},n.renderCanvas=function(e){t.prototype.renderCanvas.call(this,e),this._renderInternal(e)},n.render=function(e){t.prototype.render.call(this,e),this._renderInternal(e)},n._renderInternal=function(t){this._resolution=t.resolution,this._last_renderer=t,this._canvas_bounds=this._getCanvasBounds(),this._needsUpdate()&&this._update()},n._update=function(){this._updateDOMInput(),this._substituted&&this._updateSurrogate(),this._updateBox()},n._updateBox=function(){this._box_generator&&(this._needsNewBoxCache()&&this._buildBoxCache(),this.state==this._previous.state&&this._box==this._box_cache[this.state]||(this._box&&this.removeChild(this._box),this._box=this._box_cache[this.state],this.addChildAt(this._box,0),this._previous.state=this.state))},n._updateSubstitution=function(){"FOCUSED"===this.state?(this._dom_visible=!0,this._surrogate.visible=0===this.text.length):(this._dom_visible=!1,this._surrogate.visible=!0),this._updateDOMInput(),this._updateSurrogate()},n._updateDOMInput=function(){this._canvas_bounds&&(this._dom_input.style.top=(this._canvas_bounds.top||0)+"px",this._dom_input.style.left=(this._canvas_bounds.left||0)+"px",this._dom_input.style.transform=this._pixiMatrixToCSS(this._getDOMRelativeWorldTransform()),this._dom_input.style.opacity=this.worldAlpha,this._setDOMInputVisible(this.worldVisible&&this._dom_visible),this._previous.canvas_bounds=this._canvas_bounds,this._previous.world_transform=this.worldTransform.clone(),this._previous.world_alpha=this.worldAlpha,this._previous.world_visible=this.worldVisible)},n._applyRestriction=function(){this._restrict_regex.test(this.text)?this._restrict_value=this.text:(this.text=this._restrict_value,this._dom_input.setSelectionRange(this._selection[0],this._selection[1]))},n._needsUpdate=function(){return!this._comparePixiMatrices(this.worldTransform,this._previous.world_transform)||!this._compareClientRects(this._canvas_bounds,this._previous.canvas_bounds)||this.worldAlpha!=this._previous.world_alpha||this.worldVisible!=this._previous.world_visible},n._needsNewBoxCache=function(){var t=this._getDOMInputBounds();return!this._previous.input_bounds||t.width!=this._previous.input_bounds.width||t.height!=this._previous.input_bounds.height},n._createSurrogate=function(){this._surrogate_hitbox=new e.Graphics,this._surrogate_hitbox.alpha=0,this._surrogate_hitbox.interactive=!0,this._surrogate_hitbox.cursor="text",this._surrogate_hitbox.on("pointerdown",this._onSurrogateFocus.bind(this)),this.addChild(this._surrogate_hitbox),this._surrogate_mask=new e.Graphics,this.addChild(this._surrogate_mask),this._surrogate=new e.Text("",{}),this.addChild(this._surrogate),this._surrogate.mask=this._surrogate_mask,this._updateFontMetrics(),this._updateSurrogate()},n._updateSurrogate=function(){var t=this._deriveSurrogatePadding(),e=this._getDOMInputBounds();switch(this._surrogate.style=this._deriveSurrogateStyle(),this._surrogate.style.padding=Math.max.apply(Math,t),this._surrogate.y=this._multiline?t[0]:(e.height-this._surrogate.height)/2,this._surrogate.x=t[3],this._surrogate.text=this._deriveSurrogateText(),this._surrogate.style.align){case"left":this._surrogate.x=t[3];break;case"center":this._surrogate.x=.5*e.width-.5*this._surrogate.width;break;case"right":this._surrogate.x=e.width-t[1]-this._surrogate.width}this._updateSurrogateHitbox(e),this._updateSurrogateMask(e,t)},n._updateSurrogateHitbox=function(t){this._surrogate_hitbox.clear(),this._surrogate_hitbox.beginFill(0),this._surrogate_hitbox.drawRect(0,0,t.width,t.height),this._surrogate_hitbox.endFill(),this._surrogate_hitbox.interactive=!this._disabled},n._updateSurrogateMask=function(t,e){this._surrogate_mask.clear(),this._surrogate_mask.beginFill(0),this._surrogate_mask.drawRect(e[3],0,t.width-e[3]-e[1],t.height),this._surrogate_mask.endFill()},n._destroySurrogate=function(){this._surrogate&&(this.removeChild(this._surrogate),this.removeChild(this._surrogate_hitbox),this._surrogate.destroy(),this._surrogate_hitbox.destroy(),this._surrogate=null,this._surrogate_hitbox=null)},n._onSurrogateFocus=function(){this._setDOMInputVisible(!0),setTimeout(this._ensureFocus.bind(this),10)},n._ensureFocus=function(){this._hasFocus()||this.focus()},n._deriveSurrogateStyle=function(){var t=new e.TextStyle;for(var i in this._input_style)switch(i){case"color":t.fill=this._input_style.color;break;case"fontFamily":case"fontSize":case"fontWeight":case"fontVariant":case"fontStyle":t[i]=this._input_style[i];break;case"letterSpacing":t.letterSpacing=parseFloat(this._input_style.letterSpacing);break;case"textAlign":t.align=this._input_style.textAlign}return this._multiline&&(t.lineHeight=parseFloat(t.fontSize),t.wordWrap=!0,t.wordWrapWidth=this._getDOMInputBounds().width),0===this._dom_input.value.length&&(t.fill=this._placeholderColor),t},n._deriveSurrogatePadding=function(){var t=this._input_style.textIndent?parseFloat(this._input_style.textIndent):0;if(this._input_style.padding&&this._input_style.padding.length>0){var e=this._input_style.padding.trim().split(" ");if(1==e.length){var i=parseFloat(e[0]);return[i,i,i,i+t]}if(2==e.length){var s=parseFloat(e[0]),n=parseFloat(e[1]);return[s,n,s,n+t]}if(4==e.length){var o=e.map(function(t){return parseFloat(t)});return o[3]+=t,o}}return[0,0,0,t]},n._deriveSurrogateText=function(){return 0===this._dom_input.value.length?this._placeholder:this._dom_input.value},n._updateFontMetrics=function(){var t=this._deriveSurrogateStyle().toFontString();this._font_metrics=e.TextMetrics.measureFont(t)},n._buildBoxCache=function(){this._destroyBoxCache();var t=["DEFAULT","FOCUSED","DISABLED"],e=this._getDOMInputBounds();for(var i in t)this._box_cache[t[i]]=this._box_generator(e.width,e.height,t[i]);this._previous.input_bounds=e},n._destroyBoxCache=function(){for(var t in this._box&&(this.removeChild(this._box),this._box=null),this._box_cache)this._box_cache[t].destroy(),this._box_cache[t]=null,delete this._box_cache[t]},n._hasFocus=function(){return document.activeElement===this._dom_input},n._setDOMInputVisible=function(t){this._dom_input.style.display=t?"block":"none"},n._getCanvasBounds=function(){var t=this._last_renderer.view.getBoundingClientRect(),e={top:t.top,left:t.left,width:t.width,height:t.height};return e.left+=window.scrollX,e.top+=window.scrollY,e},n._getDOMInputBounds=function(){var t=!1;this._dom_added||(document.body.appendChild(this._dom_input),t=!0);var e=this._dom_input.style.transform,i=this._dom_input.style.display;this._dom_input.style.transform="",this._dom_input.style.display="block";var s=this._dom_input.getBoundingClientRect();return this._dom_input.style.transform=e,this._dom_input.style.display=i,t&&document.body.removeChild(this._dom_input),s},n._getDOMRelativeWorldTransform=function(){var t=this._last_renderer.view.getBoundingClientRect(),e=this.worldTransform.clone();return e.scale(this._resolution,this._resolution),e.scale(t.width/this._last_renderer.width,t.height/this._last_renderer.height),e},n._pixiMatrixToCSS=function(t){return"matrix("+[t.a,t.b,t.c,t.d,t.tx,t.ty].join(",")+")"},n._comparePixiMatrices=function(t,e){return!(!t||!e)&&(t.a==e.a&&t.b==e.b&&t.c==e.c&&t.d==e.d&&t.tx==e.tx&&t.ty==e.ty)},n._compareClientRects=function(t,e){return!(!t||!e)&&(t.left==e.left&&t.top==e.top&&t.width==e.width&&t.height==e.height)},_createClass(i,[{key:"substituteText",get:function(){return this._substituted},set:function(t){this._substituted!=t&&(this._substituted=t,t?(this._createSurrogate(),this._dom_visible=!1):(this._destroySurrogate(),this._dom_visible=!0),this.placeholder=this._placeholder,this._update())}},{key:"placeholder",get:function(){return this._placeholder},set:function(t){this._placeholder=t,this._substituted?(this._updateSurrogate(),this._dom_input.placeholder=""):this._dom_input.placeholder=t}},{key:"disabled",get:function(){return this._disabled},set:function(t){this._disabled=t,this._dom_input.disabled=t,this._setState(t?"DISABLED":"DEFAULT")}},{key:"maxLength",get:function(){return this._max_length},set:function(t){this._max_length=t,this._dom_input.setAttribute("maxlength",t)}},{key:"restrict",get:function(){return this._restrict_regex},set:function(t){_instanceof(t,RegExp)?("^"!==(t=t.toString().slice(1,-1)).charAt(0)&&(t="^"+t),"$"!==t.charAt(t.length-1)&&(t+="$"),t=new RegExp(t)):t=new RegExp("^["+t+"]*$"),this._restrict_regex=t}},{key:"text",get:function(){return this._dom_input.value},set:function(t){this._dom_input.value=t,this._substituted&&this._updateSurrogate()}},{key:"htmlInput",get:function(){return this._dom_input}}]),i}(e.Container);function s(t){if((t=t||{fill:13421772}).default)t.focused=t.focused||t.default,t.disabled=t.disabled||t.default;else{var i=t;(t={}).default=t.focused=t.disabled=i}return function(i,s,n){var o=t[n.toLowerCase()],r=new e.Graphics;return o.fill&&r.beginFill(o.fill),o.stroke&&r.lineStyle(o.stroke.width||1,o.stroke.color||0,o.stroke.alpha||1),o.rounded?r.drawRoundedRect(0,0,i,s,o.rounded):r.drawRect(0,0,i,s),r.endFill(),r.closePath(),r}}t.exportTo[0][t.exportTo[1]]=i}("object"===("undefined"==typeof PIXI?"undefined":_typeof(PIXI))?{PIXI:PIXI,exportTo:[PIXI,"TextInput"]}:"object"===("undefined"==typeof module?"undefined":_typeof(module))?{PIXI:require("pixi.js"),exportTo:[module,"exports"]}:console.warn("[PIXI.TextInput] could not attach to PIXI namespace. Make sure to include this plugin after pixi.js")||{});