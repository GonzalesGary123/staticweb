<template>
  <div
    :class="[
      'min-h-screen transition-colors duration-500 ease-in-out',
      theme === 'dark'
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-50 text-slate-900',
    ]"
  >
    <!-- Header -->
    <header class="border-b transition-colors duration-300 shadow-sm"
      :class="theme === 'dark' ? 'border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800' : 'border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white'">
      <div class="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-12 h-12 rounded-xl"
              :class="theme === 'dark' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-100 border border-emerald-200'">
              <span class="text-2xl">⚔️</span>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-colors duration-300"
                :class="theme === 'dark' 
                  ? 'from-emerald-400 to-teal-400' 
                  : 'from-emerald-600 to-teal-600'">
                PH Legends Marketplace
              </h1>
              <p class="mt-0.5 text-xs sm:text-sm font-medium transition-colors duration-300"
                :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                Buy & Sell Game Accounts • Secure & Trusted
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
          <button
            type="button"
              @click="toggleTheme"
            :class="[
                'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-emerald-500 hover:bg-slate-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:bg-slate-50',
              ]"
            >
              <span>{{ theme === 'dark' ? '🌙' : '☀️' }}</span>
              <span>{{ theme === 'dark' ? 'Dark' : 'Light' }}</span>
          </button>
          
          <!-- Notifications -->
          <div v-if="currentUser" class="relative notification-container">
            <button
              type="button"
              @click="toggleNotifications"
              :class="[
                'relative inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors duration-300',
                theme === 'dark'
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300',
              ]"
            >
              <span class="text-xl">🔔</span>
              <span
                v-if="unreadNotificationsCount > 0"
                class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                :class="theme === 'dark' ? 'bg-red-500' : 'bg-red-600'"
              >
                {{ unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount }}
              </span>
            </button>
            <div
              v-if="showNotifications"
              :class="[
                'absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border shadow-lg z-30 max-h-96 overflow-hidden',
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-900 text-slate-100'
                  : 'border-slate-200 bg-white text-slate-800',
              ]"
            >
              <div class="flex items-center justify-between p-4 border-b"
                :class="theme === 'dark' ? 'border-slate-700' : 'border-slate-200'">
                <h3 class="text-sm font-bold">Notifications</h3>
                <button
                  v-if="unreadNotificationsCount > 0"
                  type="button"
                  @click="markAllNotificationsAsRead"
                  class="text-xs text-emerald-500 hover:text-emerald-400"
                >
                  Mark all as read
                </button>
              </div>
              <div class="max-h-80 overflow-y-auto">
                <div v-if="loadingNotifications" class="p-6 text-center">
                  <div class="inline-block animate-spin text-2xl mb-2">⏳</div>
                  <p class="text-xs" :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                    Loading...
                  </p>
                </div>
                <div
                  v-else-if="!notifications.length"
                  class="p-8 text-center"
                >
                  <span class="text-3xl mb-2 block">📭</span>
                  <p class="text-xs" :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                    No notifications
                  </p>
                </div>
                <div v-else>
                  <button
                    v-for="notif in notifications"
                    :key="notif.id"
                    type="button"
                    @click="markNotificationAsRead(notif.id)"
                    :class="[
                      'w-full px-4 py-3 text-left border-b transition-colors duration-200',
                      notif.isRead
                        ? theme === 'dark'
                          ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800'
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                        : theme === 'dark'
                          ? 'border-slate-700 bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'border-slate-200 bg-emerald-50/50 hover:bg-emerald-100',
                    ]"
                  >
                    <div class="flex items-start gap-2">
                      <span class="text-lg">
                        {{ notif.type === 'approved' ? '✅' : notif.type === 'rejected' ? '❌' : notif.type === 'sold' ? '💰' : '⏳' }}
                      </span>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <p class="text-xs font-semibold truncate"
                            :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-900'">
                            {{ notif.title }}
                          </p>
                          <span
                            v-if="!notif.isRead"
                            class="h-2 w-2 rounded-full flex-shrink-0"
                            :class="theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600'"
                          ></span>
                        </div>
                        <p class="text-xs leading-relaxed"
                          :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                          {{ notif.message }}
                        </p>
                        <p class="text-xs mt-1"
                          :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-500'">
                          {{ formatNotificationTime(notif.createdAt) }}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

            <div v-if="currentUser" class="relative">
              <button
                type="button"
                @click="showUserMenu = !showUserMenu"
                :class="[
                  'hidden sm:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors duration-300',
                  theme === 'dark'
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
                ]"
              >
                <span>👤</span>
                <span>{{ currentUser.fullName || currentUser.email }}</span>
                <span>▾</span>
              </button>
              <div
                v-if="showUserMenu"
                :class="[
                  'absolute right-0 mt-2 w-44 rounded-lg border py-1 text-sm z-20 shadow-lg',
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-slate-200 bg-white text-slate-800',
                ]"
              >
                <button
                  type="button"
                  @click="showUserMenu = false; setTab('auth')"
                  :class="[
                    'block w-full px-4 py-2 text-left hover:bg-emerald-500/10',
                    theme === 'dark' ? 'hover:text-emerald-300' : 'hover:text-emerald-700',
                  ]"
                >
                  Profile
                </button>
                <button
                  type="button"
                  @click="showUserMenu = false; logout()"
                  :class="[
                    'block w-full px-4 py-2 text-left hover:bg-red-500/10',
                    theme === 'dark' ? 'hover:text-red-300' : 'hover:text-red-700',
                  ]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Navigation Component -->
      <AppNavigation 
        :active-tab="activeTab"
        :theme="theme"
        :current-user="currentUser"
        @tab-change="setTab"
      />

      <!-- Login Required Message -->
      <div
        v-if="activeTab === 'post' && !currentUser"
            :class="[
          'rounded-lg border p-8 text-center',
          theme === 'dark'
            ? 'border-slate-700 bg-slate-900'
            : 'border-slate-200 bg-white',
        ]"
      >
        <div class="max-w-md mx-auto">
          <div class="text-5xl mb-4">🔐</div>
          <h2 class="text-2xl font-bold mb-2"
            :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
            Login Required
          </h2>
          <p class="text-sm mb-6"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
            You need to be logged in to post listings on our marketplace.
          </p>
          <button
            type="button"
            @click="setTab('auth')"
            :class="[
              'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white transition-all duration-300 ease-in-out',
              'bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02]',
            ]"
          >
            Login or Register
          </button>
        </div>
      </div>

      <form
        v-if="activeTab === 'post' && currentUser"
        :class="[
          'space-y-8 p-8 rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-700/50 shadow-slate-900/50'
            : 'bg-white/90 border-slate-200 shadow-slate-200/50',
        ]"
        @submit.prevent="onSubmit"
      >
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold mb-2"
            :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
            Create Your Listing
          </h2>
          <p class="text-sm"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
            Share your account details and connect with buyers
          </p>
          <p class="text-xs mt-2"
            :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-500'">
            Logged in as: <span class="font-semibold text-emerald-400">{{ currentUser.fullName || currentUser.email }}</span>
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>Character Nickname *</span>
            </label>
            <input
              v-model="form.nickname"
              type="text"
              required
              placeholder="Enter character name"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>Server *</span>
            </label>
            <input
              v-model="form.server"
              type="text"
              required
              placeholder="e.g. Asia-1, Europe-2"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>Growth Power *</span>
            </label>
            <input
              v-model="form.growthPower"
              type="number"
              min="0"
              required
              placeholder="Enter GP value"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>Asking Price (USD) *</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              v-model="form.askingPrice"
              type="number"
              min="0"
              step="0.01"
              required
                placeholder="0.00"
                :class="[
                  'w-full rounded-lg border pl-8 pr-4 py-3 text-sm transition-all duration-300 ease-in-out',
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                ]"
              />
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <label class="flex items-center gap-2 text-sm font-semibold"
            :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
            <span>Character Class *</span>
          </label>
          <p class="text-xs"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-500'">
            Choose your character's primary class
          </p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label
              v-for="className in classOptions"
              :key="className"
              :class="[
                'group relative flex flex-col items-center justify-center gap-2 rounded-lg border px-4 py-4 text-sm font-medium cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02]',
                selectedClass === className
                  ? theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 '
                    : 'border-emerald-500 bg-emerald-50 text-emerald-700 '
                  : theme === 'dark'
                    ? 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-emerald-500/50'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-500/50',
              ]"
            >
              <input
                v-model="selectedClass"
                type="radio"
                name="class"
                :value="className"
                class="sr-only"
              />
              <span class="text-2xl">{{ getClassIcon(className) }}</span>
              <span>{{ className }}</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>Contact Link</span>
            </label>
            <input  
              v-model="form.contactLink"
              type="url"
              placeholder="Social media link"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>Contact Number *</span>
            </label>
            <input
              v-model="form.contactNumber"
              type="tel"
              inputmode="tel"
              pattern="^[0-9+()\s-]{7,20}$"
              required
              placeholder="+63 999-123-4567"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>

          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>Middleman *</span>
            </label>
            <select
              v-model="form.middlemanId"
              required
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            >
              <option value="" disabled>Select a middleman</option>
              <option
                v-for="middleman in middlemen"
                :key="middleman.id"
                :value="middleman.id"
              >
                {{ middleman.name }} ({{ middleman.email }})
              </option>
            </select>
            <p v-if="middlemen.length === 0" class="text-xs text-amber-500">
              ⚠️ No middlemen available. Please contact an admin to add middlemen.
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <label class="flex items-center gap-2 text-sm font-semibold"
            :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
            <span>Account Screenshots</span>
          </label>
          <p class="text-xs"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-500'">
            Upload up to 5 screenshots (max 5MB each) of your character, inventory, stats, and other important details
          </p>
          <div
            :class="[
              'relative rounded-lg border-2 border-dashed p-6 transition-all duration-300 ease-in-out',
              theme === 'dark'
                ? 'border-slate-700 bg-slate-800/30 hover:border-emerald-500/50'
                : 'border-slate-300 bg-slate-50 hover:border-emerald-500/50',
            ]"
          >
          <input
            type="file"
            multiple
            accept="image/*"
              :class="[
                'block w-full text-sm cursor-pointer',
                theme === 'dark' ? 'text-slate-200' : 'text-slate-700',
                'file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-3',
                'file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-500',
                'file:transition-all file:duration-200 file:cursor-pointer',
              ]"
            @change="handleImagesChange"
          />
            <p class="mt-2 text-xs text-center"
              :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-400'">
              PNG, JPG, WebP, GIF up to 5MB each (max 5 images)
            </p>
          </div>

          <div v-if="imagePreviews.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <div
              v-for="(src, index) in imagePreviews"
              :key="index"
              :class="[
                'group relative overflow-hidden rounded-lg border transition-all duration-300 ease-in-out hover:scale-[1.02]',
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/50'
                  : 'border-slate-300 bg-white',
              ]"
            >
              <img :src="src" alt="Account image preview" class="h-40 w-full object-cover" />
              <button
                type="button"
                @click="removeImage(index)"
                :class="[
                  'absolute top-2 right-2 rounded-full p-1.5 opacity-0 transition-opacity group-hover:opacity-100',
                  theme === 'dark'
                    ? 'bg-red-600/80 text-white hover:bg-red-500'
                    : 'bg-red-500 text-white hover:bg-red-600',
                ]"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div v-if="error" 
          :class="[
              'rounded-lg border p-4 transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'border-red-500/50 bg-red-500/10 text-red-300'
              : 'border-red-300 bg-red-50 text-red-700',
          ]">
          <p class="text-sm font-medium flex items-center gap-2">
            <span>{{ error }}</span>
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t"
          :class="theme === 'dark' ? 'border-slate-700' : 'border-slate-200'">
          <button
            type="submit"
            :disabled="submitting"
            :class="[
              'inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 text-base font-bold text-white shadow-md transition-all duration-300 ease-in-out',
              'bg-emerald-600 hover:bg-emerald-500',
              'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-emerald-600',
              'hover:scale-[1.02] active:scale-[0.98]',
            ]"
          >
            <span v-if="!submitting">Post Listing</span>
            <span v-else class="flex items-center gap-2">
              <span class="animate-spin">⏳</span>
              <span>Submitting...</span>
            </span>
          </button>

          <!-- <p class="text-xs text-center"
            :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-400'">
            💾 Your listing will be saved securely
          </p> -->
        </div>
      </form>

      <section
        v-if="activeTab === 'post' && submittedListing"
        :class="[
          'mt-8 rounded-lg border p-8 shadow-lg transition-all duration-300 ease-in-out',
          theme === 'dark'
            ? 'border-emerald-500/50 bg-emerald-500/10'
            : 'border-emerald-300 bg-emerald-50/80',
        ]"
      >
        <div class="flex items-center gap-3 mb-6">
          <span class="text-3xl">✅</span>
          <h2 class="text-2xl font-bold"
            :class="theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'">
            Listing Submitted Successfully!
          </h2>
          <p class="text-sm mt-2"
            :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">
            Your listing is pending approval and will appear in the marketplace once approved by an admin. You'll receive a notification when your listing is reviewed!
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="font-semibold"
              :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">👤 Nickname:</span>
            <span :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-900'">{{ submittedListing.nickname }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold"
              :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">🌐 Server:</span>
            <span :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-900'">{{ submittedListing.server }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold"
              :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">⚡ Growth Power:</span>
            <span :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-900'">{{ submittedListing.growthPower }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold"
              :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">💰 Price:</span>
            <span class="text-emerald-400 font-bold">${{ submittedListing.askingPrice }}</span>
          </div>
          <div v-if="submittedListing.classesList.length" class="flex items-center gap-2">
            <span class="font-semibold"
              :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">⚔️ Class:</span>
            <span :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-900'">{{ submittedListing.classesList.join(", ") }}</span>
          </div>
          <div v-if="submittedListing.contactLink" class="flex items-center gap-2">
            <span class="font-semibold"
              :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">🔗 Contact:</span>
            <a
              :href="submittedListing.contactLink"
              target="_blank"
              rel="noopener noreferrer"
              class="text-emerald-400 underline hover:text-emerald-300 transition-colors"
            >
              View Link
            </a>
          </div>
        </div>

        <div v-if="submittedListing.images.length" class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div
            v-for="(src, index) in submittedListing.images"
            :key="index"
            :class="[
              'overflow-hidden rounded-lg border transition-all duration-300 ease-in-out',
              theme === 'dark'
                ? 'border-slate-700 bg-slate-800/50'
                : 'border-slate-300 bg-white',
            ]"
          >
            <img :src="src" alt="Listing image" class="h-40 w-full object-cover" />
          </div>
        </div>
      </section>

      <section
        v-if="activeTab === 'listings'"
        class="space-y-6"
      >
        <!-- Hero Section with Stats -->
        <div class="relative overflow-hidden rounded-2xl border p-8 sm:p-10 mb-8"
          :class="theme === 'dark' 
            ? 'border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
            : 'border-slate-200 bg-gradient-to-br from-white via-emerald-50/30 to-white'">
          <div 
            class="absolute inset-0 opacity-5"
            :style="theme === 'dark' 
              ? { backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }
              : { backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '20px 20px' }"
          >
          </div>
          <div class="relative">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
              <div>
                <h2 class="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent"
                  :class="theme === 'dark' 
                    ? 'from-emerald-400 to-teal-400' 
                    : 'from-emerald-600 to-teal-600'">
                  Marketplace
                </h2>
                <p class="text-base"
                  :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">
                  Browse premium Legends of Ymir accounts for sale
                </p>
              </div>
              <button
                v-if="currentUser"
                type="button"
                @click="setTab('post')"
                :class="[
                  'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out shadow-lg',
                  'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.02] hover:shadow-xl',
                ]"
              >
                <span>➕</span>
                <span>Post New Listing</span>
              </button>
              <button
                v-else
                type="button"
                @click="setTab('auth')"
                :class="[
                  'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out shadow-lg',
                  'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.02] hover:shadow-xl',
                ]"
              >
                <span>🔐</span>
                <span>Login to Sell</span>
              </button>
            </div>
            
            <!-- Stats -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="rounded-xl p-4 border backdrop-blur-sm"
                :class="theme === 'dark' 
                  ? 'border-slate-700/50 bg-slate-800/50' 
                  : 'border-slate-200/50 bg-white/70'">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    :class="theme === 'dark' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-emerald-100 text-emerald-600'">
                    📦
                  </div>
                  <div>
                    <p class="text-2xl font-bold"
                      :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
                      {{ listings.length }}
                    </p>
                    <p class="text-xs"
                      :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                      Total Listings
                    </p>
                  </div>
                </div>
              </div>
              <div class="rounded-xl p-4 border backdrop-blur-sm"
                :class="theme === 'dark' 
                  ? 'border-slate-700/50 bg-slate-800/50' 
                  : 'border-slate-200/50 bg-white/70'">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    :class="theme === 'dark' 
                      ? 'bg-teal-500/20 text-teal-400' 
                      : 'bg-teal-100 text-teal-600'">
                    ✅
                  </div>
                  <div>
                    <p class="text-2xl font-bold"
                      :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
                      {{ listings.filter(l => l.status === 'approved').length }}
                    </p>
                    <p class="text-xs"
                      :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                      Available Now
                    </p>
                  </div>
                </div>
              </div>
              <div class="rounded-xl p-4 border backdrop-blur-sm"
                :class="theme === 'dark' 
                  ? 'border-slate-700/50 bg-slate-800/50' 
                  : 'border-slate-200/50 bg-white/70'">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    :class="theme === 'dark' 
                      ? 'bg-amber-500/20 text-amber-400' 
                      : 'bg-amber-100 text-amber-600'">
                    👥
                  </div>
                  <div>
                    <p class="text-2xl font-bold"
                      :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
                      {{ currentUser ? 'Active' : 'Join' }}
                    </p>
                    <p class="text-xs"
                      :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                      Community
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div
          v-if="!loadingListings && !listingsError && listings.length"
          :class="[
            'mb-6 rounded-xl border p-5 sm:p-6 transition-all duration-300 ease-in-out shadow-sm',
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800/60 backdrop-blur-sm'
              : 'border-slate-200 bg-white shadow-md',
          ]"
        >
          <div class="flex items-center justify-between gap-3 mb-4">
            <h3
              class="text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-800'"
            >
              Filters
            </h3>
            <button
              type="button"
              @click="resetFilters"
              class="text-xs font-medium underline decoration-dashed decoration-slate-500/60"
              :class="
                theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              "
            >
              Reset
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="space-y-2">
              <label
                class="flex items-center gap-2 text-xs font-semibold"
                :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'"
              >
                <span>Server</span>
              </label>
              <input
                v-model="filters.server"
                type="text"
                placeholder="Any server"
                :class="[
                  'w-full rounded-lg border px-3 py-2 text-xs sm:text-sm transition-all duration-300 ease-in-out',
                  theme === 'dark'
                    ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                ]"
              />
            </div>

            <div class="space-y-2">
              <label
                class="flex items-center gap-2 text-xs font-semibold"
                :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'"
              >
                <span>Class</span>
              </label>
              <select
                v-model="filters.className"
                :class="[
                  'w-full rounded-lg border px-3 py-2 text-xs sm:text-sm transition-all duration-300 ease-in-out',
                  theme === 'dark'
                    ? 'border-slate-600 bg-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                ]"
              >
                <option value="">All classes</option>
                <option
                  v-for="className in classOptions"
                  :key="className"
                  :value="className"
                >
                  {{ className }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label
                class="flex items-center gap-2 text-xs font-semibold"
                :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'"
              >
                <span>Price (USD)</span>
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model="filters.minPrice"
                  type="number"
                  min="0"
                  placeholder="Min"
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-xs sm:text-sm transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  ]"
                />
                <span
                  class="text-xs text-slate-500"
                  :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-400'"
                >
                  -
                </span>
                <input
                  v-model="filters.maxPrice"
                  type="number"
                  min="0"
                  placeholder="Max"
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-xs sm:text-sm transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  ]"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label
                class="flex items-center gap-2 text-xs font-semibold"
                :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'"
              >
                <span>Growth Power</span>
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model="filters.minGrowthPower"
                  type="number"
                  min="0"
                  placeholder="Min"
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-xs sm:text-sm transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  ]"
                />
                <span
                  class="text-xs text-slate-500"
                  :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-400'"
                >
                  -
                </span>
                <input
                  v-model="filters.maxGrowthPower"
                  type="number"
                  min="0"
                  placeholder="Max"
                  :class="[
                    'w-full rounded-lg border px-3 py-2 text-xs sm:text-sm transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  ]"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label
                class="flex items-center gap-2 text-xs font-semibold"
                :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'"
              >
                <span>Status</span>
              </label>
              <select
                v-model="filters.soldStatus"
                :class="[
                  'w-full rounded-lg border px-3 py-2 text-xs sm:text-sm transition-all duration-300 ease-in-out',
                  theme === 'dark'
                    ? 'border-slate-600 bg-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                ]"
              >
                <option value="">All (Sold & Unsold)</option>
                <option value="unsold">Available Only</option>
                <option value="sold">Sold Only</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="loadingListings" class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-sm"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
          Loading listings...
        </p>
        </div>

        <div v-if="listingsError"
          :class="[
            'rounded-lg border p-6 text-center transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'border-red-500/50 bg-red-500/10 text-red-300'
              : 'border-red-300 bg-red-50 text-red-700',
          ]">
          <p class="text-sm font-medium">⚠️ {{ listingsError }}</p>
        </div>

        <div
          v-if="!loadingListings && !listingsError && !listings.length"
          :class="[
            'rounded-lg border p-12 text-center transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800/50'
              : 'border-slate-300 bg-white',
          ]"
        >
          <span class="text-5xl mb-4 block">📭</span>
          <p class="text-sm font-medium"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
            No listings available yet. Be the first to post!
          </p>
        </div>

        <div
          v-if="
            !loadingListings &&
            !listingsError &&
            listings.length &&
            !filteredListings.length
          "
          :class="[
            'rounded-lg border p-12 text-center transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800/50'
              : 'border-slate-300 bg-white',
          ]"
        >
          <span class="text-5xl mb-4 block">🔎</span>
          <p
            class="text-sm font-medium"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
          >
            No listings match your filters. Try adjusting or resetting them.
          </p>
        </div>

        <!-- Listing Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="item in filteredListings"
          :key="item.id"
          @click="openListingModal(item)"
          :class="[
              'group relative rounded-xl border overflow-hidden transition-all duration-300 ease-in-out',
              item.status === 'sold' 
                ? 'cursor-not-allowed opacity-75'
                : 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl',
            theme === 'dark'
                ? item.status === 'sold'
                  ? 'border-slate-700/50 bg-slate-800/40'
                  : 'border-slate-700/50 bg-slate-800/60 hover:border-emerald-500/50 hover:shadow-emerald-500/10'
                : item.status === 'sold'
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-emerald-500/50 hover:shadow-xl',
            ]"
          >
            <!-- Status Badge -->
            <div v-if="item.status === 'sold'" class="absolute top-3 right-3 z-10">
              <span class="text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                :class="theme === 'dark' 
                  ? 'bg-red-600/90 text-white border border-red-500'
                  : 'bg-red-600 text-white border border-red-700'">
                SOLD
              </span>
            </div>

            <!-- Image Gallery -->
            <div
              v-if="item.images.length"
              class="relative h-48 overflow-hidden bg-gradient-to-br"
              :class="theme === 'dark' 
                ? 'from-slate-800 to-slate-900' 
                : 'from-slate-100 to-slate-200'">
              <img 
                :src="item.images[0]" 
                :alt="item.nickname"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div v-if="item.images.length > 1" class="absolute bottom-2 right-2">
                <span class="px-2 py-1 text-xs font-semibold rounded backdrop-blur-sm"
                  :class="theme === 'dark' 
                    ? 'bg-black/50 text-white' 
                    : 'bg-white/80 text-slate-900'">
                  +{{ item.images.length - 1 }} more
                </span>
              </div>
            </div>
            <div
              v-else
              class="relative h-48 flex items-center justify-center bg-gradient-to-br"
              :class="theme === 'dark' 
                ? 'from-slate-800 to-slate-900' 
                : 'from-slate-100 to-slate-200'">
              <span class="text-5xl opacity-30">⚔️</span>
            </div>

            <!-- Card Content -->
            <div class="p-5">
              <!-- Header -->
              <div class="mb-3">
                <h3 class="text-lg font-bold mb-2 line-clamp-1"
                  :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
                  {{ item.nickname }}
                </h3>
                <div class="flex items-center gap-2 text-xs mb-2"
                  :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                  <span class="inline-flex items-center gap-1">
                    <span>🌐</span>
                    <span>{{ item.server }}</span>
                  </span>
                  <span>•</span>
                  <span class="inline-flex items-center gap-1">
                    <span>⚡</span>
                    <span>{{ item.growthPower }} GP</span>
                  </span>
                </div>
              </div>

              <!-- Class badges -->
              <div v-if="item.classesList.length" class="flex flex-wrap gap-1.5 mb-4">
                <span
                  v-for="className in item.classesList.slice(0, 3)"
                  :key="className"
                  :class="[
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                    theme === 'dark'
                      ? 'bg-slate-700/60 text-slate-300 border border-slate-600/50'
                      : 'bg-slate-100 text-slate-700 border border-slate-300',
                  ]"
                >
                  <span>{{ getClassIcon(className) }}</span>
                  <span>{{ className }}</span>
                </span>
                <span
                  v-if="item.classesList.length > 3"
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                    theme === 'dark'
                      ? 'bg-slate-700/60 text-slate-400 border border-slate-600/50'
                      : 'bg-slate-100 text-slate-600 border border-slate-300',
                  ]"
                >
                  +{{ item.classesList.length - 3 }}
                </span>
              </div>

              <!-- Price -->
              <div class="mb-4 pt-4 border-t"
                :class="theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200'">
                <div class="flex items-baseline justify-between">
                  <span class="text-xs font-medium"
                    :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                    Price
                  </span>
                  <div class="flex items-baseline gap-1">
                    <span 
                      v-if="item.status === 'sold'"
                      class="text-base font-bold line-through"
                      :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-400'">
                      ${{ item.askingPrice }}
                    </span>
                    <span 
                      v-else
                      class="text-2xl font-bold"
                      :class="theme === 'dark' 
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'">
                      ${{ item.askingPrice }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <div class="space-y-2">
                <div
                  v-if="item.status === 'sold'"
                  :class="[
                    'w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold cursor-not-allowed',
                    theme === 'dark'
                      ? 'bg-slate-700/50 text-slate-500 border border-slate-700'
                      : 'bg-slate-200 text-slate-500 border border-slate-300',
                  ]"
                  @click.stop
                >
                  <span>❌</span>
                  <span>Sold Out</span>
                </div>
                <!-- Show middleman contact if listing has middleman, otherwise show seller contact -->
                <a
                  v-if="item.middleman && !shouldShowSellerContact(item)"
                  :href="item.middleman.link || `mailto:${item.middleman.email}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop
                  :class="[
                    'w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out shadow-md',
                    'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:scale-[1.02]',
                  ]"
                >
                  <span>💼</span>
                  <span>Contact Middleman</span>
                </a>
                <a
                  v-else-if="shouldShowSellerContact(item) && item.contactLink"
                  :href="item.contactLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop
                  :class="[
                    'w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out shadow-md',
                    'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:scale-[1.02]',
                  ]"
                >
                  <span>💬</span>
                  <span>Contact Seller</span>
                </a>
                <button
                  v-else
                  type="button"
                  @click.stop="openListingModal(item)"
                  :class="[
                    'w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out shadow-md',
                    'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:scale-[1.02]',
                  ]"
                >
                  <span>👁️</span>
                  <span>View Details</span>
                </button>
                <!-- Show middleman email if listing has middleman and user is not the middleman -->
                <div 
                  v-if="item.status !== 'sold' && item.middleman && !shouldShowSellerContact(item)"
                  class="flex items-center justify-center gap-2 text-xs pt-1"
                  :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-600'">
                  <span>💼</span>
                  <span>{{ item.middleman.name }} - {{ item.middleman.email }}</span>
                </div>
                <!-- Show seller contact info only if no middleman or user is the assigned middleman -->
                <div 
                  v-else-if="item.status !== 'sold' && shouldShowSellerContact(item) && item.contactNumber"
                  class="flex flex-col items-center justify-center gap-1 text-xs pt-1"
                  :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-600'">
                  <div class="flex items-center gap-2">
                    <span>📞</span>
                    <span>{{ item.contactNumber }}</span>
                  </div>
                  <div v-if="item.contactLink" class="flex items-center gap-2">
                    <span>🔗</span>
                    <a :href="item.contactLink" target="_blank" rel="noopener noreferrer"
                      class="text-emerald-500 hover:text-emerald-400 underline text-xs">
                      Contact Link
                    </a>
                  </div>
                </div>
                <div class="flex items-center justify-center gap-2 text-xs pt-1"
                  :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-600'">
                  <span>🕒</span>
                  <span>{{ new Date(item.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        v-if="showListingModal && selectedListing"
        class="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-6"
      >
        <div
          class="absolute inset-0 bg-black/60"
          @click="closeListingModal"
        ></div>
        <div
          :class="[
            'relative z-50 w-full max-w-2xl rounded-2xl shadow-2xl border p-6 sm:p-8 max-h-[90vh] overflow-y-auto',
            theme === 'dark'
              ? 'bg-slate-900 border-slate-700 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900',
          ]"
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-2xl font-bold">
                  {{ selectedListing.nickname }}
                </h3>
                <span
                  v-if="selectedListing.status === 'sold'"
                  class="text-xs font-semibold px-3 py-1 rounded"
                  :class="theme === 'dark' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-red-100 text-red-700 border border-red-200'">
                  SOLD
                </span>
              </div>
              <p
                class="text-xs"
                :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
              >
                Posted {{ new Date(selectedListing.createdAt).toLocaleString() }}
              </p>
            </div>
            <button
              type="button"
              @click="closeListingModal"
              :class="[
                'rounded-full p-2 text-sm font-semibold transition-colors',
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200',
              ]"
            >
              ✕
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
            <div class="space-y-1">
              <div class="font-semibold">Server</div>
              <div
                :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-800'"
              >
                🌐 {{ selectedListing.server }}
              </div>
            </div>
            <div class="space-y-1">
              <div class="font-semibold">Growth Power</div>
              <div
                :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-800'"
              >
                ⚡ {{ selectedListing.growthPower }}
              </div>
            </div>
            <div class="space-y-1">
              <div class="font-semibold">Asking Price</div>
              <div 
                :class="[
                  'font-bold text-lg',
                  selectedListing.status === 'sold'
                    ? theme === 'dark' 
                      ? 'text-slate-500 line-through'
                      : 'text-slate-400 line-through'
                    : 'text-emerald-400'
                ]">
                ${{ selectedListing.askingPrice }}
              </div>
            </div>
            <div v-if="selectedListing.classesList.length" class="space-y-1">
              <div class="font-semibold">Class</div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="className in selectedListing.classesList"
                  :key="className"
                  :class="[
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                    theme === 'dark'
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'bg-slate-100 text-slate-800 border border-slate-300',
                  ]"
                >
                  <span>{{ getClassIcon(className) }}</span>
                  <span>{{ className }}</span>
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="selectedListing.images.length"
            class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            <div
              v-for="(src, index) in selectedListing.images"
              :key="index"
              :class="[
                'overflow-hidden rounded-lg border cursor-zoom-in',
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-900'
                  : 'border-slate-200 bg-slate-50',
              ]"
              @click="openImagePreview(src)"
            >
              <img :src="src" alt="Listing image" class="h-32 w-full object-cover" />
            </div>
          </div>

          <div
            class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <!-- Show middleman info if listing has middleman and user is not the middleman -->
            <div
              v-if="selectedListing.status !== 'sold' && selectedListing.middleman && !shouldShowSellerContact(selectedListing)"
              class="flex flex-col gap-2"
            >
              <div class="flex items-center gap-2 text-sm"
                :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">
                <span>💼</span>
                <span class="font-semibold">{{ selectedListing.middleman.name }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm"
                :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                <span>📧</span>
                <span>{{ selectedListing.middleman.email }}</span>
              </div>
              <a
                v-if="selectedListing.middleman.link"
                :href="selectedListing.middleman.link"
                target="_blank"
                rel="noopener noreferrer"
                class="text-emerald-500 hover:text-emerald-400 underline text-sm"
              >
                {{ selectedListing.middleman.link }}
              </a>
            </div>
            <!-- Show seller contact info only if no middleman or user is the assigned middleman -->
            <div
              v-else-if="selectedListing.status !== 'sold' && shouldShowSellerContact(selectedListing)"
              class="flex flex-col gap-2"
            >
              <div class="flex items-center gap-2 text-sm"
                :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">
                <span>📞</span>
                <span>{{ selectedListing.contactNumber }}</span>
              </div>
              <div v-if="selectedListing.contactLink" class="flex items-center gap-2 text-sm"
                :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                <span>🔗</span>
                <a :href="selectedListing.contactLink" target="_blank" rel="noopener noreferrer"
                  class="text-emerald-500 hover:text-emerald-400 underline">
                  {{ selectedListing.contactLink }}
                </a>
              </div>
            </div>
            <div
              v-else-if="selectedListing.status === 'sold'"
              class="flex items-center gap-2 text-sm"
              :class="theme === 'dark' ? 'text-red-400' : 'text-red-600'"
            >
              <span>❌</span>
              <span>This account has been sold</span>
            </div>
            <!-- Contact buttons -->
            <a
              v-if="selectedListing.status !== 'sold' && selectedListing.middleman && !shouldShowSellerContact(selectedListing)"
              :href="selectedListing.middleman.link || `mailto:${selectedListing.middleman.email}`"
              target="_blank"
              rel="noopener noreferrer"
              :class="[
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold',
                'bg-blue-600 text-white hover:bg-blue-500',
              ]"
            >
              <span>💼</span>
              <span>Contact Middleman</span>
            </a>
            <a
              v-else-if="selectedListing.status !== 'sold' && shouldShowSellerContact(selectedListing) && selectedListing.contactLink"
              :href="selectedListing.contactLink"
              target="_blank"
              rel="noopener noreferrer"
              :class="[
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold',
                'bg-emerald-600 text-white hover:bg-emerald-500',
              ]"
            >
              <span>💬</span>
              <span>Contact Seller</span>
            </a>
            <div
              v-else-if="selectedListing.status !== 'sold' && shouldShowSellerContact(selectedListing) && !selectedListing.contactLink && selectedListing.contactNumber"
              class="text-sm"
              :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
            >
              Use contact number above to reach seller
            </div>
            <div
              v-else-if="selectedListing.status === 'sold'"
              :class="[
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold',
                theme === 'dark'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed',
              ]"
            >
              <span>❌</span>
              <span>Sold</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="previewImage"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 bg-black/80"
      >
        <div
          class="absolute inset-0"
          @click="closeImagePreview"
        ></div>
        <div class="relative z-10 max-w-4xl max-h-[90vh]">
          <img
            :src="previewImage"
            alt="Preview image"
            class="max-h-[90vh] w-auto max-w-full rounded-xl shadow-2xl"
          />
          <button
            type="button"
            @click="closeImagePreview"
            :class="[
              'absolute -top-3 -right-3 rounded-full p-2 text-sm font-semibold shadow-lg',
              theme === 'dark'
                ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                : 'bg-white text-slate-800 hover:bg-slate-100',
            ]"
          >
            ✕
          </button>
        </div>
      </div>

      <section
        v-if="activeTab === 'auth'"
        class="space-y-6 max-w-lg mx-auto"
      >
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3"
            :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
            <!-- <span class="inline-block mr-3">🔐</span> -->
            <span>{{ currentUser ? 'Your Account' : 'Account Access' }}</span>
          </h2>
          <p class="text-sm mt-2"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
            {{ currentUser ? 'Manage your account settings' : 'Login or create a new account to get started' }}
          </p>
        </div>
        <div v-if="currentUser">
          <!-- <div
            :class="[
              'rounded-lg border p-8 text-center transition-all duration-300 ease-in-out',
              theme === 'dark'
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-emerald-300 bg-emerald-50',
            ]">
            <div class="text-5xl mb-4">✅</div>
            <p class="text-lg font-semibold mb-2"
              :class="theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'">
              You're logged in!
            </p>
            <p class="text-sm mb-1"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-800'">
              {{ currentUser.fullName || currentUser.email }}
            </p>
            <p class="text-xs mb-6"
              :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-500'">
              {{ currentUser.email }}
            </p>
            <button
              type="button"
              @click="logout()"
              :class="[
                'rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ease-in-out hover:scale-[1.02]',
                theme === 'dark'
                  ? 'bg-red-600 text-white hover:bg-red-500'
                  : 'bg-red-500 text-white hover:bg-red-600',
              ]"
            >
              Logout
            </button> 
          </div> -->

          <form
            :class="[
              'space-y-4 rounded-lg p-6 shadow-lg transition-all duration-300 ease-in-out',
              theme === 'dark'
                ? 'bg-slate-900 border border-slate-700'
                : 'bg-white border border-slate-200',
            ]"
            @submit.prevent="onUpdateProfile"
          >
            <h3 class="text-lg font-bold mb-2"
              :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
              Profile Settings
            </h3>

            <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-semibold"
                :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
                <!-- <span>👤</span> -->
                <span>Full Name</span>
              </label>
              <input
                v-model="profileForm.fullName"
                type="text"
                placeholder="Your full name"
                :class="[
                  'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                  theme === 'dark'
                    ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                ]"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm font-semibold"
                  :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
                  <!-- <span>🔒</span> -->
                  <span>Current Password</span>
                </label>
                <input
                  v-model="profileForm.currentPassword"
                  type="password"
                  placeholder="Leave blank to keep password"
                  :class="[
                    'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  ]"
                />
              </div>
              <div class="space-y-2">
                <label class="flex items-center gap-2 text-sm font-semibold"
                  :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
                  <!-- <span>✨</span> -->
                  <span>New Password</span>
                </label>
                <input
                  v-model="profileForm.newPassword"
                  type="password"
                  minlength="6"
                  placeholder="At least 6 characters"
                  :class="[
                    'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  ]"
                />
              </div>
            </div>

            <div v-if="profileError"
              :class="[
                'rounded-lg border p-3 text-sm flex items-center gap-2',
                theme === 'dark'
                  ? 'border-red-500/50 bg-red-500/10 text-red-300'
                  : 'border-red-300 bg-red-50 text-red-700',
              ]">
              <span>⚠️</span>
              <span>{{ profileError }}</span>
            </div>

            <div v-if="profileMessage"
              :class="[
                'rounded-lg border p-3 text-sm flex items-center gap-2',
                theme === 'dark'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700',
              ]">
              <span>✅</span>
              <span>{{ profileMessage }}</span>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="profileSaving"
                :class="[
                  'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-in-out',
                  'bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed',
                ]"
              >
                <span v-if="!profileSaving">Save Changes</span>
                <span v-else class="flex items-center gap-2">
                  <span class="animate-spin">⏳</span>
                  <span>Saving...</span>
                </span>
              </button>
            </div>
          </form>

          <!-- User's Listings Section -->
          <div class="mt-8">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold"
                :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
                My Listings
              </h3>
              <button
                type="button"
                @click="loadUserListings"
                :class="[
                  'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                ]"
              >
                🔄 Refresh
              </button>
            </div>

            <div v-if="loadingUserListings" class="text-center py-12">
              <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
              <p class="text-sm"
                :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                Loading your listings...
              </p>
            </div>

            <div v-else-if="userListingsError"
              :class="[
                'rounded-lg border p-4 text-center',
                theme === 'dark'
                  ? 'border-red-500/50 bg-red-500/10 text-red-300'
                  : 'border-red-300 bg-red-50 text-red-700',
              ]">
              <p class="text-sm font-medium">⚠️ {{ userListingsError }}</p>
            </div>

            <div v-else-if="!userListings.length"
              :class="[
                'rounded-lg border p-12 text-center',
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/50'
                  : 'border-slate-300 bg-white',
              ]">
              <span class="text-5xl mb-4 block">📭</span>
              <p class="text-sm font-medium mb-4"
                :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                You haven't posted any listings yet.
              </p>
              <button
                type="button"
                @click="setTab('post')"
                :class="[
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300',
                  'bg-emerald-600 hover:bg-emerald-500',
                ]">
                <span>➕</span>
                <span>Post Your First Listing</span>
              </button>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="item in userListings"
                :key="item.id"
                :class="[
                  'group relative rounded-xl border overflow-hidden transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.02] hover:shadow-xl',
                  theme === 'dark'
                    ? 'border-slate-700/50 bg-slate-800/60 hover:border-emerald-500/50'
                    : 'border-slate-200 bg-white hover:border-emerald-500/50',
                ]"
              >
                <!-- Status Badge -->
                <div class="absolute top-3 right-3 z-10">
                  <span 
                    class="text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                    :class="{
                      'bg-amber-600 text-white': item.status === 'pending',
                      'bg-emerald-600 text-white': item.status === 'approved',
                      'bg-red-600 text-white': item.status === 'rejected' || item.status === 'sold',
                    }">
                    {{ item.status === 'pending' ? 'PENDING' : item.status === 'approved' ? 'APPROVED' : item.status === 'rejected' ? 'REJECTED' : 'SOLD' }}
                  </span>
                </div>

                <!-- Image -->
                <div
                  v-if="item.images.length"
                  class="relative h-40 overflow-hidden bg-gradient-to-br"
                  :class="theme === 'dark' 
                    ? 'from-slate-800 to-slate-900' 
                    : 'from-slate-100 to-slate-200'">
                  <img 
                    :src="item.images[0]" 
                    :alt="item.nickname"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                </div>
                <div
                  v-else
                  class="relative h-40 flex items-center justify-center bg-gradient-to-br"
                  :class="theme === 'dark' 
                    ? 'from-slate-800 to-slate-900' 
                    : 'from-slate-100 to-slate-200'">
                  <span class="text-4xl opacity-30">⚔️</span>
                </div>

                <!-- Card Content -->
                <div class="p-4" @click="openListingModal(item)">
                  <h4 class="text-lg font-bold mb-2 line-clamp-1"
                    :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
                    {{ item.nickname }}
                  </h4>
                  <div class="flex items-center gap-2 text-xs mb-3"
                    :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                    <span>🌐 {{ item.server }}</span>
                    <span>•</span>
                    <span>⚡ {{ item.growthPower }} GP</span>
                  </div>
                  <div class="flex items-baseline justify-between pt-3 border-t"
                    :class="theme === 'dark' ? 'border-slate-700' : 'border-slate-200'">
                    <span class="text-xs font-medium"
                      :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                      Price
                    </span>
                    <span 
                      class="text-xl font-bold"
                      :class="theme === 'dark' 
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'">
                      ${{ item.askingPrice }}
                    </span>
                  </div>
                  <div class="mt-2 text-xs"
                    :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-500'">
                    🕒 {{ new Date(item.createdAt).toLocaleDateString() }}
                  </div>
                </div>

                <!-- Owner actions -->
                <div class="px-4 pb-4 pt-2 border-t"
                  :class="theme === 'dark' ? 'border-slate-700/70 bg-slate-900/40' : 'border-slate-200 bg-slate-50'">
                  <div class="flex items-center justify-between gap-3">
                    <button
                      v-if="item.status !== 'sold'"
                      type="button"
                      @click.stop="markOwnedListingAsSold(String(item.id))"
                      :class="[
                        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all duration-300 ease-in-out',
                        'bg-blue-600 hover:bg-blue-500'
                      ]"
                    >
                      <span>💰</span>
                      <span>Mark as Sold</span>
                    </button>
                    <span
                      v-else
                      class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                      :class="theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'"
                    >
                      <span>✅</span>
                      <span>Marked as Sold</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex gap-3 justify-center mb-8">
          <button
            type="button"
            @click="authMode = 'login'"
            :class="[
              'rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ease-in-out',
              authMode === 'login'
                ? 'bg-emerald-600 text-white shadow-md'
                : theme === 'dark'
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
            ]"
          >
            Login
          </button>
          <button
            type="button"
            @click="authMode = 'register'"
            :class="[
              'rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 ease-in-out',
              authMode === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : theme === 'dark'
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
            ]"
          >
            Register
          </button>
        </div>

        <div v-if="authError"
          :class="[
              'rounded-lg border p-4 transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'border-red-500/50 bg-red-500/10 text-red-300'
              : 'border-red-300 bg-red-50 text-red-700',
          ]">
          <p class="text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ authError }}</span>
          </p>
        </div>

        <div v-if="authSuccess"
          :class="[
              'rounded-lg border p-4 transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
              : 'border-emerald-300 bg-emerald-50 text-emerald-700',
          ]">
          <p class="text-sm font-medium flex items-center gap-2">
            <span>✅</span>
            <span>{{ authSuccess }}</span>
          </p>
        </div>

        <form
          v-if="!currentUser && authMode === 'register'"
          :class="[
            'space-y-6 rounded-lg p-8 shadow-lg transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-slate-100 border border-slate-300',
          ]"
          @submit.prevent="onRegister"
        >
          <h3 class="text-xl font-bold text-center mb-6"
            :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
            Create New Account
          </h3>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>👤</span>
              <span>Full Name</span>
            </label>
            <input
              v-model="registerForm.fullName"
              type="text"
              required
              placeholder="Your full name"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>📧</span>
              <span>Email Address</span>
            </label>
            <input
              v-model="registerForm.email"
              type="email"
              required
              placeholder="your.email@example.com"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>🔒</span>
              <span>Password</span>
            </label>
            <input
              v-model="registerForm.password"
              type="password"
              required
              minlength="6"
              placeholder="At least 6 characters"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>
          <button
            type="submit"
            :class="[
              'w-full rounded-lg px-6 py-4 text-base font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]',
              'bg-emerald-600 hover:bg-emerald-500',
            ]"
          >
            Create Account
          </button>
        </form>

        <form
          v-if="!currentUser && authMode === 'login'"
          :class="[
            'space-y-6 rounded-lg p-8 shadow-lg transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-slate-100 border border-slate-300',
          ]"
          @submit.prevent="onLogin"
        >
          <h3 class="text-xl font-bold text-center mb-6"
            :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
            Welcome Back!
          </h3>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>📧</span>
              <span>Email Address</span>
            </label>
            <input
              v-model="loginForm.email"
              type="email"
              required
              placeholder="your.email@example.com"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm font-semibold"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-700'">
              <span>🔒</span>
              <span>Password</span>
            </label>
            <input
              v-model="loginForm.password"
              type="password"
              required
              minlength="6"
              placeholder="Enter your password"
              :class="[
                'w-full rounded-lg border px-4 py-3 text-sm transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
              ]"
            />
          </div>
          <button
            type="submit"
            :class="[
              'w-full rounded-lg px-6 py-4 text-base font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]',
              'bg-emerald-600 hover:bg-emerald-500',
            ]"
          >
            Login
          </button>
        </form>
      </section>

      <!-- Admin Panel -->
      <section
        v-if="activeTab === 'admin'"
        class="space-y-6"
      >
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-bold mb-2"
              :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
              Admin Panel
            </h2>
            <p class="text-sm"
              :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
              Review and approve pending listings, mark approved listings as sold
            </p>
          </div>
        </div>

        <div
          v-if="!currentUser?.isAdmin"
          :class="[
            'rounded-lg border p-12 text-center transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'border-red-500/50 bg-red-500/10 text-red-300'
              : 'border-red-300 bg-red-50 text-red-700',
          ]"
        >
          <div class="text-5xl mb-4">🔒</div>
          <p class="text-sm font-medium">
            Admin access required. You don't have permission to view this page.
          </p>
        </div>

        <div v-if="loadingPendingListings" class="text-center py-12">
          <div class="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p class="text-sm"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
            Loading pending listings...
          </p>
        </div>

        <div v-if="pendingListingsError"
          :class="[
            'rounded-lg border p-6 text-center transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'border-red-500/50 bg-red-500/10 text-red-300'
              : 'border-red-300 bg-red-50 text-red-700',
          ]">
          <p class="text-sm font-medium">⚠️ {{ pendingListingsError }}</p>
        </div>

        <div
          v-if="currentUser?.isAdmin && !loadingPendingListings && !pendingListingsError && !pendingListings.length"
          :class="[
            'rounded-lg border p-12 text-center transition-all duration-300 ease-in-out',
            theme === 'dark'
              ? 'border-slate-700 bg-slate-800/50'
              : 'border-slate-300 bg-white',
          ]"
        >
          <span class="text-5xl mb-4 block">✅</span>
          <p class="text-sm font-medium"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
            No pending listings. All caught up!
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in pendingListings"
            :key="item.id"
            :class="[
              'group rounded-lg border p-6 transition-all duration-300 ease-in-out',
              theme === 'dark'
                ? 'border-amber-700 bg-slate-800/70'
                : 'border-amber-300 bg-white',
            ]"
          >
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-semibold px-2 py-1 rounded"
                    :class="theme === 'dark' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'">
                    PENDING
                  </span>
                </div>
                <h3 class="text-xl font-bold mb-1"
                  :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
                  {{ item.nickname }}
                </h3>
                <div class="flex items-center gap-2 text-xs"
                  :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                  <span>🌐 {{ item.server }}</span>
                  <span>•</span>
                  <span>⚡ GP: {{ item.growthPower }}</span>
                </div>
              </div>
              <div class="rounded-lg px-4 py-2 font-bold text-lg transition-all duration-300 ease-in-out"
                :class="theme === 'dark' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'">
                ${{ item.askingPrice }}
              </div>
            </div>

            <div v-if="item.classesList.length" class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="className in item.classesList"
                :key="className"
                :class="[
                  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                  theme === 'dark'
                    ? 'bg-slate-700/50 text-slate-300 border border-slate-600'
                    : 'bg-slate-100 text-slate-700 border border-slate-300',
                ]"
              >
                <span>{{ getClassIcon(className) }}</span>
                <span>{{ className }}</span>
              </span>
            </div>

            <div
              v-if="item.images.length"
              class="mb-4 grid grid-cols-3 gap-2"
            >
              <div
                v-for="(src, index) in item.images.slice(0, 3)"
                :key="index"
                :class="[
                  'overflow-hidden rounded-lg border transition-all duration-300 ease-in-out',
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900/50'
                    : 'border-slate-300 bg-slate-100',
                ]"
              >
                <img :src="src" alt="Listing image" class="h-20 w-full object-cover" />
              </div>
            </div>

            <div class="space-y-3 pt-4 border-t"
              :class="theme === 'dark' ? 'border-slate-700' : 'border-slate-200'">
              <div class="flex items-center gap-2 text-xs"
                :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-500'">
                <span>🕒</span>
                <span>Posted {{ new Date(item.createdAt).toLocaleDateString() }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs px-2"
                :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                <span>📞</span>
                <span>{{ item.contactNumber }}</span>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="approveListing(item.id)"
                  :class="[
                    'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-in-out',
                    'bg-emerald-600 hover:bg-emerald-500',
                  ]"
                >
                  <span>✅</span>
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  @click="rejectListing(item.id)"
                  :class="[
                    'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-in-out',
                    'bg-red-600 hover:bg-red-500',
                  ]"
                >
                  <span>❌</span>
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Approved Listings Section -->
        <div v-if="currentUser?.isAdmin" class="mt-12">
          <h3 class="text-2xl font-bold mb-4"
            :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
            Approved Listings
          </h3>
          
          <div v-if="loadingApprovedListings" class="text-center py-8">
            <div class="inline-block animate-spin text-3xl mb-2">⏳</div>
            <p class="text-xs"
              :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
              Loading approved listings...
            </p>
          </div>

          <div v-if="approvedListingsError"
            :class="[
              'rounded-lg border p-4 text-center transition-all duration-300 ease-in-out mb-6',
              theme === 'dark'
                ? 'border-red-500/50 bg-red-500/10 text-red-300'
                : 'border-red-300 bg-red-50 text-red-700',
            ]">
            <p class="text-xs font-medium">⚠️ {{ approvedListingsError }}</p>
          </div>

          <div
            v-if="!loadingApprovedListings && !approvedListingsError && !approvedListings.length"
            :class="[
              'rounded-lg border p-8 text-center transition-all duration-300 ease-in-out',
              theme === 'dark'
                ? 'border-slate-700 bg-slate-800/50'
                : 'border-slate-300 bg-white',
            ]"
          >
            <span class="text-4xl mb-3 block">📋</span>
            <p class="text-xs font-medium"
              :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
              No approved listings available.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="item in approvedListings"
              :key="item.id"
              :class="[
                'group rounded-lg border p-6 transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-emerald-700 bg-slate-800/70'
                  : 'border-emerald-300 bg-white',
              ]"
            >
              <div class="flex items-start justify-between gap-3 mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs font-semibold px-2 py-1 rounded"
                      :class="theme === 'dark' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'">
                      APPROVED
                    </span>
                  </div>
                  <h3 class="text-xl font-bold mb-1"
                    :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
                    {{ item.nickname }}
                  </h3>
                  <div class="flex items-center gap-2 text-xs"
                    :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                    <span>🌐 {{ item.server }}</span>
                    <span>•</span>
                    <span>⚡ GP: {{ item.growthPower }}</span>
                  </div>
                </div>
                <div class="rounded-lg px-4 py-2 font-bold text-lg transition-all duration-300 ease-in-out"
                  :class="theme === 'dark' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'">
                  ${{ item.askingPrice }}
                </div>
              </div>

              <div v-if="item.classesList.length" class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="className in item.classesList"
                  :key="className"
                  :class="[
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                    theme === 'dark'
                      ? 'bg-slate-700/50 text-slate-300 border border-slate-600'
                      : 'bg-slate-100 text-slate-700 border border-slate-300',
                  ]"
                >
                  <span>{{ getClassIcon(className) }}</span>
                  <span>{{ className }}</span>
                </span>
              </div>

              <div
                v-if="item.images.length"
                class="mb-4 grid grid-cols-3 gap-2"
              >
                <div
                  v-for="(src, index) in item.images.slice(0, 3)"
                  :key="index"
                  :class="[
                    'overflow-hidden rounded-lg border transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-700 bg-slate-900/50'
                      : 'border-slate-300 bg-slate-100',
                  ]"
                >
                  <img :src="src" alt="Listing image" class="h-20 w-full object-cover" />
                </div>
              </div>

              <div class="space-y-3 pt-4 border-t"
                :class="theme === 'dark' ? 'border-slate-700' : 'border-slate-200'">
                <div class="flex items-center gap-2 text-xs"
                  :class="theme === 'dark' ? 'text-slate-500' : 'text-slate-500'">
                  <span>🕒</span>
                  <span>Posted {{ new Date(item.createdAt).toLocaleDateString() }}</span>
                </div>
                <div class="flex items-center gap-2 text-xs px-2"
                  :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                  <span>📞</span>
                  <span>{{ item.contactNumber }}</span>
                </div>
                <button
                  type="button"
                  @click="markAsSold(item.id)"
                  :class="[
                    'w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ease-in-out',
                    'bg-blue-600 hover:bg-blue-500',
                  ]"
                >
                  <span>💰</span>
                  <span>Mark as Sold</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Middlemen Management Section -->
        <div class="mt-12">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h3 class="text-2xl font-bold mb-2"
                :class="theme === 'dark' ? 'text-slate-100' : 'text-slate-900'">
                Middlemen Management
              </h3>
              <p class="text-sm"
                :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                Add or remove middlemen that users can select when posting listings
              </p>
            </div>
          </div>

          <!-- Add Middleman Form -->
          <div
            :class="[
              'rounded-lg border p-6 mb-6 transition-all duration-300 ease-in-out',
              theme === 'dark'
                ? 'border-slate-700 bg-slate-800/50'
                : 'border-slate-300 bg-white',
            ]"
          >
            <h4 class="text-lg font-semibold mb-4"
              :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-800'">
              Add New Middleman
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium mb-2"
                  :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">
                  Name *
                </label>
                <input
                  v-model="newMiddleman.name"
                  type="text"
                  placeholder="Middleman Name"
                  :class="[
                    'w-full rounded-lg border px-4 py-2 text-sm transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  ]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2"
                  :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">
                  Email *
                </label>
                <input
                  v-model="newMiddleman.email"
                  type="email"
                  placeholder="middleman@example.com"
                  :class="[
                    'w-full rounded-lg border px-4 py-2 text-sm transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  ]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2"
                  :class="theme === 'dark' ? 'text-slate-300' : 'text-slate-700'">
                  Link (Optional)
                </label>
                <input
                  v-model="newMiddleman.link"
                  type="url"
                  placeholder="https://..."
                  :class="[
                    'w-full rounded-lg border px-4 py-2 text-sm transition-all duration-300 ease-in-out',
                    theme === 'dark'
                      ? 'border-slate-600 bg-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  ]"
                />
              </div>
            </div>
            <div class="flex items-center gap-4">
              <button
                type="button"
                @click="addMiddleman"
                :disabled="addingMiddleman"
                :class="[
                  'rounded-lg px-6 py-2 text-sm font-semibold text-white transition-all duration-300 ease-in-out',
                  'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                ]"
              >
                {{ addingMiddleman ? 'Adding...' : 'Add Middleman' }}
              </button>
              <p v-if="middlemanError" class="text-sm text-red-500">
                {{ middlemanError }}
              </p>
            </div>
          </div>

          <!-- Middlemen List -->
          <div
            v-if="loadingMiddlemen"
            class="text-center py-8"
            :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'"
          >
            Loading middlemen...
          </div>

          <div
            v-else-if="middlemenError"
            :class="[
              'rounded-lg border p-6 text-center transition-all duration-300 ease-in-out',
              theme === 'dark'
                ? 'border-red-500/50 bg-red-500/10 text-red-300'
                : 'border-red-300 bg-red-50 text-red-700',
            ]"
          >
            <p class="text-sm font-medium">⚠️ {{ middlemenError }}</p>
          </div>

          <div
            v-else-if="middlemen.length === 0"
            :class="[
              'rounded-lg border p-12 text-center transition-all duration-300 ease-in-out',
              theme === 'dark'
                ? 'border-slate-700 bg-slate-800/50'
                : 'border-slate-300 bg-white',
            ]"
          >
            <span class="text-5xl mb-4 block">👤</span>
            <p class="text-sm font-medium"
              :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
              No middlemen added yet. Add one above to get started.
            </p>
          </div>

          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div
              v-for="middleman in middlemen"
              :key="middleman.id"
              :class="[
                'rounded-lg border p-4 transition-all duration-300 ease-in-out',
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/50'
                  : 'border-slate-300 bg-white',
              ]"
            >
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1">
                  <h5 class="font-semibold mb-1"
                    :class="theme === 'dark' ? 'text-slate-200' : 'text-slate-900'">
                    {{ middleman.name }}
                  </h5>
                  <p class="text-sm mb-1"
                    :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                    📧 {{ middleman.email }}
                  </p>
                  <p v-if="middleman.link" class="text-sm"
                    :class="theme === 'dark' ? 'text-slate-400' : 'text-slate-600'">
                    🔗 <a :href="middleman.link" target="_blank" rel="noopener noreferrer"
                      class="text-emerald-500 hover:text-emerald-400 underline">
                      {{ middleman.link }}
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  @click="deleteMiddleman(middleman.id)"
                  :class="[
                    'rounded-lg px-3 py-1 text-sm font-semibold transition-all duration-300 ease-in-out',
                    'bg-red-600 hover:bg-red-500 text-white',
                  ]"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch, computed, onUnmounted } from "vue";

