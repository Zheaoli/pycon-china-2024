import { defineMonacoSetup } from '@slidev/types'

export default defineMonacoSetup(() => {
    return {
      editorOptions:{
        fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
        // lightbulb: {
        //   enabled: true,
        // },
        // quickSuggestions: {
        //   other: true,
        //   comments: true,
        //   strings: true,
        // },
        // acceptSuggestionOnCommitCharacter: true,
        // acceptSuggestionOnEnter: 'on',
        // accessibilitySupport: 'on',
        scrollbar: {
            verticalScrollbarSize: 4, // 竖滚动条
            horizontalScrollbarSize: 10, // 横滚动条
            vertical: "visible",
        },
      }
    };
  });