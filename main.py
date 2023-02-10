def 実行():
    global count
    if 命令 == "0" or 命令 == "1" or 命令 == "2" or 命令 == "3" or 命令 == "4" or 命令 == "5" or 命令 == "6":
        count = parse_float(命令)
    elif count == 0:
        pass
    elif count == 1:
        pass
    elif count == 2:
        pass
    elif count == 3:
        pass
    elif count == 4:
        pass
    elif count == 5:
        pass

def on_bluetooth_connected():
    music.play_tone(523, music.beat(BeatFraction.DOUBLE))
bluetooth.on_bluetooth_connected(on_bluetooth_connected)

def on_bluetooth_disconnected():
    music.play_tone(262, music.beat(BeatFraction.DOUBLE))
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)

def on_button_pressed_a():
    global count
    if count > 5:
        pass
    else:
        count += 1
        basic.show_string("" + str((count)))
input.on_button_pressed(Button.A, on_button_pressed_a)

def on_uart_data_received():
    global 命令
    命令 = bluetooth.uart_read_until(serial.delimiters(Delimiters.NEW_LINE))
    実行()
bluetooth.on_uart_data_received(serial.delimiters(Delimiters.NEW_LINE),
    on_uart_data_received)

def on_button_pressed_ab():
    global count
    count = 0
input.on_button_pressed(Button.AB, on_button_pressed_ab)

def on_button_pressed_b():
    global count
    実行()
    count = 0
input.on_button_pressed(Button.B, on_button_pressed_b)

命令 = ""
count = 0
bluetooth.start_uart_service()
count = 0

def on_forever():
    pass
basic.forever(on_forever)