type ListingResponse = {
  id: number | string;
  createdAt: string;
  nickname: string;
  server: string;
  growthPower: string;
  classesList: string[];
  askingPrice: string;
  contactLink: string;
  contactNumber: string;
  images: string[];
  status?: 'pending' | 'approved' | 'rejected' | 'sold';
  approvedBy?: string;
  approvedAt?: string;
  middlemanId?: string;
  middleman?: {
    id: string;
    name: string;
    email: string;
    link?: string;
  };
};

const phonePattern = /^[0-9+()\-\s]{7,20}$/;

const classOptions = ["Archer", "Skald", "Volva", "Warlord", "Berserker"];

const theme = ref<"dark" | "light">("dark");
const CURRENT_USER_STORAGE_KEY = "phl_current_user";

const form = reactive({
  nickname: "",
  server: "",
  growthPower: "",
  askingPrice: "",
  contactLink: "",
  contactNumber: "",
  middlemanId: "",
});

const imagePreviews = ref<string[]>([]);
const imageFiles = ref<File[]>([]);
const submitting = ref(false);
const error = ref("");

const selectedClass = ref<string>("");

const submittedListing = ref<ListingResponse | null>(null);

const activeTab = ref<"post" | "listings" | "auth" | "admin">("listings");

const currentUser = ref<
  { id: number | string; email: string; fullName?: string; isAdmin?: boolean } | null
