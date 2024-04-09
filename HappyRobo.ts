/**
 *  MCP23017-Interfacefunktionen
 *  CC by SA Michael Klein 9.7.2021
 *  Source: https://github.com/MKleinSB/pxt-mcp23017
 */

const enum REG_MCP {
    Bitmuster_A = 0x12,
    Bitmuster_B = 0x13,
    EinOderAusgabe_A = 0x00, 
    EinOderAusgabe_B = 0x01,
    PullUp_Widerstaende_A = 0x0C,
    PullUp_Widerstaende_B = 0x0D
}

const enum ADDRESS {          // Adresse des MCP23017
    A20 = 0x20,               // Standardwert
    A21 = 0x21,                
    A22 = 0x22,               
    A23 = 0x23,               
    A24 = 0x24,              
    A25 = 0x25,               
    A26 = 0x26,                
    A27 = 0x27                 
}
const enum BITS {              
    Alle = 0xff,               
    Keiner = 0x00,             
    Bit1 = 0x01              
}

const enum Ports {                // Nummern der Ports (1-16)
    GPA0 = 1,               
    GPA1 = 2,
    GPA2 = 3,
    GPA3 = 4,
    GPA4 = 5,
    GPA5 = 6,
    GPA6 = 7,
    GPA7 = 8,
    GPB0 = 9,
    GPB1 = 10,
    GPB2 = 11,
    GPB3 = 12,
    GPB4 = 13,
    GPB5 = 14,
    GPB6 = 15,
    GPB7 = 16    
}

// zum Speichern der Bitwerte aus RegisterA und RegisterB
let BitwertA = 0x00;
let BitwertB = 0x00;
let IOBitsA = 0x00;
let IOBitsB = 0x00;

//% weight=100 color=#00A654 icon="\uf1b9" block="MotionKit"
namespace HappyRobo {

	
    /*some parameters used for controlling the turn and length */
    const microSecInASecond = 1000000
    let distancePerSec = 100
    let numberOfDegreesPerSec = 200
    let timeout = 0
    
        /* sender or receiver role
     * false = sender
     * true = receiver
     */
    let btrole = 0

    //flag for initialization
    let isinitialized = false

    //light follower pin
    let lfpin = DigitalPin.C18

    
    /**
     * @param PIN Gib den Pin an, an dem die Lichtfolgerplatine angeschlossen ist, z.B.: DigitalPin.C18 , DigitalPin.C17
     */
    //% blockId=motion_kit_readLightfollower
    //% block="read light follower on pin | %PIN"
    export function readLightfollower(PIN: DigitalPin): number {
        lfpin = PIN
        if ((PIN == DigitalPin.C18) || (PIN == DigitalPin.C17)) {
            if (pins.digitalReadPin(PIN) == 1) {
                return 1
            } else {
                return 0
            }
        }
        return 0
    }


    export enum side {
        //% block="links"
        Left = 0,
        //% block="rechts"
        Right = 1
    }
    
    /**
     * Gib an, wie du auf das Licht reagieren möchtest. Kommt das Licht von links oder rechts?
     * @param value can be Left or Right, eg: Left
     */
    //% blockId=motion_kit_getLightDirection
    //% block="light direction is | %value"
    export function getLightDirection(value: side): boolean {
        if (pins.digitalReadPin(lfpin) == value) {
            return true;
        } else {
            return false;
        }
    }

    
    export enum roles{
	    //% block=sender
	    sender=0,
	    //% block=receiver
	    receiver=1
    }
    
    /**
     * @param channel Bluetooth channel number, eg: 0 max: 255
     * @param role , eg: false
     */
    //% blockId=motion_kit_remote
    //% block="initialize mini on channel | %channel | as | %role"
    export function remote(channel: number, role: roles): void {
        if (isinitialized) {
            return
        }
        //set channel
        radio.setGroup(channel)
        btrole = role
        isinitialized = true
    }

    	let x = 0
	let y = 0
	let sl = 0
	let sr = 0

	const hysterese = 10

