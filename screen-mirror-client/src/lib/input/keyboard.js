  /**
       * KEYBOARD HANDLING
       *
       * This should be moved elsewhere, but due to shared dependencies and
       * elements it's currently here. So basically due to laziness.
       *
       * For now, try to keep the whole section as a separate unit as much
       * as possible.
       */
      ;(function() {
        function isChangeCharsetKey(e) {
          // Add any special key here for changing charset
          //console.log('e', e)

          // Chrome/Safari/Opera
          if (
            // Mac | Kinesis keyboard | Karabiner | Latin key, Kana key
          e.keyCode === 0 && e.keyIdentifier === 'U+0010' ||

            // Mac | MacBook Pro keyboard | Latin key, Kana key
          e.keyCode === 0 && e.keyIdentifier === 'U+0020' ||

            // Win | Lenovo X230 keyboard | Alt+Latin key
          e.keyCode === 246 && e.keyIdentifier === 'U+00F6' ||

            // Win | Lenovo X230 keyboard | Convert key
          e.keyCode === 28 && e.keyIdentifier === 'U+001C'
          ) {
            return true
          }

          // Firefox
          switch (e.key) {
            case 'Convert': // Windows | Convert key
            case 'Alphanumeric': // Mac | Latin key
            case 'RomanCharacters': // Windows/Mac | Latin key
            case 'KanjiMode': // Windows/Mac | Kana key
              return true
          }

          return false
        }

        function handleSpecialKeys(e) {
          if (isChangeCharsetKey(e)) {
            e.preventDefault()
            control.keyPress('switch_charset')
            return true
          }

          return false
        }

        function keydownListener(e) {
          // Prevent tab from switching focus to the next element, we only want
          // that to happen on the device side.
          if (e.keyCode === 9) {
            e.preventDefault()
          }
          control.keyDown(e.keyCode)
        }

        function keyupListener(e) {
          if (!handleSpecialKeys(e)) {
            control.keyUp(e.keyCode)
          }
        }

        function pasteListener(e) {
          // Prevent value change or the input event sees it. This way we get
          // the real value instead of any "\n" -> " " conversions we might see
          // in the input value.
          e.preventDefault()
          control.paste(e.clipboardData.getData('text/plain'))
        }

        function copyListener(e) {
          e.preventDefault()
          // This is asynchronous and by the time it returns we will no longer
          // have access to setData(). In other words it doesn't work. Currently
          // what happens is that on the first copy, it will attempt to fetch
          // the clipboard contents. Only on the second copy will it actually
          // copy that to the clipboard.
          control.getClipboardContent()
          if (control.clipboardContent) {
            e.clipboardData.setData('text/plain', control.clipboardContent)
          }
        }

        function inputListener() {
          // Why use the input event if we don't let it handle pasting? The
          // reason is that on latest Safari (Version 8.0 (10600.1.25)), if
          // you use the "Romaji" Kotoeri input method, we'll never get any
          // keypress events. It also causes us to lose the very first keypress
          // on the page. Currently I'm not sure if we can fix that one.
          control.type(this.value)
          this.value = ''
        }

        input.bind('keydown', keydownListener)
        input.bind('keyup', keyupListener)
        input.bind('input', inputListener)
        input.bind('paste', pasteListener)
        input.bind('copy', copyListener)
      })()