>(null);

const listings = ref<ListingResponse[]>([]);
const loadingListings = ref(false);
const listingsError = ref("");

const filters = reactive({
  server: "",
  className: "",
  minPrice: "",
  maxPrice: "",
  minGrowthPower: "",
  maxGrowthPower: "",
  soldStatus: "", // empty = all, "sold" = sold only, "unsold" = unsold only
});

const showListingModal = ref(false);
const selectedListing = ref<ListingResponse | null>(null);

const previewImage = ref<string | null>(null);

const authMode = ref<"login" | "register">("login");
const authError = ref("");
const authSuccess = ref("");
const registerForm = reactive({
  fullName: "",
  email: "",
  password: "",
});
const loginForm = reactive({
  email: "",
  password: "",
});
const profileForm = reactive({
  fullName: "",
  currentPassword: "",
  newPassword: "",
});
const profileSaving = ref(false);
const profileError = ref("");
const profileMessage = ref("");

// User's listings state
const userListings = ref<ListingResponse[]>([]);
const loadingUserListings = ref(false);
const userListingsError = ref("");

// Admin panel state
const pendingListings = ref<ListingResponse[]>([]);
const approvedListings = ref<ListingResponse[]>([]);
const loadingPendingListings = ref(false);
const loadingApprovedListings = ref(false);
const pendingListingsError = ref("");
const approvedListingsError = ref("");

