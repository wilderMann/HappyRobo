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

//% weight=100 color=#0fbc11 icon="\uf2db" blockId="MCP23017"

namespace MCP23017 {
    
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
