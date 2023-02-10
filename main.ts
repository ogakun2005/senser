function 実行 () {
    if (トリガー == 1) {
        count = parseFloat(命令)
        basic.showString("" + (count))
    }
    トリガー = 0
    if (count == 0) {
        basic.showLeds(`
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            `)
    } else if (count == 1) {
        DistanceInCentimeters(500, 0)
        bluetooth.uartWriteLine(距離送信)
        basic.showString("(1)OK!")
    } else if (count == 2) {
        磁力()
        bluetooth.uartWriteLine(磁力送信)
        basic.showString("(2)OK!")
    } else if (count == 3) {
        加速度測定()
        bluetooth.uartWriteLine(加速度送信)
        basic.showString("(3)OK!")
    } else if (count == 4) {
        ロールピッチ()
        bluetooth.uartWriteLine(ピッチ角ロール角送信)
        basic.showString("(4)OK!")
    }
}
function DistanceInCentimeters_old () {
    pins.digitalWritePin(DigitalPin.P8, 0)
    control.waitMicros(2)
    pins.digitalWritePin(DigitalPin.P8, 1)
    control.waitMicros(20)
    pins.digitalWritePin(DigitalPin.P8, 0)
    dst_duration = pins.pulseIn(DigitalPin.P9, PulseValue.High)
    basic.pause(20)
    return Math.round(dst_duration * 0.172) / 10
}
function _180θ180_を_0α360_に変換 (θ: number) {
    if (-180 < θ && θ < 0) {
        return θ + 360
    } else {
        return θ
    }
}
function 加速度測定 () {
    加速度x = 0
    加速度y = 0
    加速度z = 0
    for (let index = 0; index < 25; index++) {
        加速度x = 加速度x + input.acceleration(Dimension.X)
        加速度y = 加速度y + input.acceleration(Dimension.Y)
        加速度z = 加速度z + input.acceleration(Dimension.Z)
        basic.pause(20)
    }
    加速度x = 加速度x / 25
    加速度y = 加速度y / 25
    加速度z = 加速度z / 25
    if (加速度x != 0) {
        if (加速度y != 0) {
            加速度x = Math.trunc(0.96394 * 加速度x + 17.6765)
            加速度y = Math.trunc(0.98273 * 加速度y + 19.1285)
        } else {
            加速度x = Math.trunc(0.96394 * 加速度x + 17.6765)
        }
    } else {
        if (加速度y != 0) {
            加速度y = Math.trunc(0.98273 * 加速度y + 19.1285)
        }
    }
    加速度z = Math.floor(0.958 * 加速度z + 0.8495)
    serial.writeLine("ax" + ":" + 加速度x + "," + "ay" + ":" + 加速度y + "," + "az" + ":" + 加速度z)
    加速度送信 = "ax" + ":" + 加速度x + "," + "ay" + ":" + 加速度y + "," + "az" + ":" + 加速度z
}
function ロールピッチ () {
    ロール角 = Math.abs(90 - Math.round(Math.abs(Math.atan2(Math.sqrt(加速度x ** 2 + 加速度z ** 2), 加速度y)) * 57.29578))
    ピッチ角 = Math.abs(90 - Math.round(Math.abs(Math.atan2(-1 * 加速度z, 加速度x)) * 57.29578))
    serial.writeLine("Roll" + ":" + ロール角 + "," + "Pitch" + ":" + ピッチ角)
    ピッチ角ロール角送信 = "Roll" + ":" + ロール角 + "," + "Pitch" + ":" + ピッチ角
}
// bnに格納する(an) - (an-1)を算出する
function an__an1 (次の角度an: number, 前の角度an1: number) {
    anan1 = 次の角度an - 前の角度an1
    // bnの範囲は [ -180° < bn ≦ 180° ] だから、
    // 範囲外なら±360°して調整する
    while (!(-180 < anan1)) {
        anan1 = anan1 + 360
    }
    while (!(anan1 <= 180)) {
        anan1 = anan1 - 360
    }
    return anan1
}
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
    実行()
})
input.onButtonPressed(Button.AB, function () {
    count = 0
})
input.onButtonPressed(Button.B, function () {
    実行()
    count = 0
})
function 磁力 () {
    // {an}：取得したデータを格納する配列
    // {bn}：{an}の各要素において、一つ前の値からの差分を格納する配列
    // {cn}：{bn}の各要素を、{an}の初項へ順に加算していく
    // ※初項がn=0になることに注意！
    // 
    // bn = (an) - (an-1)　ただし、b0 = 0°
    // bnの範囲は [ -180° < bn ≦ 180° ] だから、範囲外なら±360°して調整する
    // 
    // cn = (cn-1) - (bn)　ただし、c0 = a0
    // 
    // 
    // Σcnを{cn}の和とすると、
    // 平均は、AVE = (Σcn) / 項数
    // AVEの範囲は [ 0° ≦ AVE < 360° ] だから、範囲外なら±360°して調整する
    an = []
    bn = []
    cn = []
    Σcn = 0
    // {an}にデータを格納する
    // 項数はnumber、末項はnumber-1
    for (let index = 0; index < 平均をとる数; index++) {
        // ここに
        // 測りたいデータを入れる！！
        an.push(磁力取得())
        basic.pause(20)
    }
    // b0 = 0° を格納する
    bn.push(0)
    // {bn} = (an) - (an-1) を格納する
    // 末項は n = 項数-1
    for (let カウンター = 0; カウンター <= 平均をとる数 - 2; カウンター++) {
        // カウンター = (項数 - 2) の時、
        // n = 項数-1 となる
        bn.push(an__an1(an[カウンター + 1], an[カウンター]))
    }
    // c0 = a0 を格納する
    cn.push(an[0])
    // {cn} = (cn-1) - (bn) を格納する
    // 末項は n = 項数-1
    for (let カウンター2 = 0; カウンター2 <= 平均をとる数 - 2; カウンター2++) {
        // カウンター = (項数 - 2) の時、
        // n = 項数-1 となる
        cn.push(cn[カウンター2] + bn[カウンター2 + 1])
    }
    // {cn}の和を Σcn に格納する
    for (let カウンター3 = 0; カウンター3 <= 平均をとる数 - 1; カウンター3++) {
        Σcn = cn[カウンター3] + Σcn
    }
    // (Σcn) / 項数 をAVEに格納する
    AVE = Σcn / 平均をとる数
    // AVEの範囲は [ 0° ≦ AVE < 360° ] だから、
    // 範囲外なら±360°して調整する
    while (!(0 <= AVE)) {
        AVE = AVE + 360
    }
    while (!(AVE < 360)) {
        AVE = AVE - 360
    }
    serial.writeLine("magnetic force" + ":" + AVE)
    磁力送信 = "magnetic force" + ":" + AVE
}
function DistanceInCentimeters (maxCmDistance: number, offset: number) {
    pins.digitalWritePin(DigitalPin.P8, 0)
    control.waitMicros(2)
    pins.digitalWritePin(DigitalPin.P8, 1)
    control.waitMicros(20)
    pins.digitalWritePin(DigitalPin.P8, 0)
    URS_time0 = input.runningTimeMicros()
    URS_echolength = pins.pulseIn(DigitalPin.P9, PulseValue.High)
    serial.writeLine("" + maxCmDistance * 58 + "      " + (input.runningTimeMicros() - URS_time0))
    if (maxCmDistance * 58 < input.runningTimeMicros() - URS_time0) {
        距離送信 = "OVER" + " , " + maxCmDistance
        return maxCmDistance
    }
    距離送信 = "Distance" + " , " + (Math.round(URS_echolength * 0.0172) + offset)
    return Math.round(URS_echolength * 0.0172) + offset
}
function 磁力取得 () {
    if (mag_x >= 0) {
        mag_x = input.magneticForce(Dimension.X) / 3.2872
    } else {
        mag_x = input.magneticForce(Dimension.X) / 2.37607
    }
    if (mag_y >= 0) {
        mag_y = input.magneticForce(Dimension.Y) / 2.3807
    } else {
        mag_y = input.magneticForce(Dimension.Y) / 2.4915
    }
    azimuth = Math.round(Math.atan2(mag_x, mag_y) * 57.29578)
    return _180θ180_を_0α360_に変換(azimuth)
}
let azimuth = 0
let mag_y = 0
let mag_x = 0
let URS_echolength = 0
let URS_time0 = 0
let AVE = 0
let Σcn = 0
let cn: number[] = []
let bn: number[] = []
let an: number[] = []
let anan1 = 0
let ピッチ角 = 0
let ロール角 = 0
let 加速度z = 0
let 加速度y = 0
let 加速度x = 0
let dst_duration = 0
let ピッチ角ロール角送信 = ""
let 加速度送信 = ""
let 磁力送信 = ""
let 距離送信 = ""
let 命令 = ""
let トリガー = 0
let 平均をとる数 = 0
let count = 0
bluetooth.startUartService()
count = 0
平均をとる数 = 5
トリガー = 0
basic.forever(function () {
	
})
