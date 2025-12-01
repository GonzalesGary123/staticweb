<template>
  <nav class="mb-8">
    <div class="flex flex-wrap items-center gap-3">
      <button
        type="button"
        @click="$emit('tab-change', 'post')"
        :class="[
          'group relative rounded-lg border px-6 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out',
          activeTab === 'post'
            ? theme === 'dark'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
              : 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : theme === 'dark'
              ? 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-700/50'
              : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500/50 hover:bg-slate-50',
        ]"
      >
        <span>Post Listing</span>
      </button>
      <button
        type="button"
        @click="$emit('tab-change', 'listings')"
        :class="[
          'group relative rounded-lg border px-6 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out',
          activeTab === 'listings'
            ? theme === 'dark'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
              : 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : theme === 'dark'
              ? 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-700/50'
              : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500/50 hover:bg-slate-50',
        ]"
      >
        <span>Marketplace</span>
      </button>
      <button
        v-if="currentUser?.isAdmin"
        type="button"
        @click="$emit('tab-change', 'admin')"
        :class="[
          'group relative rounded-lg border px-6 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out',
          activeTab === 'admin'
            ? theme === 'dark'
              ? 'border-amber-500 bg-amber-500/10 text-amber-300'
              : 'border-amber-500 bg-amber-50 text-amber-700'
            : theme === 'dark'
              ? 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-amber-500/50 hover:bg-slate-700/50'
              : 'border-slate-300 bg-white text-slate-700 hover:border-amber-500/50 hover:bg-slate-50',
        ]"
      >
        <span>Admin</span>
      </button>
      <button
        type="button"
        @click="$emit('tab-change', 'auth')"
        :class="[
          'group relative rounded-lg border px-6 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out',
          activeTab === 'auth'
            ? theme === 'dark'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
              : 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : theme === 'dark'
              ? 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-700/50'
              : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500/50 hover:bg-slate-50',
        ]"
      >
        <span>{{ currentUser ? 'Account' : 'Login / Register' }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">

defineProps<{
  activeTab: 'post' | 'listings' | 'auth' | 'admin';
  theme: 'dark' | 'light';
  currentUser: { id: number | string; email: string; fullName?: string; isAdmin?: boolean } | null;
}>();

defineEmits<{
  'tab-change': [tab: 'post' | 'listings' | 'auth' | 'admin'];
}>();
</script>

