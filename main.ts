bluetooth.onBluetoothConnected(function () {
    music.playTone(523, music.beat(BeatFraction.Double))
})
bluetooth.onBluetoothDisconnected(function () {
    music.playTone(262, music.beat(BeatFraction.Double))
})
input.onButtonPressed(Button.A, function () {
    if (count > 5) {
        count = 0
    } else {
        count += 1
        basic.showString("" + (count))
    }
})
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    命令 = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    トリガー = 1
})
input.onButtonPressed(Button.AB, function () {
    count = 0
})
input.onButtonPressed(Button.B, function () {
    count = 0
})
let 命令 = ""
let トリガー = 0
let count = 0
bluetooth.startUartService()
count = 0
let 平均をとる数 = 5
トリガー = 0
basic.forever(function () {
	
})
