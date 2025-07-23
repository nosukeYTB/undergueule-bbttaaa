enum MenuOption {
    Start,
    Quit
}

enum GameState {
    Menu,
    NameSelect,
    Playing,
    Inventory
}

let gameState = GameState.Menu
let currentSelection = MenuOption.Start
let playerName = ""
let player: Sprite = null
let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
let currentIndex = 0
let selectingOK = false

// Inventaire
let inventory = ["Stick", "Knife"]
let inventoryDamage: { [key: string]: number } = {
    "Stick": 1,
    "Knife": 10
}
let selectedItem = 0
let equippedItem = "Stick"

scene.setBackgroundColor(15)

// 🌟 Transition écran blanc
let isTransitioning = false
let transitionBrightness = 0

function transitionToGame() {
    isTransitioning = true
    transitionBrightness = 0
    // gameState reste NameSelect pendant la transition
}

game.onUpdate(function () {
    if (isTransitioning) {
        if (transitionBrightness < 15) {
            scene.setBackgroundColor(transitionBrightness)
            transitionBrightness++
        } else {
            isTransitioning = false
            gameState = GameState.Playing
            startGame()
        }
    }
})

// 🎨 Affichage principal
game.onPaint(function () {
    screen.fill(15)

    if (gameState == GameState.Menu) {
        screen.printCenter("UNDERGUEULE", 20, 7)
        screen.print("START", 50, 60)
        screen.print("QUIT", 50, 75)
        if (currentSelection == MenuOption.Start) {
            screen.print(">", 40, 60)
        } else {
            screen.print(">", 40, 75)
        }
    }

    else if (gameState == GameState.NameSelect) {
        screen.printCenter("ENTER YOUR NAME", 15, 7)
        if (!selectingOK) {
            screen.printCenter(playerName + "_", 35, 1)
            let currentLetter = letters.charAt(currentIndex)
            screen.printCenter("[" + currentLetter + "]", 60, 9)
            screen.printCenter("↓ OK", 90, 1)
        } else {
            screen.printCenter("Press A to confirm", 60, 7)
            screen.printCenter(playerName, 80, 1)
        }
    }

    else if (gameState == GameState.Inventory) {
        screen.printCenter("INVENTORY", 10, 7)
        for (let i = 0; i < inventory.length; i++) {
            let itemName = inventory[i]
            let text = (i == selectedItem ? "> " : "  ") + itemName
            if (itemName == equippedItem) {
                text += " (Equipped)"
            }
            screen.print(text, 30, 30 + i * 15)
        }
        screen.printCenter("A: Equip | B: Exit", 100, 1)
    }
})

// 🎮 Contrôles généraux
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState == GameState.Menu) {
        currentSelection = MenuOption.Start
        music.baDing.play()
    }
    else if (gameState == GameState.NameSelect) {
        selectingOK = false
    }
    else if (gameState == GameState.Inventory) {
        if (selectedItem > 0) {
            selectedItem--
            music.knock.play()
        }
    }
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState == GameState.Menu) {
        currentSelection = MenuOption.Quit
        music.baDing.play()
    }
    else if (gameState == GameState.NameSelect && playerName.length > 0) {
        selectingOK = true
        music.jumpUp.play()
    }
    else if (gameState == GameState.Inventory) {
        if (selectedItem < inventory.length - 1) {
            selectedItem++
            music.knock.play()
        }
    }
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState == GameState.NameSelect && !selectingOK) {
        currentIndex = (currentIndex - 1 + 26) % 26
        music.knock.play()
    }
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState == GameState.NameSelect && !selectingOK) {
        currentIndex = (currentIndex + 1) % 26
        music.knock.play()
    }
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState == GameState.Menu) {
        if (currentSelection == MenuOption.Start) {
            music.magicWand.play()
            gameState = GameState.NameSelect  // On passe au choix du nom
            selectingOK = false
            currentIndex = 0
            playerName = ""
        } else {
            game.over(false)
        }
    }

    else if (gameState == GameState.NameSelect) {
        if (selectingOK) {
            transitionToGame()  // Transition vers le jeu après nom validé
        } else if (playerName.length < 8) {
            playerName += letters.charAt(currentIndex)
            music.baDing.play()
        }
    }

    else if (gameState == GameState.Playing) {
        if (player && !controller.B.isPressed()) {
            game.showLongText("You see golden flowers...\nThey're warm under your feet.", DialogLayout.Bottom)
        }
    }

    else if (gameState == GameState.Inventory) {
        equippedItem = inventory[selectedItem]
        music.baDing.play()
        game.splash("Equipped: " + equippedItem + " (" + inventoryDamage[equippedItem] + " dmg)")
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState == GameState.NameSelect && !selectingOK && playerName.length > 0) {
        playerName = playerName.substr(0, playerName.length - 1)
        music.zapped.play()
    }

    else if (gameState == GameState.Playing) {
        gameState = GameState.Inventory
        selectedItem = inventory.indexOf(equippedItem)
        music.magicWand.play()
    }

    else if (gameState == GameState.Inventory) {
        gameState = GameState.Playing
        music.jumpDown.play()
    }
})

// 🪻 Début du jeu
function startGame() {
    scene.setBackgroundColor(1) // Sombre

    let flower = sprites.create(img`
        . . 2 2 . . 
        . 2 4 4 2 . 
        2 4 5 5 4 2 
        . 2 4 4 2 . 
        . . 2 2 . . 
    `, SpriteKind.Food)
    flower.setPosition(80, 60)

    player = sprites.create(img`
        . . . f f f . . . 
        . f f e e e f f . 
        f e e e e e e e f 
        f e e d d d e e f 
        f e d f d f d e f 
        f f d d d d d f f 
        . f f f f f f f . 
        . . f f f f f . . 
    `, SpriteKind.Player)
    player.setPosition(80, 60)
    controller.moveSprite(player, 50, 50)
    scene.cameraFollowSprite(player)
}