// Notifications state
type NotificationResponse = {
  id: string;
  userId: string;
  listingId?: string;
  type: 'pending_review' | 'approved' | 'rejected' | 'sold';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const notifications = ref<NotificationResponse[]>([]);
const loadingNotifications = ref(false);
const showNotifications = ref(false);
const unreadNotificationsCount = computed(() => 
  notifications.value.filter(n => !n.isRead).length
);

// Check if current user is a middleman (by email match)
const isCurrentUserMiddleman = computed(() => {
  if (!currentUser.value) return false;
  return middlemen.value.some(m => m.email.toLowerCase() === currentUser.value?.email.toLowerCase());
});

// Check if current user is the middleman for a specific listing
const isMiddlemanForListing = (listing: ListingResponse) => {
  if (!currentUser.value || !listing.middleman) return false;
  return listing.middleman.email.toLowerCase() === currentUser.value.email.toLowerCase();
};

// Check if seller contact should be shown (only to middleman assigned to listing)
const shouldShowSellerContact = (listing: ListingResponse) => {
  // If no middleman assigned, show seller contact to everyone (direct contact)
  if (!listing.middleman || !listing.middlemanId) return true;
  // If has middleman, only show seller contact to the assigned middleman
  // This allows the middleman to contact the seller using the contact link/number
  return isMiddlemanForListing(listing);
};

// Middlemen state
type MiddlemanResponse = {
  id: string;
  name: string;
  email: string;
  link?: string;
  createdAt: string;
};

const middlemen = ref<MiddlemanResponse[]>([]);
const loadingMiddlemen = ref(false);
const middlemenError = ref("");

// Admin middlemen management state
const newMiddleman = reactive({
  name: "",
  email: "",
  link: "",
});
const addingMiddleman = ref(false);
const middlemanError = ref("");

// Close notifications dropdown when clicking outside
const handleClickOutsideNotifications = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest(".notification-container")) {
    showNotifications.value = false;
  }
};