	radio.onDataPacketReceived(({ receivedString: name, receivedNumber: value }) => {
	    if ((name == "X") || (name == "Y")) {
		if (Math.abs(value) > hysterese) {
		    sl = 0
		    sr = 0

		    if (name == "X") {
			if (x == value) {
			    return
			}
			x = value
		    }

		    if (name == "Y") {
			if (y == value) {
			    return
			}
			y = value
		    }

		    if (y < 0) {//FW
			if (x > 0) {//Q1

			    sl = 90 - (y - x / 2)
			    sr = 90 + (y + x / 2)
			} else {//Q2

			    sl = 90 - (y - x / 2)
			    sr = 90 + (y + x / 2)
			}
		    } else {//RW
			if (x < 0) {//Q3

			    sl = 90 - (y - x / 2)
			    sr = 90 + (y + x / 2)
			} else {//Q4

			    sl = 90 - (y - x / 2)
			    sr = 90 + (y + x / 2)
			}
		    }

		    //check limits
		    if (sl > 180) {
			sl = 180
		    }
		    if (sr > 180) {
			sr = 180
		    }
		    if (sl < 0) {
			sl = 0
		    }
		    if (sr < 0) {
			sr = 0
		    }

		    pins.servoWritePin(AnalogPin.C16, sl)
		    pins.servoWritePin(AnalogPin.C17, sr)

		} else {
		    //
		    if (name == "X") {
			x = 0
		    }
		    if (name == "Y") {
			y = 0
		    }
		    if ((y == 0) && (x == 0)) {
			pins.digitalWritePin(DigitalPin.C16, 0)
			pins.digitalWritePin(DigitalPin.C17, 0)
		    }
		}


	    }
	})


    control.inBackground(() => {
        while (!isinitialized) {
            //wait for initialization
		control.waitMicros(1000)
		timeout += 1
		if (timeout > 10000) {
		    return
		}
        }
        //return if initialized as receiver
        if (btrole) {
            return
        }
        //send xyz values in background
        while (true) {
            radio.sendValue("X", pins.map(
                input.acceleration(Dimension.X),
                -1024,
                1023,
                -90,
                90
            ));
            radio.sendValue("Y", pins.map(
                input.acceleration(Dimension.Y),
                -1024,
                1023,
                -90,
                90
            ));
            basic.pause(100)
        }
    })

    /**
     * Drives forwards. Call stop to stop
     */
    //% blockId=motion_kit_servos_forward
    //% block="drive forward"
    export function forward(): void {
        pins.servoWritePin(AnalogPin.C16, 0);
        pins.servoWritePin(AnalogPin.C17, 180);
    }

    /**
     * Drives backwards. Call stop to stop
     */
    //% blockId=motion_kit_servos_backward
    //% block="drive backward"
    export function backward(): void {
        pins.servoWritePin(AnalogPin.C16, 180);
        pins.servoWritePin(AnalogPin.C17, 0);
    }

    /**
	* Turns left. Call stop to stop
	*/
    //% blockId=motion_kit_servos_left
    //% block="turn left"
    export function left(): void {
        pins.servoWritePin(AnalogPin.C16, 0);
        pins.servoWritePin(AnalogPin.C17, 0);
    }

	/**
	 * Turns right. Call ``stop`` to stop
	 */
    //% blockId=motion_kit_servos_right
    //% block="turn right"
    export function right(): void {
        pins.servoWritePin(AnalogPin.C16, 180);
        pins.servoWritePin(AnalogPin.C17, 180);
    }

	/**
	 * Stop for 360 servos.
	 * rather than write 90, which may not stop the servo moving if it is out of trim
	 * this stops sending servo pulses, which has the same effect.
	 * On a normal servo this will stop the servo where it is, rather than return it to neutral position.
	 * It will also not provide any holding force.
     */
    //% blockId=motion_kit_servos_stop
    //% block="stop"
    export function stop(): void {
        pins.analogWritePin(AnalogPin.C16, 0);
        pins.analogWritePin(AnalogPin.C17, 0);
    }

	/**
	 * Sends servos to 'neutral' position.
	 * On a well trimmed 360 this is stationary, on a normal servo this is 90 degrees.
     */
    //% blockId=motion_kit_servos_neutral
    //% block="goto neutral position"
    export function neutral(): void {
        pins.servoWritePin(AnalogPin.C16, 90);
        pins.servoWritePin(AnalogPin.C17, 90);
    }

