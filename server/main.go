package main

import (
	"context"
	"fmt"
	"html/template"
	"log"
	"net"
	"net/http"
	"os"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

var listenAddr string

// Global map, protected by lock
var mutex = &sync.RWMutex{}
var gameMap = make(map[string]Game)

func init() {
	host, ok := os.LookupEnv("GAMEHOST")
	if !ok {
		host = getLocalIP()
	}
	listenAddr = fmt.Sprintf("%s:4000", host)
	log.Printf("Listening on %s", listenAddr)
}

func getLocalIP() string {
	// GetLocalIP returns the non loopback local IP of the host
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return ""
	}
	for _, address := range addrs {
		// check the address type and if it is not a loopback the display it
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String()
			}
		}
	}
	return ""
}

func getGameFromMap(gameToken string) (Game, bool) {
	mutex.RLock()
	defer mutex.RUnlock()
	var val, ok = gameMap[gameToken]
	return val, ok
}

func addGameToMap(gameToken string, game Game) {
	mutex.Lock()
	defer mutex.Unlock()
	gameMap[gameToken] = game
}

func removeGameFromMap(gameToken string) {
	mutex.Lock()
	defer mutex.Unlock()
	delete(gameMap, gameToken)
}

var rootTemplate = template.Must(template.New("root").Parse(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<script>
	websocket = new WebSocket("ws://{{.}}/socket");
	var onMessage = function(m){
		var node = document.createElement("p");
		var textnode = document.createTextNode(m.data);
		node.appendChild(textnode);
		document.getElementById("chat").appendChild(node);
	}
	var onClose = function(m){
		var node = document.createElement("p");
		var textnode = document.createTextNode("Connection closed: "+m.reason);
		node.appendChild(textnode);
		document.getElementById("chat").appendChild(node);
	}
	var onSend = function(e){
		websocket.send(JSON.stringify({
			"actionId": document.getElementById("action-id").value,
			"playerName": document.getElementById("player-name").value,
			"playerToken": document.getElementById("player-token").value,
			"cardId": document.getElementById("card-id").value,
			"gameToken": document.getElementById("game-token").value
		}));
	}
	websocket.onmessage = onMessage;
	websocket.onclose = onClose;
</script>
Player Name <input id="player-name"/></br>
Action Id <input id="action-id"/></br>
Player Token <input id="player-token"/></br>
Game Token <input id="game-token"/></br>
Card Id <input id="card-id"/></br>
<button onclick="onSend(this)">Send</button>
<div id="chat"></div>
</html>
`))

func rootHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("main", goid())
	rootTemplate.Execute(w, listenAddr)
}

func goid() int {
	var buf [64]byte
	n := runtime.Stack(buf[:], false)
	idField := strings.Fields(strings.TrimPrefix(string(buf[:n]), "goroutine "))[0]
	id, err := strconv.Atoi(idField)
	if err != nil {
		panic(fmt.Sprintf("cannot get goroutine id: %v", err))
	}
	return id
}

func convertGameStateToOutput(gameState *GameState) GameOutput {
	var err string
	if gameState.err != nil {
		err = gameState.err.Error()
	}
	var gameOutput = GameOutput{
		GameState: gameState,
		ErrorMsg:  err,
	}
	return gameOutput
}
func isValidAction(actionId string) bool {
	actions := [10]string{
		"create", "join", "start", "leave",
		"concentrate", "ready",
		"propose-star", "agree-star", "reject-star",
		"card",
	}
	for _, a := range actions {
		if a == actionId {
			return true
		}
	}
	return false
}

func main() {
	log.Printf("hello server")
	log.Println("main", goid())
	http.HandleFunc("/", rootHandler)
	http.Handle("/socket", http.HandlerFunc(runGame))
	err := http.ListenAndServe(listenAddr, nil)
	if err != nil {
		log.Fatal(err)
	}
}

func extractDetails(raw map[string]interface{}) InputDetails {
	var gameToken, _ = raw["gameToken"].(string)
	var playerToken, _ = raw["playerToken"].(string)
	var playerName, _ = raw["playerName"].(string)
	var actionId, _ = raw["actionId"].(string)
	var cardId, _ = raw["card"].(int)
	var details = InputDetails{
		GameToken:   gameToken,
		PlayerToken: playerToken,
		PlayerName:  playerName,
		ActionId:    actionId,
		CardId:      cardId,
	}
	return details
}

func throwOut(myGame Game, myPlayerToken string) {
	myGame.Unsubscribe(myPlayerToken)
}

func isValidGame(gameToken string, gameTokenPrev string) bool {
	_, ok := getGameFromMap(gameToken)
	return ok && (gameToken == gameTokenPrev)
}
func isValidPlayer(playerToken string, playerTokenPrev string) bool {
	return (playerToken == playerTokenPrev)
}
func validateInput(gameDetails InputDetails, myGame Game, myPlayerToken string, myPlayerName string) bool {
	log.Printf("Checking inputs...")
	//log.Printf("playerToken %v : %v", myPlayerToken, gameDetails.PlayerToken)
	//log.Printf("playerName %v : %v", myPlayerName, gameDetails.PlayerName)
	//log.Printf("gameToken %v : %v", myGame.token, gameDetails.GameToken)
	//log.Printf("actionId %v", gameDetails.ActionId)
	//log.Printf("cardId %v", gameDetails.CardId)
	var ok = true
	// universal checks
	if gameDetails.PlayerName == "" {
		ok = false
		return ok
	}
	if !isValidAction(gameDetails.ActionId) {
		ok = false
		return ok
	}
	// checks for create: fully covered
	if gameDetails.ActionId == "create" {
		return ok
	}
	// common checks for remaining actions
	if !isValidGame(gameDetails.GameToken, myGame.token) {
		ok = false
		return ok
	}
	// checks for join: fully covered
	if gameDetails.ActionId == "join" {
		return ok
	}
	// common checks for remaining actions
	if !isValidPlayer(gameDetails.PlayerToken, myPlayerToken) {
		ok = false
		return ok
	}
	// specific check for playing cards
	if gameDetails.ActionId == "card" {
		if gameDetails.CardId < 1 || gameDetails.CardId > 100 {
			ok = false
			return ok
		}
	}
	return ok
}
func runGame(w http.ResponseWriter, r *http.Request) {
	log.Printf("Connection established...")
	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: false,
		OriginPatterns:     []string{"0.0.0.0:8000"},
	})
	if err != nil {
		log.Printf(err.Error())
		return
	}
	defer c.Close(websocket.StatusInternalError, "internal error")

	ctx, cancel := context.WithTimeout(r.Context(), time.Hour*120000)
	defer cancel()

	var myPlayerToken string
	var myPlayerName string
	var myGame Game
	var myPlayerChannel chan GameState
	log.Printf("Entering loop...")
	for {
		var data = make(map[string]interface{})

		var err = wsjson.Read(ctx, c, &data)
		if err != nil {
			log.Println(err.Error())
			// could happen if client closed connection
			throwOut(myGame, myPlayerToken)
			c.Close(websocket.StatusAbnormalClosure, err.Error())
			return
		}
		gameDetails := extractDetails(data)
		inputOk := validateInput(gameDetails, myGame, myPlayerName, myPlayerToken)
		if !inputOk {
			output := convertGameStateToOutput(newGameState(myGame.token))
			output.ErrorMsg = "Wrong input"
			err = wsjson.Write(ctx, c, output)
			if err != nil {
				// when write fails, it is too broken
				log.Printf(err.Error())
				g, ok := getGameFromMap(myGame.token)
				if ok {
					g.Unsubscribe(myPlayerToken)
				}
				g, ok = getGameFromMap(gameDetails.GameToken)
				if ok {
					g.Unsubscribe(gameDetails.PlayerToken)
				}
				log.Println("Input check hahahaha", err.Error())
				c.Close(websocket.StatusInternalError, err.Error())
				return
			}
			continue
		}
		switch gameDetails.ActionId {
		case "create":
			log.Printf("Creating game...")
			myPlayerName = gameDetails.PlayerName
			myGame = *NewGame()
			addGameToMap(myGame.token, myGame)
			go myGame.Start()
			myPlayerToken, myPlayerChannel = myGame.Subscribe(myPlayerName)
			gameDetails.PlayerToken = myPlayerToken
			gameDetails.GameToken = myGame.token
			go listenPlayerChannel(c, ctx, myPlayerChannel)
		case "join":
			log.Printf("Joining game...")
			myGame, _ = getGameFromMap(gameDetails.GameToken)
			myPlayerName = gameDetails.PlayerName
			myPlayerToken, myPlayerChannel = myGame.Subscribe(myPlayerName)
			gameDetails.PlayerToken = myPlayerToken
			go listenPlayerChannel(c, ctx, myPlayerChannel)
		case "leave":
			log.Printf("Leaving game...")
			myGame, _ := getGameFromMap(gameDetails.GameToken)
			myGame.Unsubscribe(myPlayerToken)
		default:
			log.Printf("Other action...")
			myGame.inputCh <- gameDetails
		}
	}
}
func listenPlayerChannel(c *websocket.Conn, ctx context.Context, myPlayerChannel chan GameState) {
	var err error
	log.Printf("Player channel opened...")
	for {
		gameState, ok := <-myPlayerChannel
		if !ok {
			return
		}
		g, ok := getGameFromMap(gameState.GameToken)
		if !ok {
			// should never happen
			panic("Game returned invalid gameToken - shutting down...")
		}
		if gameState.err != nil {
			if gameState.err.severity == "fatal" {
				log.Println("Fatal game error", gameState.err.Error())
				g.Unsubscribe(gameState.PlayerToken)
				c.Close(websocket.StatusUnsupportedData, err.Error())
				return
			}
		}
		if gameState.GameStateEvent.Name == "gameOver" {
			log.Printf("Game over! Removing game...")
			removeGameFromMap(gameState.GameToken)
			return
		}

		log.Printf("New game state received")
		output := convertGameStateToOutput(&gameState)
		err = wsjson.Write(ctx, c, output)
		if err != nil {
			log.Printf("Error when writing to player channel %s for game %s", gameState.PlayerToken, gameState.GameToken)
			g.Unsubscribe(gameState.PlayerToken)
			c.Close(websocket.StatusInternalError, err.Error())
			return
		}
	}
}