const loadMiddlemen = async () => {
  loadingMiddlemen.value = true;
  middlemenError.value = "";

  try {
    const data = await $fetch<MiddlemanResponse[]>("/api/middlemen");
    middlemen.value = data;
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to load middlemen.";
    middlemenError.value = message;
  } finally {
    loadingMiddlemen.value = false;
  }
};

const addMiddleman = async () => {
  middlemanError.value = "";
  
  if (!newMiddleman.name || !newMiddleman.email) {
    middlemanError.value = "Name and email are required.";
    return;
  }

  const user = currentUser.value;
  if (!user || !user.isAdmin) {
    middlemanError.value = "Only admins can add middlemen.";
    return;
  }

  addingMiddleman.value = true;

  try {
    await $fetch("/api/admin/middlemen", {
      method: "POST",
      body: {
        userId: user.id,
        name: newMiddleman.name,
        email: newMiddleman.email,
        link: newMiddleman.link || undefined,
      },
    });

    // Reset form
    newMiddleman.name = "";
    newMiddleman.email = "";
    newMiddleman.link = "";

    // Reload middlemen
    await loadMiddlemen();
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to add middleman.";
    middlemanError.value = message;
  } finally {
    addingMiddleman.value = false;
  }
};

const deleteMiddleman = async (middlemanId: string) => {
  const user = currentUser.value;
  if (!user || !user.isAdmin) {
    return;
  }

  if (!confirm("Are you sure you want to delete this middleman?")) {
    return;
  }

  try {
    await $fetch("/api/admin/middlemen/delete", {
      method: "POST",
      body: {
        userId: user.id,
        middlemanId,
      },
    });

    // Reload middlemen
    await loadMiddlemen();
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to delete middleman.";
    alert(message);
  }
};

