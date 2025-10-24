import Blits from '@lightningjs/blits'

export default Blits.Component('TodoItem', {
  /**
   * A single todo list item with toggle, edit, and delete.
   * Props:
   * - todo: { id, text, completed }
   * - index: number (for layout)
   * - onToggle(id)
   * - onDelete(id)
   * - onEdit(id, newText)
   */
  props: ['todo', 'index', 'onToggle', 'onDelete', 'onEdit'],
  template: `
    <Element
      :y="$index * 84"
      x="0"
      w="1440"
      h="72"
      :color="$colors.bg"
      :alpha="$hovered ? 1 : 0.98"
      :shader="$shaders.rounded"
    >
      <!-- subtle shadow -->
      <Element x="0" y="0" w="1440" h="72" :color="$theme.shadow" :alpha="0.1" />

      <!-- Checkbox -->
      <Element
        x="24" y="18" w="36" h="36"
        :color="$todo.completed ? $colors.primary : 0xffffffff"
        :shader="$shaders.roundedSmall"
        @enter="$toggle"
      >
        <Element
          x="8" y="8" w="20" h="20"
          :alpha="$todo.completed ? 1 : 0"
          :color="0xffffffff"
          :shader="$shaders.roundedTiny"
        />
      </Element>

      <!-- Text / Editor -->
      <Text
        x="80" y="22"
        :content="$displayText"
        :color="$todo.completed ? 0x6b7280ff : $theme.text"
        :alpha="$editing ? 0 : 1"
      />
      <!-- Caret for edit mode -->
      <Element
        :alpha="$editing ? 1 : 0"
        :x="$caretX" y="18" w="2" h="36"
        :color="$theme.primary"
      />

      <!-- Actions -->
      <Element x="1360" y="18" w="64" h="36" :alpha="$editing ? 0 : 1">
        <!-- Edit Button -->
        <Element
          x="0" y="0" w="30" h="36"
          :color="0x00000000"
          @enter="$startEdit"
        >
          <Text x="0" y="6" :content="'✎'" :color="$theme.secondary" />
        </Element>
        <!-- Delete Button -->
        <Element
          x="34" y="0" w="30" h="36"
          :color="0x00000000"
          @enter="$requestDelete"
        >
          <Text x="0" y="6" :content="'✕'" :color="$theme.error" />
        </Element>
      </Element>

      <!-- Focus ring -->
      <Element
        x="-2" y="-2" w="1444" h="76"
        :color="$theme.primary"
        :alpha="$focused && !$editing ? 0.15 : 0"
        :shader="$shaders.rounded"
      />
    </Element>
  `,
  state() {
    return {
      hovered: false,
      focused: false,
      editing: false,
      editText: '',
      caretIndex: 0,
      colors: {
        bg: 0xffffffff,
        primary: this.$theme.primary
      },
      shaders: {
        rounded: { type: 'Rounded', radius: 12 },
        roundedSmall: { type: 'Rounded', radius: 10 },
        roundedTiny: { type: 'Rounded', radius: 4 }
      }
    }
  },
  computed: {
    displayText() {
      if (this.editing) return this.editText
      return this.todo.text || ''
    },
    caretX() {
      // Approximate caret width by character count (monospace feel)
      const charW = 12
      const baseX = 80
      return baseX + (this.caretIndex * charW)
    }
  },
  methods: {
    // PUBLIC_INTERFACE
    focus() {
      /** Focus this todo item visually */
      this.focused = true
    },
    blur() {
      this.focused = false
    },
    $toggle() {
      if (this.onToggle) this.onToggle(this.todo.id)
    },
    $startEdit() {
      this.editing = true
      this.editText = this.todo.text
      this.caretIndex = this.editText.length
    },
    commitEdit() {
      const text = (this.editText || '').trim()
      if (!text) {
        // Empty text -> delete
        if (this.onDelete) this.onDelete(this.todo.id)
      } else {
        if (this.onEdit) this.onEdit(this.todo.id, text)
      }
      this.editing = false
    },
    cancelEdit() {
      this.editing = false
      this.editText = this.todo.text
      this.caretIndex = this.editText.length
    },
    $requestDelete() {
      if (this.onDelete) this.onDelete(this.todo.id)
    },
    handleChar(ch) {
      if (!this.editing) return
      this.editText = this.editText.slice(0, this.caretIndex) + ch + this.editText.slice(this.caretIndex)
      this.caretIndex++
    },
    handleBackspace() {
      if (!this.editing) return
      if (this.caretIndex > 0) {
        this.editText = this.editText.slice(0, this.caretIndex - 1) + this.editText.slice(this.caretIndex)
        this.caretIndex--
      }
    },
    handleDelete() {
      if (!this.editing) return
      if (this.caretIndex < this.editText.length) {
        this.editText = this.editText.slice(0, this.caretIndex) + this.editText.slice(this.caretIndex + 1)
      }
    },
    moveCaretLeft() {
      if (!this.editing) return
      this.caretIndex = Math.max(0, this.caretIndex - 1)
    },
    moveCaretRight() {
      if (!this.editing) return
      this.caretIndex = Math.min(this.editText.length, this.caretIndex + 1)
    }
  },
  input: {
    enter() {
      if (this.editing) {
        this.commitEdit()
      } else {
        this.$toggle()
      }
    },
    back() {
      if (this.editing) {
        this.cancelEdit()
      } else {
        // bubble up to parent for navigation
        this.parent && this.parent.focus && this.parent.focus()
      }
    },
    left() {
      this.moveCaretLeft()
    },
    right() {
      this.moveCaretRight()
    },
    delete() {
      if (this.editing) this.handleDelete()
    },
    // Character input event from Blits
    inputChar(e) {
      const { char } = e || {}
      if (!char) return
      if (char === '\b') this.handleBackspace()
      else if (char.length === 1 && char >= ' ') this.handleChar(char)
    }
  }
})
