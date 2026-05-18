<script setup lang="ts">
import {
  accentThemeSwatches,
  currentAccentThemeName,
  isAccentThemeRailOpen,
  setAccentTheme
} from '../composables/useAccentTheme'
</script>

<template>
  <div
    class="fixed right-4 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center gap-3 transition-all duration-700"
    :class="isAccentThemeRailOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'"
  >
    <button
      type="button"
      @click="isAccentThemeRailOpen = !isAccentThemeRailOpen"
      class="absolute right-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-gray-900/80 dark:bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl hover:bg-gray-800 dark:hover:bg-black transition-all group flex items-center justify-center"
      aria-label="Toggle theme colors"
    >
      <svg
        class="w-5 h-5 text-white transition-transform duration-700"
        :class="isAccentThemeRailOpen ? 'rotate-180' : 'rotate-0'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <div
      class="flex flex-col gap-2 p-2.5 bg-gray-900/80 dark:bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-3xl max-h-[70vh] overflow-y-auto scrollbar-hide"
    >
      <button
        v-for="theme in accentThemeSwatches"
        :key="theme.name"
        type="button"
        @click="setAccentTheme(theme.name)"
        class="w-9 h-9 rounded-full border-2 transition-all duration-500 flex items-center justify-center group relative shrink-0"
        :class="[
          theme.swatchClass,
          currentAccentThemeName === theme.name
            ? 'border-white scale-110 shadow-lg shadow-white/20'
            : 'border-transparent hover:scale-105'
        ]"
        :aria-label="`Accent theme ${theme.name}`"
        :aria-pressed="currentAccentThemeName === theme.name"
      >
        <span
          class="absolute right-full mr-5 px-4 py-2 rounded-2xl bg-black/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap hidden lg:block translate-x-2 group-hover:translate-x-0"
        >
          {{ theme.name }}
        </span>
      </button>
    </div>
  </div>
</template>
