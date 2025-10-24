import Blits from '@lightningjs/blits'
import TodoItem from '../components/TodoItem.js'
import { loadTodos, saveTodos, loadFilter, saveFilter, generateId } from '../store.js'

export default Blits.Component('Home', {
  components: { TodoItem },
  template: `
    <Element x="240" y="96" w="1440" h="888">
      <!-- Header -->
      <Element x="0" y="0" w="1440" h="100" :shader="$shaders.rounded" :color="$theme.surface">
        <Text x="24" y="24" :content="'Retro Todo Manager'" :color="$theme.text" />
        <Text x="24" y="60" :content="'Stay organized with style'" :color="0x6b7280ff" />
        <Element x="0" y="98" w="1440" h="2" :color="$theme.primary" :alpha="0.08" />
      </Element>

      <!-- Input Bar -->
      <Element x="0" y="120" w="1440" h="72" :color="$theme.surface" :shader="$shaders.rounded">
        <!-- Input text display -->
        <Text x="24" y="22" :content="$inputTextDisplay" :color="$theme.text" />
        <!-- Caret -->
        <Element :x="$inputCaretX" y="18" w="2" h="36" :color="$theme.primary" :alpha="$inputFocused ? 1 : 0" />
        <!-- Hint -->
        <Text x="24" y="22" :content="$placeholder" :color="0x9ca3afff" :alpha="$showPlaceholder ? 1 : 0" />
        <!-- Add button -->
        <Element x="1348" y="12" w="80" h="48" :shader="$shaders.roundedSmall" :color="$theme.primary" @enter="$addTodo">
          <Text x="14" y="10" :content="'+ Add'" :color="0xffffffff" />
        </Element>
      </Element>

      <!-- Filters -->
      <Element x="0" y="208" w="1440" h="56" :color="$theme.surface" :shader="$shaders.roundedSmall">
        <Element x="16" y="8" w="400" h="40">
          <Element :x="$filterX('all')" y="0" w="120" h="40" :shader="$shaders.roundedTiny" :color="$isFilter('all') ? $theme.primary : 0x00000000" @enter="$setFilterAll">
            <Text x="16" y="8" :content="'All'" :color="$isFilter('all') ? 0xffffffff : $theme.text" />
          </Element>
          <Element :x="$filterX('active')" y="0" w="120" h="40" :shader="$shaders.roundedTiny" :color="$isFilter('active') ? $theme.primary : 0x00000000" @enter="$setFilterActive">
            <Text x="16" y="8" :content="'Active'" :color="$isFilter('active') ? 0xffffffff : $theme.text" />
          </Element>
          <Element :x="$filterX('completed')" y="0" w="140" h="40" :shader="$shaders.roundedTiny" :color="$isFilter('completed') ? $theme.primary : 0x00000000" @enter="$setFilterCompleted">
            <Text x="16" y="8" :content="'Completed'" :color="$isFilter('completed') ? 0xffffffff : $theme.text" />
          </Element>
        </Element>

        <!-- Clear Completed -->
        <Element x="1240" y="8" w="184" h="40" :shader="$shaders.roundedTiny" :color="$clearBg" @enter="$clearCompleted">
          <Text x="16" y="8" :content="'Clear Completed'" :color="$clearTextColor" />
        </Element>
      </Element>

      <!-- List -->
      <Element x="0" y="276" w="1440" h="540" :color="$theme.surface" :shader="$shaders.rounded">
        <Element
          :for="(t, i) in $visibleTodos"
          :key="$t.id"
          :y="$i * 84"
          x="0" w="1440" h="72"
        >
          <TodoItem
            :todo="$t"
            :index="$i"
            :onToggle="$onToggle"
            :onDelete="$onDelete"
            :onEdit="$onEdit"
          />
          <Element x="0" :y="$i * 84 + 72" w="1440" h="2" :color="0x000000" :alpha="0.06" />
        </Element>
        <Text :alpha="$visibleTodos.length === 0 ? 1 : 0" x="24" y="20" :content="'No todos in this filter.'" :color="0x6b7280ff" />
      </Element>
    </Element>
  `,
  state() {
    const items = loadTodos()
    const filter = loadFilter()
    return {
      todos: items,
      filter,
      inputText: '',
      inputCaret: 0,
      inputFocused: true,
      shaders: {
        rounded: { type: 'Rounded', radius: 16 },
        roundedSmall: { type: 'Rounded', radius: 12 },
        roundedTiny: { type: 'Rounded', radius: 8 }
      }
    }
  },
  computed: {
    placeholder() {
      return 'Add a new task and press Enter'
    },
    showPlaceholder() {
      return !this.inputText
    },
    inputTextDisplay() {
      return this.inputText
    },
    inputCaretX() {
      const baseX = 24
      const charW = 12
      return baseX + (this.inputCaret * charW)
    },
    clearBg() {
      return this.completedCount > 0 ? this.$theme.secondary : 0x00000000
    },
    clearTextColor() {
      return this.completedCount > 0 ? 0xffffffff : 0x6b7280ff
    },
    visibleTodos() {
      if (this.filter === 'active') return this.todos.filter(t => !t.completed)
      if (this.filter === 'completed') return this.todos.filter(t => t.completed)
      return this.todos
    },
    completedCount() {
      return this.todos.filter(t => t.completed).length
    }
  },
  methods: {
    // PUBLIC_INTERFACE
    isFilter(name) {
      /** Check if filter is active */
      return this.filter === name
    },
    filterX(name) {
      if (name === 'all') return 16
      if (name === 'active') return 144
      return 272
    },
    setFilter(name) {
      this.filter = name
      saveFilter(name)
    },
    $setFilterAll() { this.setFilter('all') },
    $setFilterActive() { this.setFilter('active') },
    $setFilterCompleted() { this.setFilter('completed') },

    $onToggle: (id) => {
      const self = Blits.$ctx()
      const next = self.todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      self.todos = next
      saveTodos(next)
    },
    $onDelete: (id) => {
      const self = Blits.$ctx()
      const next = self.todos.filter(t => t.id !== id)
      self.todos = next
      saveTodos(next)
    },
    $onEdit: (id, text) => {
      const self = Blits.$ctx()
      const next = self.todos.map(t => t.id === id ? { ...t, text } : t)
      self.todos = next
      saveTodos(next)
    },

    moveCaretLeft() {
      if (this.inputCaret > 0) this.inputCaret--
    },
    moveCaretRight() {
      if (this.inputCaret < this.inputText.length) this.inputCaret++
    },
    addTodoInternal(text) {
      const trimmed = (text || '').trim()
      if (!trimmed) return
      const item = { id: generateId(), text: trimmed, completed: false }
      const next = [item, ...this.todos]
      this.todos = next
      saveTodos(next)
      this.inputText = ''
      this.inputCaret = 0
    },
    $addTodo() {
      this.addTodoInternal(this.inputText)
    },
    $clearCompleted() {
      this.clearCompleted()
    },
    clearCompleted() {
      const next = this.todos.filter(t => !t.completed)
      this.todos = next
      saveTodos(next)
    }
  },
  input: {
    up() {
      if (this.visibleTodos.length > 0) {
        const first = this.children?.find?.(c => c && c.name === 'TodoItem')
        if (first && first.focus) first.focus()
      }
    },
    enter() {
      this.$addTodo()
    },
    left() {
      this.moveCaretLeft()
    },
    right() {
      this.moveCaretRight()
    },
    back() {
      // no-op
    },
    inputChar(e) {
      const { char } = e || {}
      if (!char) return
      if (char === '\b') {
        if (this.inputCaret > 0) {
          this.inputText = this.inputText.slice(0, this.inputCaret - 1) + this.inputText.slice(this.inputCaret)
          this.inputCaret--
        }
      } else if (char.length === 1 && char >= ' ') {
        this.inputText = this.inputText.slice(0, this.inputCaret) + char + this.inputText.slice(this.inputCaret)
        this.inputCaret++
      }
    }
  }
})
