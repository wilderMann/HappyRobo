happyrobo.initMCP23017LED(Ports.GPA7)
MCP23017.initMCP23017Button(Ports.GPB7)
basic.forever(function () {
    MCP23017.setLed(Ports.GPB0, true)
    basic.pause(500)
    MCP23017.setLed(Ports.GPB0, false)
    basic.pause(500)
})
basic.forever(function () {
    if (MCP23017.MCPButtonPressed(Ports.GPB7)) {
        led.plot(2, 2)
    } else {
        led.unplot(2, 2)
    }
})

// go right 90 degrees
input.onButtonPressed(Button.A, () => {
    motion_kit.turnRight(90);
})
// go forward 10
input.onButtonPressed(Button.B, () => {
    motion_kit.driveForwards(10);
})
// stop
input.onButtonPressed(Button.AB, () => {
    motion_kit.stop
})

