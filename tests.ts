happyrobo.initMCP23017LED(Ports.GPA7)
happyrobo.initMCP23017Button(Ports.GPB7)
basic.forever(function () {
    happyrobo.setLed(Ports.GPB0, true)
    basic.pause(500)
    happyrobo.setLed(Ports.GPB0, false)
    basic.pause(500)
})
basic.forever(function () {
    if (happyrobo.MCPButtonPressed(Ports.GPB7)) {
        led.plot(2, 2)
    } else {
        led.unplot(2, 2)
    }
})

// go right 90 degrees
input.onButtonPressed(Button.A, () => {
    happyrobo.turnRight(90);
})
// go forward 10
input.onButtonPressed(Button.B, () => {
    happyrobo.driveForwards(10);
})
// stop
input.onButtonPressed(Button.AB, () => {
    happyrobo.stop
})

