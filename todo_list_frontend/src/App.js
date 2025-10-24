import Blits from '@lightningjs/blits'
import Home from './pages/Home.js'

// PUBLIC_INTERFACE
const App = Blits.Application({
  /**
   * Root Application for the Todo List using Ocean Professional theme.
   * Renders the RouterView and configures routes.
   */
  name: 'TodoApp',
  template: `
    <Element
      w="1920"
      h="1080"
      :color="$theme.background"
    >
      <!-- Background gradient overlay (subtle) -->
      <Element
        w="1920"
        h="1080"
        :color="$theme.background"
        :alpha="0.92"
      />
      <RouterView />
    </Element>
  `,
  routes: [
    { path: '/', component: Home, options: { cache: true } }
  ],
  state() {
    return {
      theme: {
        name: 'Ocean Professional',
        background: 0xf9fafbff, // #f9fafb
        surface: 0xffffffff,    // #ffffff
        text: 0x111827ff,       // #111827
        primary: 0x2563ebff,    // #2563EB
        secondary: 0xf59e0bff,  // #F59E0B
        error: 0xef4444ff,      // #EF4444
        shadow: 0x00000022
      }
    }
  }
})

export default App