    /**
     * Drives forwards the requested distance and then stops
     * @param howFar distance to move
     */
    //% blockId=motion_kit_drive_forwards
    //% block="drive forwards %howFar|distance" 
    export function driveForwards(howFar: number): void {
        let timeToWait = (howFar * microSecInASecond) / distancePerSec; // calculation done this way round to avoid zero rounding
        forward();
        control.waitMicros(timeToWait);
        stop();
    }

    /**
     * Drives backwards the requested distance and then stops
     * @param howFar distance to move
     */
    //% blockId=motion_kit_drive_backwards
    //% block="drive backwards %howFar|distance" 
    export function driveBackwards(howFar: number): void {
        let timeToWait = (howFar * microSecInASecond) / distancePerSec; // calculation done this way round to avoid zero rounding
        backward();
        control.waitMicros(timeToWait);
        stop();
    }

    /**
     * Turns right through the requested degrees and then stops
     * needs NumberOfDegreesPerSec tuned to make accurate, as it uses
     * a simple turn, wait, stop method.
     * Runs the servos at slower than the right function to reduce wheel slip
     * @param deg how far to turn, eg: 90
     */
    //% blockId=motion_kit_turn_right
    //% block="turn right %deg|degrees"
    export function turnRight(deg: number): void {
        let timeToWait = (deg * microSecInASecond) / numberOfDegreesPerSec;// calculation done this way round to avoid zero rounding
        pins.servoWritePin(AnalogPin.C16, 130);
        pins.servoWritePin(AnalogPin.C17, 130);
        control.waitMicros(timeToWait);
        stop();
    }

    /**
    * Turns left through the requested degrees and then stops
    * needs NumberOfDegreesPerSec tuned to make accurate, as it uses
    * a simple turn, wait, stop method.
    * Runs the servos at slower than the right function to reduce wheel slip
    * @param deg how far to turn, eg: 90
    */
    //% blockId=motion_kit_turn_left
    //% block="turn left %deg|degrees"
    export function turnLeft(deg: number): void {
        let timeToWait = (deg * microSecInASecond) / numberOfDegreesPerSec;// calculation done this way round to avoid zero rounding
        pins.servoWritePin(AnalogPin.C16, 50);
        pins.servoWritePin(AnalogPin.C17, 50);
        control.waitMicros(timeToWait);
        stop()
    }

	/**
     * Allows the setting of the turn speed.
     * This allows tuning for the turn x degrees commands
     * @param degPerSec : How many degrees per second it does.
     */
    //% blockId=motion_kit_set_turn_speed_param
    //% block="calibrate turn speed with %DegPerSec| default (300)" 
    export function setDegreesPerSecond(degPerSec: number): void {
        numberOfDegreesPerSec = degPerSec
    }

    /**
     * Allows the setting for forward / reverse speed.
     * This allows tuning for the move x distance commands
     * @param DegPerSec : How many degrees per second it does.
     */
    //% blockId=motion_kit_set_movement_speed_param 
    //% block="calibrate forward speed with %DistPerSec| (default = 300)"
    export function setDistancePerSecond(distPerSec: number): void {
        distancePerSec = distPerSec
    }
    
    /**
    * There is no need to define a port as output. They are predefined.
    **/
    //% blockId="initMCP23017LED"
    //% block="set %port as output"    
    //% block.loc.de="setze %port als Ausgang" 
    //% jsdoc.loc.de="Ausgänge müssen eigentlich garnicht definiert werden sondern sind voreingestellt!"
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=4
    //% weight=80
    //% group="Beim Start"
    export function initMCP23017LED(port: Ports): void {
        let name:number=port;
         if (name > 0 && name < 9) { // Register A Bit des Ports auf 0 setzen
            IOBitsA = (IOBitsA & (BITS.Alle-(BITS.Bit1 << name - 1)))
            MCP23017.writeRegister(ADDRESS.A20, REG_MCP.EinOderAusgabe_A, IOBitsA)
        } else { // Register B
            name = name - 8
            IOBitsB = (IOBitsB & (BITS.Alle-(BITS.Bit1 << name - 1)))
            MCP23017.writeRegister(ADDRESS.A20, REG_MCP.EinOderAusgabe_B, IOBitsB)
        }
        
    }