onMounted(() => {
  if (typeof window !== "undefined") {
    try {
      const storedTheme = window.localStorage.getItem("theme");
      if (storedTheme === "dark" || storedTheme === "light") {
        theme.value = storedTheme;
      }

      const storedUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (
            parsed &&
            typeof parsed.email === "string"
          ) {
            currentUser.value = {
              id: parsed.id,
              email: parsed.email,
              fullName: parsed.fullName,
              isAdmin: parsed.isAdmin || false,
            };
          }
        } catch {
          // ignore
        }
      }

      // Load listings on mount (marketplace is default view)
      loadListings();
      
      // Load middlemen for form selector
      loadMiddlemen();
      
      // Load notifications if user is logged in
      if (currentUser.value) {
        loadNotifications();
      }
      
      // Close notifications dropdown when clicking outside
      window.addEventListener("click", handleClickOutsideNotifications);
    } catch {
      // ignore
    }
  }
});

watch(
  theme,
  (value) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("theme", value);
      } catch {
        // ignore
      }
    }
  },
  { immediate: false }
);

const setTab = (tab: "post" | "listings" | "auth" | "admin") => {
  activeTab.value = tab;
  if (tab === "listings") {
    loadListings();
  }
  if (tab === "admin") {
    loadMiddlemen();
    loadPendingListings();
    loadApprovedListings();
  }
  if (tab === "auth" && currentUser.value) {
    profileForm.fullName = currentUser.value.fullName || "";
    profileForm.currentPassword = "";
    profileForm.newPassword = "";
    profileError.value = "";
    profileMessage.value = "";
    loadUserListings();
  }
};

