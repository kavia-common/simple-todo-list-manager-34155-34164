import Blits from '@lightningjs/blits'
import App from './App.js'

// Launch with key mappings for navigation and editing
Blits.Launch(App, 'app', {
  w: 1920,
  h: 1080,
  keys: {
    enter: 'Enter',
    back: 'Escape',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    up: 'ArrowUp',
    down: 'ArrowDown',
    // Additional editing keys
    delete: 'Delete',
    space: 'Space',
    // Characters are captured via inputChar event in Blits for text fields
  }
})