    //% blockId="initMCP23017Button"
    //% block="set %port as input"
    //% block.loc.de="setze %port als Eingang"  
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=4
    //% weight=80
    //% group="Beim Start"
    export function initMCP23017Button(port: Ports): void {
       let name:number=port;
         if (name > 0 && name < 9) { // Register A Bit des Ports auf 1 setzen
            IOBitsA = (IOBitsA | (BITS.Bit1 << name - 1))
            MCP23017.writeRegister(ADDRESS.A20, REG_MCP.EinOderAusgabe_A, IOBitsA)
            MCP23017.writeRegister(ADDRESS.A20, REG_MCP.PullUp_Widerstaende_A, IOBitsA)
        } else { // Register B
            name = name - 8
            IOBitsB = (IOBitsB | (BITS.Bit1 << name - 1))
            MCP23017.writeRegister(ADDRESS.A20, REG_MCP.EinOderAusgabe_B, IOBitsB)
            MCP23017.writeRegister(ADDRESS.A20, REG_MCP.PullUp_Widerstaende_B, IOBitsB)
        }
    }

    /**
     * Returns ´true´ when the port is connected to ground.
     * The port of the MCP23017 must be set as input.
     */
    //% blockId="MCPButtonPressed"
    //% block="Input %port closed"
    //% block.loc.de="Eingang %port geschlossen"
    //% jsdoc.loc.de="Gibt ´wahr´ zurück wenn der Eingang mit GND verbunden wurde, der Port des MCP23017 muss als Eingang festgelegt sein."
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=4
    //% weight=87
    //% group="Ein- & Ausgang"
    export function MCPButtonPressed(port: Ports): boolean {
        let name:number=port;
        let ergebnis:boolean=false;
        if (name > 0 && name < 9) { // Register A
            if (MCP23017.ReadNotAnd(ADDRESS.A20, REG_MCP.Bitmuster_A, (BITS.Bit1 << name - 1))) {
                ergebnis=true;
                } 
        } else { // Register B
                name = name - 8
                if (MCP23017.ReadNotAnd(ADDRESS.A20, REG_MCP.Bitmuster_B, (BITS.Bit1 << name - 1))) {
                ergebnis=true;
                } 
        }
        return ergebnis;
    }

    //% blockId="setLed"
    //% block="switch %port | %zustand"
    //% block.loc.de="schalte %port | %zustand"
    //% zustand.shadow="toggleOnOff"
    //% port.fieldEditor="gridpicker" port.fieldOptions.columns=4
    //% weight=88
    //% group="Ein- & Ausgang"

    export function setLed(port: Ports, zustand: boolean): void {
        let name:number=port
        if (zustand) { //LEDs an
            if (name > 0 && name < 9) { // Register A
                // Bitweises oder
                BitwertA = BitwertA | (BITS.Bit1 << name - 1)
                MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_A, BitwertA);
            } else { // Register B
                name = name - 8
                BitwertB = BitwertB | (BITS.Bit1 << name - 1)
                MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_B, BitwertB);
            }
        } else { //   LEDs aus
            if (name > 0 && name < 9) { // Register A
                // Ist das betreffende Bit gesetzt? Dann löschen
                if ((BitwertA & (BITS.Bit1 << name - 1)) == (BITS.Bit1 << name - 1)) {
                    // Bitweises XOR ^
                    BitwertA = BitwertA ^ (BITS.Bit1 << name - 1)
                    MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_A, BitwertA);
                }
            } else { // Register B
                name = name - 8
                if ((BitwertB & (BITS.Bit1 << name - 1)) == (BITS.Bit1 << name - 1)) {
                    BitwertB = BitwertB ^ (BITS.Bit1 << name - 1)
                    MCP23017.writeRegister(ADDRESS.A20, REG_MCP.Bitmuster_B, BitwertB);
                }
            }
        }
    }

    export function writeRegister(addr: ADDRESS, reg: REG_MCP, value: number) {
        pins.i2cWriteNumber(addr, reg * 256 + value, NumberFormat.UInt16BE)
    }

    export function ReadNotAnd(addr: ADDRESS, reg: REG_MCP, value: number): boolean {
        return (!(MCP23017.readRegister(addr, reg) & value))
    }

    export function readRegister(addr: ADDRESS, reg: REG_MCP): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.Int8LE);
        return pins.i2cReadNumber(addr, NumberFormat.Int8LE)
    }
}