const showUserMenu = ref(false);

const logout = () => {
  currentUser.value = null;
  authMode.value = "login";
  notifications.value = [];
  showNotifications.value = false;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
};

const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
};

const openListingModal = (item: ListingResponse) => {
  if (!currentUser.value) {
    activeTab.value = "auth";
    authMode.value = "login";
    authError.value = "You must be logged in to view listing details.";
    return;
  }

  selectedListing.value = item;
  showListingModal.value = true;
};

const closeListingModal = () => {
  showListingModal.value = false;
  selectedListing.value = null;
  previewImage.value = null;
};

const openImagePreview = (src: string) => {
  previewImage.value = src;
};

const closeImagePreview = () => {
  previewImage.value = null;
};

const handleImagesChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  const files = target?.files;
  if (!files) return;

  // Limit to 5 images total
  const maxImages = 5;
  const currentCount = imagePreviews.value.length;
  const remainingSlots = maxImages - currentCount;

  if (remainingSlots <= 0) {
    alert(`Maximum ${maxImages} images allowed. Please remove some images first.`);
    if (target) {
      target.value = "";
    }
    return;
  }

  imagePreviews.value.forEach((url) => URL.revokeObjectURL(url));

  const urls: string[] = [];
  const selectedFiles: File[] = [];

  // Validate file size (5MB max per image)
  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  Array.from(files).slice(0, remainingSlots).forEach((file) => {
    // Check file size
    if (file.size > maxSizeBytes) {
      alert(`Image "${file.name}" exceeds ${maxSizeMB}MB limit. Please choose a smaller image.`);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert(`File "${file.name}" is not an image. Please select image files only.`);
      return;
    }

    urls.push(URL.createObjectURL(file));
    selectedFiles.push(file);
  });

  // Combine with existing images (up to max)
  imagePreviews.value = [...imagePreviews.value, ...urls].slice(0, maxImages);
  imageFiles.value = [...imageFiles.value, ...selectedFiles].slice(0, maxImages);

  if (target) {
    target.value = "";
  }
};

const removeImage = (index: number) => {
  const url = imagePreviews.value[index];
  if (url) {
    URL.revokeObjectURL(url);
  }
  imagePreviews.value.splice(index, 1);
  imageFiles.value.splice(index, 1);
};

const getClassIcon = (className: string): string => {
  const icons: Record<string, string> = {
    Archer: "🏹",
    Skald: "🎵",
    Volva: "🔮",
    Warlord: "⚔️",
    Berserker: "⚔️",
  };
  return icons[className] || "⚔️";
};

const filteredListings = computed(() => {
  return listings.value.filter((item) => {
    const serverMatch =
      !filters.server ||
      item.server.toLowerCase().includes(filters.server.toLowerCase());

    const classMatch =
      !filters.className || item.classesList.includes(filters.className);

    const price = parseFloat(item.askingPrice);
    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : null;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : null;
    const priceMatch =
      (!minPrice || (!Number.isNaN(price) && price >= minPrice)) &&
      (!maxPrice || (!Number.isNaN(price) && price <= maxPrice));

    const growthPower = parseFloat(item.growthPower);
    const minGrowthPower = filters.minGrowthPower
      ? parseFloat(filters.minGrowthPower)
      : null;
    const maxGrowthPower = filters.maxGrowthPower
      ? parseFloat(filters.maxGrowthPower)
      : null;
    const growthPowerMatch =
      (!minGrowthPower ||
        (!Number.isNaN(growthPower) && growthPower >= minGrowthPower)) &&
      (!maxGrowthPower ||
        (!Number.isNaN(growthPower) && growthPower <= maxGrowthPower));

    const soldStatusMatch =
      !filters.soldStatus ||
      (filters.soldStatus === "sold" && item.status === "sold") ||
      (filters.soldStatus === "unsold" && item.status !== "sold");

    return serverMatch && classMatch && priceMatch && growthPowerMatch && soldStatusMatch;
  });
});

const resetFilters = () => {
  filters.server = "";
  filters.className = "";
  filters.minPrice = "";
  filters.maxPrice = "";
  filters.minGrowthPower = "";
  filters.maxGrowthPower = "";
  filters.soldStatus = "";
};

const loadListings = async () => {
  loadingListings.value = true;
  listingsError.value = "";

  try {
    const data = await $fetch<ListingResponse[]>("/api/listings");
    listings.value = data;
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to load listings.";
    listingsError.value = message;
  } finally {
    loadingListings.value = false;
  }
};

const onSubmit = async () => {
  error.value = "";

  if (
    !form.nickname ||
    !form.server ||
    !form.growthPower ||
    !form.askingPrice ||
    !form.contactNumber ||
    !form.middlemanId
  ) {
    error.value = "Please fill in all required fields, including selecting a middleman.";
    return;
  }

  if (!phonePattern.test(form.contactNumber.trim())) {
    error.value = "Please enter a valid phone number.";
    return;
  }

  if (!selectedClass.value) {
    error.value = "Please select a class.";
    return;
  }

  const user = currentUser.value;
  if (!user) {
    error.value = "You must be logged in to post a listing.";
    return;
  }

  if (submitting.value) {
    return;
  }

  submitting.value = true;

  try {
    const formData = new FormData();
    formData.append("userId", String(user.id));
    formData.append("nickname", form.nickname);
    formData.append("server", form.server);
    formData.append("growthPower", form.growthPower);
    if (form.middlemanId) {
      formData.append("middlemanId", form.middlemanId);
    }
    const classesString = selectedClass.value;
    formData.append("classes", classesString);
    formData.append("askingPrice", form.askingPrice);
    formData.append("contactLink", form.contactLink);
    formData.append("contactNumber", form.contactNumber);

    imageFiles.value.forEach((file) => {
      formData.append("images", file);
    });

    const created = await $fetch<ListingResponse>("/api/listings", {
      method: "POST",
      body: formData,
    });

    submittedListing.value = created;
    
    // Clear form
    form.nickname = "";
    form.server = "";
    form.growthPower = "";
    form.askingPrice = "";
    form.contactLink = "";
    form.contactNumber = "";
    form.middlemanId = "";
    selectedClass.value = "";
    imagePreviews.value = [];
    imageFiles.value = [];
    
    // Reload notifications to show the pending review notification
    loadNotifications();
    
    // Reload user's listings if on profile page
    if (activeTab.value === "auth") {
      loadUserListings();
    }
    
    // Redirect to marketplace after 2 seconds
    setTimeout(() => {
      activeTab.value = "listings";
      loadListings();
      submittedListing.value = null;
    }, 2000);
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to submit listing.";
    error.value = message;
  } finally {
    submitting.value = false;
  }
};

const markOwnedListingAsSold = async (listingId: string) => {
  const user = currentUser.value;
  if (!user) {
    error.value = "You must be logged in to manage your listings.";
    return;
  }

  try {
    await $fetch("/api/listings/mark-sold", {
      method: "POST",
      body: {
        userId: user.id,
        listingId,
      },
    });

    // Refresh user listings and main listings
    await Promise.all([loadUserListings(), loadListings()]);
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to mark listing as sold.";
    userListingsError.value = message;
  }
};

const onRegister = async () => {
  authError.value = "";
  authSuccess.value = "";

  if (!registerForm.fullName || !registerForm.email || !registerForm.password) {
    authError.value = "Full name, email and password are required.";
    return;
  }

  try {
    const response = await $fetch<{
      success: boolean;
      user: {
        id: number | string;
        email: string;
        fullName: string;
        isAdmin?: boolean;
        createdAt: string;
      };
    }>("/api/auth/register", {
      method: "POST",
      body: {
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
      },
    });

    const newUser = response.user;

    currentUser.value = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      isAdmin: newUser.isAdmin || false,
    };
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          CURRENT_USER_STORAGE_KEY,
          JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            isAdmin: newUser.isAdmin || false,
          })
        );
      } catch {
        // ignore
      }
    }
    authSuccess.value = "Account created successfully!";
    loginForm.email = registerForm.email;
    loginForm.password = registerForm.password;
    
    // After registration, go to marketplace
    setTimeout(() => {
      activeTab.value = "listings";
      loadListings();
      loadNotifications();
      authSuccess.value = "";
    }, 1500);
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Registration failed.";
    authError.value = message;
    console.error("Registration error:", err);
  }
};

const onLogin = async () => {
  authError.value = "";

  if (!loginForm.email || !loginForm.password) {
    authError.value = "Email and password are required.";
    return;
  }

  try {
    const user = await $fetch<{
      id: number | string;
      email: string;
      fullName: string;
      isAdmin?: boolean;
      createdAt: string;
    }>("/api/auth/login", {
      method: "POST",
      body: {
        email: loginForm.email,
        password: loginForm.password,
      },
    });

    currentUser.value = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isAdmin: user.isAdmin || false,
    };
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          CURRENT_USER_STORAGE_KEY,
          JSON.stringify({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            isAdmin: user.isAdmin || false,
          })
        );
      } catch {
        // ignore
      }
    }
    // After login, go to marketplace to see listings
    activeTab.value = "listings";
    loadListings();
    loadNotifications();
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Login failed.";
    authError.value = message;
  }
};

const onUpdateProfile = async () => {
  profileError.value = "";
  profileMessage.value = "";

  if (!currentUser.value) {
    profileError.value = "You must be logged in to update your profile.";
    return;
  }

  if (!profileForm.fullName && !profileForm.newPassword) {
    profileError.value = "Please update your name and/or password.";
    return;
  }

  if (profileForm.newPassword && !profileForm.currentPassword) {
    profileError.value = "Current password is required to change password.";
    return;
  }

  profileSaving.value = true;

  try {
    const updated = await $fetch<{
      id: number | string;
      email: string;
      fullName: string;
      isAdmin?: boolean;
      createdAt: string;
    }>("/api/auth/profile", {
      method: "PUT",
      body: {
        userId: currentUser.value.id,
        fullName: profileForm.fullName || undefined,
        currentPassword: profileForm.currentPassword || undefined,
        newPassword: profileForm.newPassword || undefined,
      },
    });

    currentUser.value = {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      isAdmin: updated.isAdmin || false,
    };

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          CURRENT_USER_STORAGE_KEY,
          JSON.stringify({
            id: updated.id,
            email: updated.email,
            fullName: updated.fullName,
            isAdmin: updated.isAdmin || false,
          })
        );
      } catch {
        // ignore
      }
    }

    profileForm.currentPassword = "";
    profileForm.newPassword = "";
    profileMessage.value = "Profile updated successfully.";
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to update profile.";
    profileError.value = message;
  } finally {
    profileSaving.value = false;
  }
};

// User's listings functions
const loadUserListings = async () => {
  if (!currentUser.value) {
    userListings.value = [];
    return;
  }

  loadingUserListings.value = true;
  userListingsError.value = "";

  try {
    const data = await $fetch<ListingResponse[]>("/api/listings/user", {
      query: {
        userId: currentUser.value.id,
      },
    });
    userListings.value = data;
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to load your listings.";
    userListingsError.value = message;
  } finally {
    loadingUserListings.value = false;
  }
};

// Admin functions
const loadPendingListings = async () => {
  if (!currentUser.value?.isAdmin) {
    pendingListingsError.value = "Admin access required.";
    return;
  }

  loadingPendingListings.value = true;
  pendingListingsError.value = "";

  try {
    const data = await $fetch<ListingResponse[]>("/api/admin/pending-listings", {
      query: {
        userId: currentUser.value.id,
      },
    });
    pendingListings.value = data;
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to load pending listings.";
    pendingListingsError.value = message;
  } finally {
    loadingPendingListings.value = false;
  }
};

const approveListing = async (listingId: string | number) => {
  if (!currentUser.value?.isAdmin) {
    return;
  }

  try {
    await $fetch("/api/admin/approve", {
      method: "POST",
      body: {
        listingId,
        userId: currentUser.value.id,
      },
    });
    
                // Remove from pending list and reload
    pendingListings.value = pendingListings.value.filter((l) => l.id !== listingId);
    
    // Reload approved listings since this one is now approved
    loadApprovedListings();
    
    // Refresh notifications for the listing owner (notification was created on backend)
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to approve listing.";
    alert(message);
  }
};

const rejectListing = async (listingId: string | number) => {
  if (!currentUser.value?.isAdmin) {
    return;
  }

  if (!confirm("Are you sure you want to reject this listing?")) {
    return;
  }

  try {
    await $fetch("/api/admin/reject", {
      method: "POST",
      body: {
        listingId,
        userId: currentUser.value.id,
      },
    });
    
    // Remove from pending list
    pendingListings.value = pendingListings.value.filter((l) => l.id !== listingId);
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to reject listing.";
    alert(message);
  }
};

const loadApprovedListings = async () => {
  if (!currentUser.value?.isAdmin) {
    approvedListingsError.value = "Admin access required.";
    return;
  }

  loadingApprovedListings.value = true;
  approvedListingsError.value = "";

  try {
    const data = await $fetch<ListingResponse[]>("/api/admin/pending-listings", {
      query: {
        userId: currentUser.value.id,
        status: 'approved',
      },
    });
    approvedListings.value = data.filter((l) => l.status === 'approved');
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to load approved listings.";
    approvedListingsError.value = message;
  } finally {
    loadingApprovedListings.value = false;
  }
};

const markAsSold = async (listingId: string | number) => {
  if (!currentUser.value?.isAdmin) {
    return;
  }

  if (!confirm("Are you sure you want to mark this listing as sold?")) {
    return;
  }

  try {
    await $fetch("/api/admin/mark-sold", {
      method: "POST",
      body: {
        listingId,
        userId: currentUser.value.id,
      },
    });
    
    // Remove from approved list and reload marketplace
    approvedListings.value = approvedListings.value.filter((l) => l.id !== listingId);
    loadListings(); // Refresh marketplace to remove sold listing
  } catch (err: any) {
    const message =
      err?.data?.message ||
      err?.statusMessage ||
      err?.message ||
      "Failed to mark listing as sold.";
    alert(message);
  }
};

// Notification functions
const loadNotifications = async () => {
  if (!currentUser.value) {
    return;
  }

  loadingNotifications.value = true;

  try {
    const data = await $fetch<NotificationResponse[]>("/api/notifications", {
      query: {
        userId: currentUser.value.id,
      },
    });
    notifications.value = data;
  } catch (err: any) {
    console.error("Failed to load notifications:", err);
  } finally {
    loadingNotifications.value = false;
  }
};

const markNotificationAsRead = async (notificationId: string) => {
  try {
    await $fetch("/api/notifications/mark-read", {
      method: "POST",
      body: {
        notificationId,
      },
    });
    
    // Update local state
    const notif = notifications.value.find(n => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
    }
  } catch (err: any) {
    console.error("Failed to mark notification as read:", err);
  }
};

const markAllNotificationsAsRead = async () => {
  if (!currentUser.value) {
    return;
  }

  try {
    await $fetch("/api/notifications/mark-all-read", {
      method: "POST",
      body: {
        userId: currentUser.value.id,
      },
    });
    
    // Update local state
    notifications.value.forEach(n => {
      n.isRead = true;
    });
  } catch (err: any) {
    console.error("Failed to mark all notifications as read:", err);
  }
};

const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) {
    loadNotifications();
  }
};

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("click", handleClickOutsideNotifications);
  }
});

</script>
