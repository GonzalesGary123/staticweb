<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { supabase } from '../lib/supabase';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useSettingsStore } from '../stores/settings';
import { usePicksStore } from '../stores/picks';

const router = useRouter();
const { user, profile: userProfile, initialize: initAuth, startListener, logout, signInWithDiscord } = useAuth();
const settingsStore = useSettingsStore();
const picksStore = usePicksStore();

const bannerImageUrl = new URL('../assets/images/MarkoPicks_Banner.png', import.meta.url).href;
const loadingImageUrl = new URL('../assets/images/Loading.png', import.meta.url).href;
const homeBgUrl = new URL('../assets/images/home-bg.png', import.meta.url).href;
const totalvalue = ref(28563.7);
const picks = ref<any[]>([]);
const leaderboardUsers = ref<any[]>([]);
const isPageLoading = ref(true);
const loadingLeaderboard = ref(true);
const leaderboardError = ref('');
const leaderboardUsingCachedData = ref(false);
const loadingPicks = ref(true);
const giveawayLoading = ref(true);
const giveawaySubmitting = ref(false);
const giveawayStakeId = ref('');
const giveawayError = ref('');
const giveawaySuccess = ref('');
const giveawaySlots = ref(20);
const giveawayEntriesCount = ref(0);
const giveawayHasEntered = ref(false);
const giveawayUserStakeId = ref('');
const giveawayEntryToken = ref('');
const giveawayDeviceFingerprint = ref('');
const giveawayWinnerStakeId = ref('');
const giveawayWinnerEntryId = ref<number | null>(null);
const giveawayWinners = ref<{ entry_id: number; stake_id: string }[]>([]);
const giveawayParticipants = ref<string[]>([]);
const recentGiveawayParticipants = ref<string[]>([]);
const giveawayDrawSecondsRemaining = ref<number | null>(null);
const giveawayIsActive = ref(false);
const giveawayRoundId = ref<number | null>(null);
const giveawayName = ref('Giveaway');
const giveawayPrize = ref('TBD');
const giveawayWinnerCount = ref(1);
const giveawayDrawAfterMinutes = ref(720);
const showWinnerCelebrationModal = ref(false);
const winnerCelebrationStakeId = ref('');
const winnerCelebrationIsMyEntry = ref(false);
const confettiPieces = ref<Array<{ id: number; left: number; delay: number; duration: number; rotate: number; emoji: string }>>([]);
const totalHistoricalPicks = ref(0);
const currentPage = ref(1);
const itemsPerPage = 10;
const isUserDropdownOpen = ref(false);

const isVip = computed(() => {
  return userProfile.value?.role === 'superuser' || 
         userProfile.value?.role === 'vip' || 
         userProfile.value?.role === 'uservip' || 
         userProfile.value?.role === 'subscriber';
});

const giveawayStatusLabel = computed(() => {
  if (giveawayLoading.value) return 'Checking...';
  if (giveawayWinnerStakeId.value) return 'Winner Selected';
  if (!giveawayIsActive.value) return 'Stopped';
  if (giveawayDrawSecondsRemaining.value !== null) return 'Draw Ongoing';
  if (giveawayEntriesCount.value >= giveawaySlots.value) return 'Full';
  if (giveawayHasEntered.value) return 'Entered';
  return 'Open';
});

const giveawayRemainingSlots = computed(() => {
  return Math.max(giveawaySlots.value - giveawayEntriesCount.value, 0);
});

const formattedGiveawayDrawTime = computed(() => {
  if (giveawayDrawSecondsRemaining.value === null) return '';
  const total = Math.max(giveawayDrawSecondsRemaining.value, 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const displayedGiveawayParticipants = computed(() => {
  return giveawayParticipants.value.length > 0
    ? giveawayParticipants.value
    : recentGiveawayParticipants.value;
});

const giveawayWinnerIsMyEntry = computed(() =>
  Boolean(
    giveawayHasEntered.value &&
    giveawayUserStakeId.value &&
    giveawayWinnerStakeId.value &&
    giveawayUserStakeId.value.toLowerCase() === giveawayWinnerStakeId.value.toLowerCase()
  )
);

function playCelebrationSound() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.22);
    });
  } catch {
    // Browser may block autoplay audio.
  }
}

function launchConfetti() {
  const emojis = ['🎉', '🎊', '✨', '🥳', '🏆'];
  confettiPieces.value = Array.from({ length: 60 }, (_, i) => ({
    id: Date.now() + i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 2.2 + Math.random() * 1.8,
    rotate: Math.random() * 720 - 360,
    emoji: emojis[Math.floor(Math.random() * emojis.length)] || '🎉'
  }));
}

function closeWinnerCelebrationModal() {
  showWinnerCelebrationModal.value = false;
}

function maybeCelebrateWinner() {
  if (!giveawayWinnerStakeId.value || giveawayRoundId.value === null) return;

  const seenKey = `giveaway_winner_seen_${giveawayRoundId.value}_${giveawayWinnerStakeId.value}`;
  if (localStorage.getItem(seenKey)) return;
  localStorage.setItem(seenKey, '1');

  winnerCelebrationStakeId.value = giveawayWinnerStakeId.value;
  winnerCelebrationIsMyEntry.value = Boolean(
    giveawayHasEntered.value &&
    giveawayUserStakeId.value &&
    giveawayUserStakeId.value.toLowerCase() === giveawayWinnerStakeId.value.toLowerCase()
  );
  launchConfetti();
  playCelebrationSound();
  showWinnerCelebrationModal.value = true;
}

function persistRecentGiveawayParticipants(participants: string[]) {
  recentGiveawayParticipants.value = participants;
  localStorage.setItem('recent_giveaway_participants', JSON.stringify(participants));
}

function hydrateRecentGiveawayParticipants() {
  try {
    const raw = localStorage.getItem('recent_giveaway_participants');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    recentGiveawayParticipants.value = parsed
      .map((participant: unknown) => (typeof participant === 'string' ? participant.trim() : ''))
      .filter(Boolean);
  } catch {
    recentGiveawayParticipants.value = [];
  }
}

function extractParticipantStakeIds(statusData: any): string[] {
  const candidateLists: unknown[] = [
    statusData?.participants,
    statusData?.participant_stake_ids,
    statusData?.entries
  ];

  for (const candidate of candidateLists) {
    if (!Array.isArray(candidate)) continue;

    const parsed = candidate
      .map((item: unknown) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          const maybeStakeId = (item as any).stake_id;
          return typeof maybeStakeId === 'string' ? maybeStakeId.trim() : '';
        }
        return '';
      })
      .filter(Boolean);

    if (parsed.length > 0) {
      return Array.from(new Set(parsed));
    }
  }

  const fallback = [statusData?.winner_stake_id, statusData?.user_stake_id]
    .map((value: unknown) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);

  return Array.from(new Set(fallback));
}

async function fetchGiveawayStatus() {
  try {
    giveawayLoading.value = true;

    const { data, error } = await supabase.rpc('get_giveaway_status', {
      p_entry_token: giveawayEntryToken.value,
      p_device_fingerprint: giveawayDeviceFingerprint.value
    });
    if (error) throw error;

    if (data) {
      giveawayEntriesCount.value = Number(data.entries_count || 0);
      giveawaySlots.value = Number(data.slots_total || 20);
      giveawayHasEntered.value = Boolean(data.has_entered);
      giveawayUserStakeId.value = data.user_stake_id || '';
      giveawayWinnerStakeId.value = data.winner_stake_id || '';
      giveawayWinnerEntryId.value = data.winner_entry_id !== null && data.winner_entry_id !== undefined
        ? Number(data.winner_entry_id)
        : null;
      giveawayDrawSecondsRemaining.value = data.draw_seconds_remaining !== null && data.draw_seconds_remaining !== undefined
        ? Number(data.draw_seconds_remaining)
        : null;
      giveawayIsActive.value = Boolean(data.is_active);
      giveawayRoundId.value = data.giveaway_round_id !== null && data.giveaway_round_id !== undefined
        ? Number(data.giveaway_round_id)
        : null;
      giveawayName.value = data.name || 'Giveaway';
      giveawayPrize.value = data.prize || 'TBD';
      giveawayWinnerCount.value = Number(data.winner_count || 1);
      if (data.draw_after_minutes !== null && data.draw_after_minutes !== undefined) {
        giveawayDrawAfterMinutes.value = Number(data.draw_after_minutes || 720);
      } else {
        giveawayDrawAfterMinutes.value = Number(data.draw_after_hours || 12) * 60;
      }
      giveawayWinners.value = Array.isArray(data.winners) ? data.winners : [];
      giveawayParticipants.value = extractParticipantStakeIds(data);
      if (giveawayParticipants.value.length > 0) {
        persistRecentGiveawayParticipants(giveawayParticipants.value);
      }
    } else {
      giveawayEntriesCount.value = 0;
      giveawaySlots.value = 20;
      giveawayHasEntered.value = false;
      giveawayUserStakeId.value = '';
      giveawayWinnerStakeId.value = '';
      giveawayWinnerEntryId.value = null;
      giveawayDrawSecondsRemaining.value = null;
      giveawayIsActive.value = false;
      giveawayRoundId.value = null;
      giveawayName.value = 'Giveaway';
      giveawayPrize.value = 'TBD';
      giveawayWinnerCount.value = 1;
      giveawayDrawAfterMinutes.value = 720;
      giveawayWinners.value = [];
      giveawayParticipants.value = [];
    }
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.toLowerCase().includes('fetch')) {
      giveawayError.value = 'Network error. Retrying...';
    } else {
      giveawayError.value = msg || 'Failed to load giveaway status.';
    }
  } finally {
    giveawayLoading.value = false;
  }
}

async function submitGiveawayEntry() {
  giveawayError.value = '';
  giveawaySuccess.value = '';

  if (!user.value) {
    giveawayError.value = 'Login using discord to join the give away!';
    return;
  }

  if (!giveawayIsActive.value) {
    giveawayError.value = 'Giveaway is currently stopped by admin.';
    return;
  }

  const stakeId = giveawayStakeId.value.trim();
  if (!stakeId) {
    giveawayError.value = 'Please enter your Stake ID.';
    return;
  }

  if (giveawayHasEntered.value) {
    giveawayError.value = 'You already joined this giveaway.';
    return;
  }

  if (giveawayRemainingSlots.value <= 0) {
    giveawayError.value = 'Giveaway is already full.';
    return;
  }

  if (giveawayWinnerStakeId.value) {
    giveawayError.value = 'Winner already selected. This giveaway is closed.';
    return;
  }

  try {
    giveawaySubmitting.value = true;
    
    // Get Discord username if available
    const discordUsername = user.value?.user_metadata?.full_name || 
                            user.value?.user_metadata?.name || 
                            user.value?.user_metadata?.preferred_username ||
                            user.value?.user_metadata?.user_name;

    const { data, error } = await supabase.rpc('submit_giveaway_entry', {
      p_stake_id: stakeId,
      p_entry_token: giveawayEntryToken.value,
      p_device_fingerprint: giveawayDeviceFingerprint.value,
      p_discord_username: discordUsername || null
    });

    if (error) throw error;

    giveawayEntriesCount.value = Number(data?.entries_count || giveawayEntriesCount.value + 1);
    giveawayHasEntered.value = true;
    giveawayUserStakeId.value = data?.stake_id || stakeId;
    giveawayWinnerStakeId.value = data?.winner_stake_id || giveawayWinnerStakeId.value;
    giveawayDrawSecondsRemaining.value = data?.draw_seconds_remaining !== null && data?.draw_seconds_remaining !== undefined
      ? Number(data.draw_seconds_remaining)
      : giveawayDrawSecondsRemaining.value;
    giveawaySuccess.value = 'You are in! Your giveaway entry has been recorded.';
    if (!giveawayParticipants.value.includes(giveawayUserStakeId.value)) {
      giveawayParticipants.value = [giveawayUserStakeId.value, ...giveawayParticipants.value];
      persistRecentGiveawayParticipants(giveawayParticipants.value);
    }
    try {
      await supabase.rpc('log_activity', {
        p_action: 'giveaway_join',
        p_message: `${giveawayUserStakeId.value} joined giveaway`,
        p_metadata: {
          stake_id: giveawayUserStakeId.value,
          giveaway_round_id: giveawayRoundId.value,
          entries_count: giveawayEntriesCount.value
        }
      });
    } catch {}
    giveawayStakeId.value = '';
  } catch (err: any) {
    giveawayError.value = err?.message || 'Unable to submit giveaway entry.';
  } finally {
    giveawaySubmitting.value = false;
  }
}

function isPickSubscriberOnly(pick: any): boolean {
  const v = pick?.is_subscriber_only;
  if (v === true || v === 1) return true;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 't' || s === 'yes';
  }
  return false;
}

const isPickLocked = (pick: any) => {
  if (!isPickSubscriberOnly(pick) || isVip.value) return false;
  const settled = pick.result && pick.result !== 'Upcoming';
  if (settled) return false;
  return true;
};

// Parlay Modal State
const isParlayModalOpen = ref(false);
const selectedParlay = ref<any>(null);

const openParlayModal = (pick: any) => {
  selectedParlay.value = pick;
  isParlayModalOpen.value = true;
};

const closeParlayModal = () => {
  isParlayModalOpen.value = false;
  selectedParlay.value = null;
};

const getPickStatus = (pick: any) => {
  // Use statusTicker to ensure reactivity
  statusTicker.value;
  
  if (!pick.date || !pick.start_time) return 'UPCOMING';
  try {
    const now = new Date();
    const pickDateTime = new Date(`${pick.date}T${pick.start_time}`);
    return now >= pickDateTime ? 'LIVE' : 'UPCOMING';
  } catch (e) {
    return 'UPCOMING';
  }
};

const currentTab = ref('HOME');
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

// Add a reactive ticker to force status updates
const statusTicker = ref(0);
let statusInterval: any = null;
let giveawayCountdownInterval: any = null;
let giveawayStatusInterval: any = null;

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.relative')) {
    isUserDropdownOpen.value = false;
  }
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
  if (!scrollSaveTimeout) {
    scrollSaveTimeout = setTimeout(() => {
      localStorage.setItem('home_scroll_pos', window.scrollY.toString());
      scrollSaveTimeout = null;
    }, 500);
  }
};

onMounted(() => {
  statusInterval = setInterval(() => {
    statusTicker.value++;
  }, 60000); // Update every minute
  window.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  if (statusInterval) clearInterval(statusInterval);
  if (giveawayCountdownInterval) clearInterval(giveawayCountdownInterval);
  if (giveawayStatusInterval) clearInterval(giveawayStatusInterval);
  window.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll);
});

// Settings state
const siteSettings = computed(() => settingsStore.settings);

// Navigation links using the new settings store
const discordLink = computed(() => siteSettings.value.discord_link);
const xLink = computed(() => siteSettings.value.x_link);
const instagramLink = computed(() => siteSettings.value.instagram_link);
const stakeMainLink = computed(() => siteSettings.value.stake_main_link);
const stakeGamesLink = computed(() => siteSettings.value.stake_games_link);
const stakeComLink = computed(() => siteSettings.value.stake_com_link);
const subscriptionLink = computed(() => siteSettings.value.subscription_link);
const imagePosition = ref(65)
async function fetchSettings() {  
  await settingsStore.fetchSettings();
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

const formatExternalLink = (url: string) => {
  if (!url || url === '#') return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

const tabs = ['HOME', 'PICKS', 'CALENDAR', 'LEADERBOARD', 'SOCIALS'];

const tabIcons: Record<string, string> = {
  'HOME': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  'PICKS': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'CALENDAR': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'LEADERBOARD': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10m14 0v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14',
  'SOCIALS': 'M13 10V3L4 14h7v7l9-11h-7z'
};

const isDownloading = ref(false);

async function downloadStatsCard() {
  isDownloading.value = true;

  try {
    const canvas = document.createElement('canvas');
    // 9:16 portrait (e.g. story-style); design drawn in 800×1000 then scaled to width
    const W = 1080;
    const H = 1920;
    const designW = 800;
    const designH = 1000;
    const exportScale = W / designW;
    const scaledDesignH = designH * exportScale;
    const padY = (H - scaledDesignH) / 2;

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Load Background Image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = bannerImageUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Draw Background Image (Cover style) on full 9:16 canvas
    const imgAspect = img.width / img.height;
    const canvasAspect = W / H;
    let drawW = 0, drawH = 0, drawX = 0, drawY = 0;

    if (imgAspect > canvasAspect) {
      drawH = H;
      drawW = H * imgAspect;
      drawX = (W - drawW) * (imagePosition.value / 100);
      drawY = 0;
    } else {
      drawW = W;
      drawH = W / imgAspect;
      drawX = 0;
      drawY = (H - drawH) / 2;
    }

    // Background base color
    ctx.fillStyle = '#0c0c0e';
    ctx.fillRect(0, 0, W, H);
    
    // Draw the image
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Subtle dark gradient overlay to make stats readable
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(0,0,0,0.5)');
    grad.addColorStop(0.3, 'rgba(0,0,0,0.3)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.4)');
    grad.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stats (logical 800×1000 space, scaled to canvas width, vertically centered)
    ctx.save();
    ctx.translate(0, padY);
    ctx.scale(exportScale, exportScale);

    const stats = [
      {
        label: '⚡ LIVE PICKS',
        value: `${activePlays.value}`,
        sub: 'ACTIVE',
        valueColor: '#f59e0b',
        dotColor: '#f59e0b',
      },
      {
        label: '🔥 STREAK',
        value: `${winsToday.value}`,
        sub: 'WINS TODAY',
        valueColor: '#4ade80',
        dotColor: '#f59e0b',
      },
      {
        label: '💸 THIS DAY',
        value: `${TodayProfit.value >= 0 ? '+' : ''}${formatCurrency(TodayProfit.value)}`,
        sub: '',
        valueColor: '#4ade80',
        dotColor: '#22c55e',
      },
      {
        label: '💸 THIS WEEK',
        value: `${weeklyProfit.value >= 0 ? '+' : ''}${formatCurrency(weeklyProfit.value)}`,
        sub: '',
        valueColor: '#4ade80',
        dotColor: '#22c55e',
      },
      {
        label: '💸 THIS YEAR',
        value: `${totalvalue.value + weeklyProfit2.value >= 0 ? '+' : ''}${formatCurrency(totalvalue.value + weeklyProfit2.value)}`,
        sub: '',
        valueColor: '#4ade80',
        dotColor: '#22c55e',
      },
    ];

    const rotations = [-0.015, -0.03, 0.015, 0.015, 0.01];
    let y = 70;

    stats.forEach((s, i) => {
      const x = 50, bw = 500, bh = 140; // Increased width and height significantly
      const cx = x + bw / 2, cy = y + bh / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotations[i] || 0);
      ctx.translate(-cx, -cy);

      // Shadow for the pill
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;

      // Pill background
      ctx.fillStyle = 'rgba(10,10,12,0.92)'; // Darker and more opaque
      roundRect(x, y, bw, bh, 28);
      ctx.fill();
      
      // Reset shadow for stroke and text
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dot with glow
      ctx.shadowColor = s.dotColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x + 30, y + 38, 7, 0, Math.PI * 2);
      ctx.fillStyle = s.dotColor;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label (Top)
      ctx.font = 'bold 18px Inter, system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, x + 50, y + 45);

      // Value (Big Number) - with Auto-scaling
      let fontSize = 72;
      ctx.font = `900 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
      let valueWidth = ctx.measureText(s.value).width;
      
      // If there's a sub-label, we need extra space for it
      const minPaddingRight = s.sub ? 160 : 60;
      
      while (valueWidth > (bw - minPaddingRight) && fontSize > 32) {
        fontSize -= 4;
        ctx.font = `900 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
        valueWidth = ctx.measureText(s.value).width;
      }

      ctx.fillStyle = s.valueColor;
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fillText(s.value, x + 25, y + 110);
      ctx.shadowBlur = 0;

      // Sub label (Positioned clearly to the right of the number)
      if (s.sub) {
        ctx.font = '900 20px Inter, system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        // Positioned after the number with a fixed 20px gap
        ctx.fillText(s.sub, x + 45 + valueWidth, y + 105);
      }

      ctx.restore();
      y += 160; // Increased spacing
    });

    // Divider
    // const divY = y + 12;
    // ctx.fillStyle = 'rgba(255,255,255,0.15)';
    // ctx.fillRect(40, divY, W - 80, 1);

    // Join the Club
    // ctx.font = '900 64px Inter, system-ui, -apple-system, sans-serif';
    // ctx.fillStyle = '#ffffff';
    // ctx.textAlign = 'left';
    // ctx.shadowColor = 'rgba(0,0,0,0.5)';
    // ctx.shadowBlur = 10;
    // ctx.fillText('JOIN THE CLUB', 60, divY + 90);

    // ctx.font = '900 18px Inter, system-ui, -apple-system, sans-serif';
    // ctx.fillStyle = '#f59e0b';
    // ctx.shadowBlur = 5;
    // ctx.fillText('DUBCLUB VIP PARTNER  ·  24/7 SUPPORT', 60, divY + 130);
    // ctx.shadowBlur = 0;

    // // Watermark
    // ctx.font = '900 28px Inter, system-ui, -apple-system, sans-serif';
    // ctx.fillStyle = '#ffffff';
    // ctx.textAlign = 'right';
    // ctx.fillText('MARKO', W - 150, H - 40);
    // ctx.fillStyle = '#f59e0b';
    // ctx.fillText('PICKS', W - 60, H - 40);

    const link = document.createElement('a');
    link.download = `markopicks-stats-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
  } catch (error) {
    console.error('Download failed:', error);
  } finally {
    isDownloading.value = false;
  }
}

const sportIconPaths: Record<string, string> = {
  tennis: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9.5 9.5a5 5 0 017 7 M14.5 14.5a5 5 0 01-7-7',
  basketball: 'M12 2a10 10 0 100 20 10 10 0 000-20z M12 2v20 M2 12h20 M5.5 5.5l13 13 M18.5 5.5l-13 13',
  soccer: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-18l2 3.5h-4L12 4zm6.5 4l-1.5 4-3.5-1.5 1-4.5 4 2zm-13 0l4-2 1 4.5-3.5 1.5-1.5-4zm1.5 10l-1.5-4 4-2 2 3.5-4.5 2.5zm11.5 0l-4.5-2.5 2-3.5 4 2-1.5 4z',
  football: 'M12 2C6.477 2 2 6.477 2 12c0 .273.011.544.032.812C3.252 11.234 6.364 10 10 10c.813 0 1.594.062 2.333.178.613-.116 1.25-.178 1.901-.178 4.223 0 7.732 2.656 8.734 6.182.021-.268.032-.539.032-.812 0-5.523-4.477-10-10-10z M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-.273-.011-.544-.032-.812-1.002-3.526-4.511-6.182-8.734-6.182-.651 0-1.288.062-1.901.178-.739-.116-1.52-.178-2.333-.178-3.636 0-6.748 1.234-7.968 2.812C2.011 11.456 2 11.727 2 12z M10 10v4 M14 10v4 M7 12h10',
  baseball: 'M12 2a10 10 0 100 20 10 10 0 000-20z M7 7c2 1 3 4 3 7s-1 6-3 7 M17 7c-2 1-3 4-3 7s1 6 3 7 M12 2v2 M12 20v2 M2 12h2 M20 12h2',
  hockey: 'M12 2a10 10 0 100 20 10 10 0 000-20z M8 6l8 12 M16 6l-8 12',
  combat: 'M12 2a10 10 0 100 20 10 10 0 000-20z M12 6v12 M6 12h12 M8.5 8.5l7 7 M15.5 8.5l-7 7',
  golf: 'M12 2a10 10 0 100 20 10 10 0 000-20z M12 6v10 M10 18h4',
  default: 'M13 10V3L4 14h7v7l9-11h-7z'
};

const getSportIcon = (sport: string) => {
  const s = sport.toLowerCase();
  if (s.includes('tennis')) return 'tennis';
  if (s.includes('basketball')) return 'basketball';
  if (s.includes('soccer') || s.includes('football') && !s.includes('american')) return 'soccer';
  if (s.includes('american football') || s.includes('nfl')) return 'football';
  if (s.includes('baseball') || s.includes('mlb')) return 'baseball';
  if (s.includes('hockey') || s.includes('nhl')) return 'hockey';
  if (s.includes('boxing') || s.includes('ufc') || s.includes('mma')) return 'combat';
  if (s.includes('golf')) return 'golf';
  return 'default';
};

const parseParlayPicks = (title: string) => {
  if (!title) return [];
  const rawLegs = title.split(/\s*\+\s*|\n/).map(p => p.trim()).filter(p => p.length > 0);
  
  return rawLegs.map(legStr => {
    const oddsMatch = legStr.match(/\(([^)]+)\)$/);
    if (oddsMatch) {
      const title = legStr.replace(/\(([^)]+)\)$/, '').trim();
      const odds = oddsMatch[1];
      return { title, odds };
    }
    return { title: legStr, odds: null };
  });
};

const scrollToSection = (tab: string) => {
  currentTab.value = tab;
  const element = document.getElementById(tab.toLowerCase());
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

async function handleLogout() {
  await logout();
  window.location.href = '/login';
}

const allPicksForStats = computed(() => picksStore.allStats);
const loadingLive = computed(() => picksStore.loadingLive);

async function fetchLivePicks() {
  await picksStore.fetchLivePicks();
}

async function fetchHistoricalPicks(retryCount = 0) {
  try {
    loadingPicks.value = true;
    
    const from = (currentPage.value - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase
      .from('picks')
      .select('id, date, start_time, title, sport, match_name, odds, wager, units, profit, units_earned, result, is_live, is_subscriber_only, is_parlay, bet_type', { count: 'estimated' });

    if (pickFilter.value === 'Active') {
      query = query.eq('is_live', true);
    } else if (pickFilter.value === 'Won') {
      query = query.eq('result', 'Win').eq('is_live', false);
    } else if (pickFilter.value === 'Lost') {
      query = query.eq('result', 'Loss').eq('is_live', false);
    } else if (pickFilter.value === 'Past') {
      query = query.neq('result', 'Upcoming').eq('is_live', false);
    } else {
      query = query.eq('is_live', false);
    }

    if (pickFilter.value === 'Active') {
      query = query.order('date', { ascending: true }).order('start_time', { ascending: true });
    } else {
      query = query.order('date', { ascending: false }).order('start_time', { ascending: false }).order('created_at', { ascending: false });
    }

    query = query.range(from, to);
      
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Picks fetch timeout')), 15000)
    )

    const { data, error, count } = await Promise.race([query, timeoutPromise]) as any
    
    if (error) throw error
    if (data) {
      picks.value = data;
      if (count !== null) totalHistoricalPicks.value = count;
    }
  } catch (err: any) {
    if (retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      return fetchHistoricalPicks(retryCount + 1)
    }
  } finally {
    if (retryCount >= 2 || (picks.value && picks.value.length > 0)) {
      loadingPicks.value = false;
    }
  }
}

async function fetchAllPicksForStats() {
  await picksStore.fetchAllStats(true);
}

async function fetchLeaderboard() {
  const cacheKey = 'discord_leaderboard_cache_v1';

  const loadLeaderboardCache = () => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.players) || parsed.players.length === 0) return false;
      leaderboardUsers.value = parsed.players;
      leaderboardUsingCachedData.value = true;
      return true;
    } catch {
      return false;
    }
  };

  const mapPlayers = (data: any) => {
    return data.players.slice(0, 20).map((player: any, idx: number) => ({
      id: player.id || `${player.username}-${idx}`,
      name: player.username,
      points: (player.message_count || 0).toLocaleString(),
      xp: player.xp,
      avatar: player.avatar ? `https://cdn.discordapp.com/avatars/${player.id}/${player.avatar}.png` : null,
      initials: (player.username || 'U').substring(0, 1).toUpperCase(),
      level: player.level,
      rank: player.rank || idx + 1
    }));
  };

  try {
    loadingLeaderboard.value = true;
    leaderboardError.value = '';
    leaderboardUsingCachedData.value = false;

    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch('/api/mee6/1397542516579893318');
        const responseText = await response.text();
        let payload: any = null;
        try {
          payload = responseText ? JSON.parse(responseText) : null;
        } catch {
          payload = null;
        }

        if (!response.ok) {
          const detailedMessage = payload?.message || payload?.error?.message || `Status ${response.status}`;
          throw new Error(`MEE6 unavailable (${detailedMessage})`);
        }

        if (!payload?.players || !Array.isArray(payload.players)) {
          throw new Error('Invalid leaderboard payload.');
        }

        leaderboardUsers.value = mapPlayers(payload);
        localStorage.setItem(cacheKey, JSON.stringify({
          players: leaderboardUsers.value,
          updatedAt: new Date().toISOString()
        }));
        lastError = '';
        break;
      } catch (err: any) {
        lastError = err?.message || 'Unknown leaderboard error';
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1200 * (attempt + 1)));
        }
      }
    }

    if (lastError) {
      const hasCache = loadLeaderboardCache();
      if (!hasCache) leaderboardUsers.value = [];
      leaderboardError.value = hasCache
        ? `Live leaderboard temporarily unavailable (${lastError}). Showing cached results.`
        : `Live leaderboard unavailable (${lastError}). Please try again in a minute.`;
    }
  } catch {
    const hasCache = loadLeaderboardCache();
    if (!hasCache) leaderboardUsers.value = [];
    leaderboardError.value = hasCache
      ? 'Live leaderboard unavailable. Showing cached results.'
      : 'Live leaderboard unavailable. Please try again in a minute.';
  } finally {
    loadingLeaderboard.value = false;
  }
}

const livePicks = computed(() => picksStore.livePicks);
const historicalPicks = computed(() => picks.value);

const totalPages = computed(() => Math.ceil(totalHistoricalPicks.value / itemsPerPage));

function formatLocalYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Week begins Sunday (local). Returns that Sunday at local midnight. */
function startOfWeekSundayLocal(d: Date): Date {
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = local.getDay();
  local.setDate(local.getDate() - dow);
  return local;
}

const TodayProfit = computed(() => {
  statusTicker.value;
  const todayStr = formatLocalYmd(new Date());
  return allPicksForStats.value
    .filter(p => !p.is_live && p.date === todayStr)
    .reduce((sum, p) => sum + Number(p.profit), 0);
});


const weeklyProfit = computed(() => {
  statusTicker.value;
  const now = new Date();
  const weekStart = startOfWeekSundayLocal(now);
  const startStr = formatLocalYmd(weekStart);
  const endStr = formatLocalYmd(now);
  return allPicksForStats.value
    .filter(p => {
      if (p.is_live || !p.date) return false;
      return p.date >= startStr && p.date <= endStr;
    })
    .reduce((sum, p) => sum + Number(p.profit), 0);
});


const weeklyProfit2 = computed(() => {
  return allPicksForStats.value
    .filter(p => !p.is_live)
    .reduce((sum, p) => sum + Number(p.profit), 0);
});

const winsToday = computed(() => {
  statusTicker.value;
  const today = formatLocalYmd(new Date());
  return allPicksForStats.value.filter(p => p.date === today && p.result === 'Win').length;
});

const activePlays = computed(() => {
  return livePicks.value.length;
});

const winRate = computed(() => {
  const settled = allPicksForStats.value
    .filter(p => !p.is_live && p.result !== 'Upcoming');
  if (settled.length === 0) return 0;
  const wins = settled.filter(p => p.result === 'Win').length;
  return Math.round((wins / settled.length) * 100);
});

const lossRate = computed(() => {
  const settled = allPicksForStats.value
    .filter(p => !p.is_live && p.result !== 'Upcoming');
  if (settled.length === 0) return 0;
  const losses = settled.filter(p => p.result === 'Loss').length;
  return Math.round((losses / settled.length) * 100);
});

const totalPicksCount = computed(() => allPicksForStats.value.length);
const picksWonCount = computed(() => allPicksForStats.value.filter(p => p.result === 'Win').length);
const picksLossCount = computed(() => allPicksForStats.value.filter(p => p.result === 'Loss').length);
const picksWonVipCount = computed(() =>
  allPicksForStats.value.filter(p => p.result === 'Win' && isPickSubscriberOnly(p)).length
);
const picksLossVipCount = computed(() =>
  allPicksForStats.value.filter(p => p.result === 'Loss' && isPickSubscriberOnly(p)).length
);

const highestWinningPick = computed(() => {
  const settled = allPicksForStats.value.filter(p => p.result === 'Win');
  if (settled.length === 0) return 0;
  return Math.max(...settled.map(p => Number(p.profit)));
});

const averageProfitPerPick = computed(() => {
  const settled = allPicksForStats.value.filter(p => p.result !== 'Upcoming');
  if (settled.length === 0) return 0;
  const totalProfit = settled.reduce((sum, p) => sum + Number(p.profit), 0);
  return totalProfit / settled.length;
});

const pickFilter = ref('Active');

const isScrolled = ref(false);
let scrollSaveTimeout: any = null;

onMounted(async () => {
  await initAuth();
  hydrateRecentGiveawayParticipants();

  const tokenKey = 'giveaway_entry_token';
  const existingToken = localStorage.getItem(tokenKey);
  if (existingToken) {
    giveawayEntryToken.value = existingToken;
  } else {
    const newToken = crypto.randomUUID();
    giveawayEntryToken.value = newToken;
    localStorage.setItem(tokenKey, newToken);
  }

  const fingerprintParts = [
    navigator.platform || '',
    navigator.language || '',
    (navigator.languages || []).join(','),
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    String(screen.width || ''),
    String(screen.height || ''),
    String(window.devicePixelRatio || ''),
    String(navigator.hardwareConcurrency || ''),
    String((navigator as any).deviceMemory || '')
  ].join('|');

  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(fingerprintParts));
  giveawayDeviceFingerprint.value = Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const savedScroll = localStorage.getItem('home_scroll_pos');
  if (savedScroll) {
    setTimeout(() => {
      window.scrollTo({
        top: parseInt(savedScroll),
        behavior: 'instant'
      });
    }, 100);
  }

  // Safety timeout: Ensure loading screen disappears after 10 seconds no matter what
  const loadingTimeout = setTimeout(() => {
    if (isPageLoading.value) {
      //console.warn('Home: Loading screen timed out, forcing display');
      isPageLoading.value = false;
    }
  }, 10000);

  try {
    await Promise.all([
      fetchLivePicks(),
      fetchHistoricalPicks(),
      fetchSettings(),
      fetchAllPicksForStats(),
      fetchLeaderboard(),
      fetchGiveawayStatus()
    ]);
  } catch (err) {
    // error handled in individual fetch functions
  } finally {
    clearTimeout(loadingTimeout);
    // Ensure loading screen stays for at least 1.5s for branding impact
    setTimeout(() => {
      isPageLoading.value = false;
    }, 1500);
  }

  giveawayCountdownInterval = setInterval(() => {
    if (giveawayDrawSecondsRemaining.value !== null && giveawayDrawSecondsRemaining.value > 0) {
      giveawayDrawSecondsRemaining.value -= 1;
    }
  }, 1000);

  giveawayStatusInterval = setInterval(() => {
    fetchGiveawayStatus();
  }, 60000);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        currentTab.value = entry.target.id.toUpperCase();
      }
    });
  }, { threshold: 0.3 });

  tabs.forEach(tab => {
    const el = document.getElementById(tab.toLowerCase());
    if (el) observer.observe(el);
  });
});

watch(userProfile, (newProfile) => {
  if (newProfile && picks.value.length === 0) {
    fetchLivePicks();
    fetchHistoricalPicks();
    fetchSettings();
  }
});

watch(
  [giveawayWinnerStakeId, giveawayRoundId],
  () => {
    maybeCelebrateWinner();
  },
  { immediate: true }
);

async function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  await fetchHistoricalPicks();
  const el = document.getElementById('picks');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

watch(pickFilter, async () => {
  currentPage.value = 1;
  await fetchHistoricalPicks();
});

const socials = [
  { name: 'Discord',  desc: 'Join our VIP community for daily picks and exclusive chat', icon: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3333-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3333-.946 2.4189-2.1568 2.4189Z', color: 'text-amber-500' },
  { name: 'X', desc: 'Real-time updates and live picks', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', color: 'text-blue-400' },
  { name: 'Instagram', desc: 'Behind the scenes and highlights', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z', color: 'text-pink-500' },
];

const formatCurrency = (value: any) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(num) ? 0 : num);
};

// Calendar Logic
const currentCalendarDate = ref(new Date());
const calendarDays = computed(() => {
  const year = currentCalendarDate.value.getFullYear();
  const month = currentCalendarDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  const days = [];
  
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ day: null, date: null });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dailyPicks = allPicksForStats.value.filter(p => p.date === dateStr && p.result !== 'Upcoming');
    const dailyProfit = dailyPicks.reduce((sum, p) => sum + Number(p.profit), 0);
    
    days.push({
      day: i,
      date: dateStr,
      profit: dailyProfit,
      hasPicks: dailyPicks.length > 0
    });
  }
  
  return days;
});

const calendarMonthName = computed(() => {
  return currentCalendarDate.value.toLocaleString('default', { month: 'long', year: 'numeric' });
});

const nextMonth = () => {
  const next = new Date(currentCalendarDate.value);
  next.setMonth(next.getMonth() + 1);
  currentCalendarDate.value = next;
};

const prevMonth = () => {
  const prev = new Date(currentCalendarDate.value);
  prev.setMonth(prev.getMonth() - 1);
  currentCalendarDate.value = prev;
};

const selectedDate = ref<string | null>(null);
const isDateModalOpen = ref(false);
const selectedDatePicks = computed(() => {
  if (!selectedDate.value) return [];
  return allPicksForStats.value.filter(p => p.date === selectedDate.value);
});

const openDateModal = (day: any) => {
  if (!day.day || !day.hasPicks) return;
  selectedDate.value = day.date;
  isDateModalOpen.value = true;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};
</script>

<template>
  <!-- Global Loading Screen -->
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-700 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isPageLoading" class="fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center">
      <div class="relative group">
        <!-- Glow Effect -->
        <div class="absolute -inset-8 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        <!-- Loading Image & Rings -->
        <div class="relative w-48 h-48 md:w-64 md:h-64 flex flex-col items-center justify-center space-y-8">
          <!-- Outer Rotating Ring -->
          <div class="absolute inset-0 border-2 border-dashed border-amber-500/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
          <!-- Inner Rotating Ring (Reverse) -->
          <div class="absolute inset-4 border border-dashed border-amber-500/40 rounded-full animate-[spin_12s_linear_infinite_reverse]"></div>
          
          <img 
            :src="loadingImageUrl" 
            alt="Loading..." 
            class="w-4/5 h-4/5 object-contain animate-loading-pulse drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]"
          />
          
          <div class="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4">
            <!-- Progress Indicator -->
            <div class="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
              <div class="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 animate-loading-bar shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
            </div>
            
            <p class="text-[9px] font-black uppercase tracking-[0.6em] text-amber-500/90 animate-pulse">Initializing</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <div class="min-h-screen bg-white dark:bg-[#09090b] text-gray-900 dark:text-gray-100 font-sans relative overflow-x-hidden transition-colors duration-500">

    <!-- Navbar -->
    <nav 
      class="fixed left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 w-fit max-w-[95vw]"
      :class="isScrolled ? 'top-4' : 'top-8'"
    >
      <div 
        class="flex items-center gap-1 sm:gap-1.5 backdrop-blur-2xl p-1 sm:p-1.5 rounded-[2rem] border transition-all duration-700 shadow-2xl"
        :class="isScrolled 
          ? 'bg-black/60 dark:bg-black/40 border-white/10 scale-90 px-2 sm:px-3' 
          : 'bg-black/20 dark:bg-white/5 border-white/10 scale-100'"
      >
        <button 
          v-for="tab in tabs" 
          :key="tab"
          @click="scrollToSection(tab)"
          class="group relative flex items-center lg:gap-2.5 py-2.5 sm:py-3 px-3 sm:px-5 rounded-[1.5rem] transition-all duration-500 overflow-hidden shrink-0"
          :class="currentTab === tab ? 'bg-white dark:bg-white text-amber-600 shadow-xl' : 'text-white/70 hover:text-white hover:bg-white/10'"
        >
          <div v-if="currentTab === tab" class="absolute inset-0 bg-gradient-to-r from-amber-50 to-white opacity-100"></div>
          
          <svg 
            class="w-4 h-4 relative z-10 transition-transform duration-500 group-hover:scale-110" 
            :class="currentTab === tab ? 'text-amber-600' : 'text-white/60 group-hover:text-white'"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="tabIcons[tab]"></path>
          </svg>

          <span 
            class="hidden lg:block text-[10px] font-black uppercase tracking-widest relative z-10 transition-all duration-500"
            :class="[
              currentTab === tab ? 'max-w-[100px] opacity-100 ml-0' : 'max-w-0 opacity-0 -ml-2 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-0'
            ]"
          >
            {{ tab }}
          </span>
        </button>

        <!-- Mobile Actions Integration -->
        <div class="flex lg:hidden items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 pl-1 sm:pl-2 border-l border-white/10">
          <div v-if="user" class="relative">
            <button 
              @click="isUserDropdownOpen = !isUserDropdownOpen"
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-transform overflow-hidden border border-amber-500/20"
            >
              <img v-if="user.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" class="w-full h-full object-cover" />
              <span v-else>{{ user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) }}</span>
            </button>
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div 
                v-if="isUserDropdownOpen"
                class="absolute right-0 mt-4 w-56 origin-top-right bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-3xl py-3 z-[110] backdrop-blur-xl"
              >
                <div class="px-5 py-4 border-b border-gray-100 dark:border-white/5 mb-2">
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated</p>
                  <p class="text-[11px] font-bold text-gray-900 dark:text-white truncate">{{ user.email }}</p>
                </div>
                <router-link 
                  v-if="userProfile?.role === 'superuser'" 
                  to="/admin"
                  @click="isUserDropdownOpen = false"
                  class="flex items-center gap-3 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                  Admin Panel
                </router-link>
                <button 
                  @click="handleLogout"
                  class="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign Out
                </button>
              </div>
            </transition>
          </div>
          <router-link v-else to="/login" class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </router-link>

          <div @click="toggleDarkMode" class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all border border-white/5 shadow-lg">
            <svg v-if="!isDarkMode" class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path></svg>
            <svg v-else class="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
          </div>
        </div>
      </div>
    </nav>

    <!-- Sidebar / Floating Elements -->
    <div class="fixed top-8 left-8 z-[100] hidden lg:block">
      <div class="flex items-center gap-3 cursor-pointer group" @click="scrollToSection('HOME')">
        <div class="p-2.5 transition-all group-hover:scale-110 group-hover:rotate-3">
          <img src="../assets/images/MarkoPicks_Logo.ico" class="w-12 h-12" alt="Marko Picks Logo" />
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-black italic text-gray-900 dark:text-white tracking-tighter leading-none">MARKO PICKS</span>
        </div>
      </div>
    </div>

    <!-- Right Side Actions -->
    <div class="fixed top-8 right-8 z-[100] hidden lg:flex items-center gap-4">
      <div v-if="user" class="relative">
        <button 
          @click="isUserDropdownOpen = !isUserDropdownOpen"
          class="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all group shadow-2xl"
        >
          <div class="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-[10px] uppercase shadow-lg overflow-hidden border border-amber-500/20">
            <img v-if="user.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" class="w-full h-full object-cover" />
            <span v-else>{{ user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) }}</span>
          </div>
          <svg 
            class="w-3 h-3 text-white transition-transform duration-300" 
            :class="isUserDropdownOpen ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div 
            v-if="isUserDropdownOpen"
            class="absolute right-0 mt-4 w-56 origin-top-right bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-3xl py-3 z-[100] backdrop-blur-xl"
          >
            <div class="px-5 py-4 border-b border-gray-100 dark:border-white/5 mb-2">
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated</p>
              <p class="text-[11px] font-bold text-gray-900 dark:text-white truncate">{{ user.email }}</p>
            </div>

            <router-link 
              v-if="userProfile?.role === 'superuser' || profile?.role === 'superuser'" 
              to="/admin"
              @click="isUserDropdownOpen = false"
              class="flex items-center gap-3 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
              Admin Panel
            </router-link>

            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Sign Out
            </button>
          </div>
        </transition>
      </div>
      
      <div v-else class="flex items-center">
        <router-link to="/login" class="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all shadow-2xl">Login</router-link>
      </div>

      <div @click="toggleDarkMode" class="w-12 h-7 rounded-full flex items-center px-1.5 cursor-pointer transition-all duration-500 border backdrop-blur-xl shadow-2xl" :class="isDarkMode ? 'bg-amber-600/20 border-white/10' : 'bg-white/10 border-white/10'">
        <div class="w-4 h-4 rounded-full bg-white shadow-xl transform transition-transform duration-500 flex items-center justify-center" :class="isDarkMode ? 'translate-x-5' : 'translate-x-0'">
          <svg v-if="!isDarkMode" class="w-2.5 h-2.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path></svg>
          <svg v-else class="w-2.5 h-2.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <section id="home" class="relative pt-32 pb-20 px-6 md:px-8 overflow-hidden min-h-[90vh] flex items-center">
      <!-- Full-screen Background with Overlay -->
      <div class="absolute inset-0 z-0">
        <img :src="homeBgUrl" class="w-full h-full object-cover" alt="Background" />
        <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20 dark:from-black/90 dark:via-black/70 dark:to-black/30"></div>
      </div>

      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl mx-auto w-full">
        <!-- Left Side: Typography & CTA (7 Cols) -->
        <div class="lg:col-span-7 space-y-10">
          <div class="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-white/10 dark:bg-white/5 border border-white/10 shadow-xl backdrop-blur-md">
            <span class="flex h-2 w-2 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-white">Live now</span>
          </div>

          <div class="space-y-4">
            <h1 class="text-5xl md:text-7xl lg:text-[10rem] font-black italic text-white leading-[0.8] tracking-tight">
              MARKO <br/> 
            </h1> 
            <h1 class="text-5xl md:text-7xl lg:text-[10rem] font-black italic text-white leading-[1] tracking-tight">
              <span class="inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 drop-shadow-2xl pr-5">PICKS</span>
            </h1>
            <br>
            <p class="text-white/80 text-2xl md:text-4xl font-medium max-w-xl leading-relaxed pl-2 border-l-4 border-yellow-500/30">
              Winning is a lifestyle
            </p>
          </div>

          <div class="space-y-8 pt-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
              <div class="flex items-start gap-4 group">
                <div class="mt-1 w-10 h-10 shrink-0 rounded-2xl bg-amber-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-500">
                  🎯
                </div>
                <div>
                  <h4 class="text-sm font-black text-white uppercase tracking-wider mb-1">Daily Locks</h4>
                  <p class="text-xs font-medium text-white/60 leading-relaxed">High-confidence picks updated daily.</p>
                </div>
              </div>

              <div class="flex items-start gap-4 group">
                <div class="mt-1 w-10 h-10 shrink-0 rounded-2xl bg-amber-500/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-500">
                  💬
                </div>
                <div>
                  <h4 class="text-sm font-black text-white uppercase tracking-wider mb-1">Winning Vibes</h4>
                  <p class="text-xs font-medium text-white/60 leading-relaxed">Chill community.</p>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-8">
                <button @click="scrollToSection('picks')" class="group relative px-12 py-6 bg-white text-black font-black rounded-[2rem] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-amber-500/20">
                  <div class="absolute inset-0 bg-gradient-to-r from-amber-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span class="relative z-10 flex items-center gap-3 uppercase text-sm tracking-widest">
                    Explore Picks
                    <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Side: Feature Banner & Card (5 Cols) -->
        <div class="lg:col-span-5 relative">
          <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-amber-600 to-purple-600 rounded-[4rem] blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            
            <div class="relative rounded-[1.5rem] bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden transition-all duration-700 group-hover:-translate-y-6">
              <div 
                class="aspect-[4/5] bg-cover bg-left relative overflow-hidden"
                :style="{ backgroundImage: `url(${bannerImageUrl})`, backgroundPosition: `${imagePosition}% center` }"
              >
                <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                
                  <div class="absolute top-3 left-3 md:top-8 md:left-8 flex flex-col gap-1.5 md:gap-3 z-20">
                    <!-- Grid for better mobile spacing -->
                    <div class="flex flex-col items-start gap-1.5 md:gap-3">
                      <div v-if="activePlays > 0" class="px-2.5 py-1.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 text-white space-y-0 transform -rotate-1 group-hover:rotate-0 transition-all duration-500 shadow-2xl w-fit min-w-[100px] md:min-w-[140px]">
                        <div class="flex items-center gap-1 md:gap-2 mb-0.5">
                          <span class="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse"></span>
                          <p class="text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] text-white/70">⚡ Live Picks</p>
                        </div>
                        <p class="text-base md:text-2xl font-black text-amber-500 italic tracking-tighter">{{ activePlays }} <span class="text-[7px] md:text-[10px] not-italic font-bold text-white/50 uppercase tracking-widest ml-0.5 md:ml-1">Active</span></p>
                      </div>

                      <div class="px-2.5 py-1.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 text-white space-y-0 transform -rotate-2 group-hover:rotate-0 transition-all duration-500 shadow-2xl w-fit min-w-[100px] md:min-w-[140px]">
                        <div class="flex items-center gap-1 md:gap-2 mb-0.5">
                          <span class="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse"></span>
                          <p class="text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] text-white/70">🔥 Streak</p>
                        </div>
                        <p class="text-base md:text-2xl font-black text-green-500 italic tracking-tighter">{{ winsToday }}  <span class="text-[7px] md:text-[10px] not-italic font-bold text-white/50 uppercase tracking-widest ml-0.5 md:ml-1">Wins Today</span></p>
                      </div>

                      <div class="px-2.5 py-1.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 text-white space-y-0 transform rotate-1 group-hover:rotate-0 transition-all duration-500 shadow-2xl w-fit min-w-[100px] md:min-w-[140px]">
                        <div class="flex items-center gap-1 md:gap-2 mb-0.5">
                          <span class="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></span>
                          <p class="text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] text-white/70">💸 This Day</p>
                        </div>
                        <p class="text-base md:text-2xl font-black text-green-400 italic tracking-tighter">{{ TodayProfit >= 0 ? '+' : '' }}{{ formatCurrency(TodayProfit) }}</p>
                      </div>

                      <div class="px-2.5 py-1.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 text-white space-y-0 transform rotate-1 group-hover:rotate-0 transition-all duration-500 shadow-2xl w-fit min-w-[100px] md:min-w-[140px]">
                        <div class="flex items-center gap-1 md:gap-2 mb-0.5">
                          <span class="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></span>
                          <p class="text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] text-white/70">💸 This Week</p>
                        </div>
                        <p class="text-base md:text-2xl font-black text-green-400 italic tracking-tighter">{{ weeklyProfit >= 0 ? '+' : '' }}{{ formatCurrency(weeklyProfit) }}</p>
                      </div>

                      <div class="px-2.5 py-1.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 text-white space-y-0 transform rotate-1 group-hover:rotate-0 transition-all duration-500 shadow-2xl w-fit min-w-[100px] md:min-w-[140px]">
                        <div class="flex items-center gap-1 md:gap-2 mb-0.5">
                          <span class="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></span>
                          <p class="text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] text-white/70">💸 This Year</p>
                        </div>
                        <p class="text-base md:text-2xl font-black text-green-400 italic tracking-tighter">{{ totalvalue + weeklyProfit2 >= 0 ? '+' : '' }}{{ formatCurrency(totalvalue+weeklyProfit2) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                              <div class="p-10 bg-white dark:bg-[#0c0c0e] relative z-10">
                <div class="flex items-center justify-between mb-8">
                  <div class="space-y-1">
                    <h3 class="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Join the Club</h3>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-black text-yellow-500 uppercase tracking-widest">DubClub VIP Partner</span>
                      <span class="w-1 h-1 rounded-full bg-gray-400"></span>
                      <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">24/7 Support</span>
                    </div>
                  </div>
                <button
                  @click="downloadStatsCard"
                  :disabled="isDownloading"
                  aria-label="Download stats card"
                  class="shrink-0 w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-300 flex items-center justify-center transition-all hover:border-amber-500/40 hover:text-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isDownloading" class="w-4 h-4 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></span>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v11m0 0l-4-4m4 4l4-4M4 17v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
                  </svg>
                </button>
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-sm font-medium mb-10 leading-relaxed">
                  Get instant access. 
                </p>
                <a :href="formatExternalLink(subscriptionLink)" target="_blank" class="relative group/btn block w-full py-6 bg-gray-900 dark:bg-white text-white dark:text-black text-center font-black rounded-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                  <span class="relative z-10 uppercase text-xs tracking-[0.3em]">Lock in Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -top-16 -left-16 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
  </section>

    <!-- My Picks Section -->
    <section id="picks" class="py-24 px-6 md:px-8 max-w-7xl mx-auto space-y-12">
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div class="space-y-4">
          <h2 class="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">My <span class="text-amber-500">Picks</span></h2>
          <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">Real-time updates on active plays.</p>
        </div>
        <div class="flex flex-col sm:flex-row items-center sm:items-center gap-4">
          <div class="hidden sm:block">
            <div class="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 uppercase tracking-widest">
              <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              LAST UPDATED: JUST NOW
            </div>
          </div>
          
          <div class="flex items-center justify-center gap-2 p-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl backdrop-blur-xl overflow-x-auto scrollbar-hide w-full sm:w-auto">
            <button 
              v-for="filter in ['Active', 'Won', 'Lost', 'All']" 
              :key="filter"
              @click="pickFilter = filter"
              class="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
              :class="pickFilter === filter ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/5'"
            >
              {{ filter }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Dashboard -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-[#18181b]/60 backdrop-blur-xl p-5 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-2xl transition-all hover:border-amber-500/20 group">
          <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 group-hover:text-amber-500 transition-colors">Current Balance</p>
          <p class="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">{{ formatCurrency(totalvalue + weeklyProfit2) }}</p>
        </div>

        <div class="bg-white dark:bg-[#18181b]/60 backdrop-blur-xl p-5 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-2xl transition-all hover:border-amber-500/20 group">
          <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 group-hover:text-amber-500 transition-colors">Numbers of Picks</p>
          <p class="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">{{ totalPicksCount }}</p>
        </div>

        <div class="bg-white dark:bg-[#18181b]/60 backdrop-blur-xl p-5 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-2xl transition-all hover:border-amber-500/20 group">
          <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 group-hover:text-green-500 transition-colors">Picks Won</p>
          <p class="text-2xl font-black text-green-500 italic tracking-tighter">{{ picksWonCount }}</p>
          <!-- <p class="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2 leading-relaxed">
            VIP {{ picksWonVipCount }} · Free {{ picksWonCount - picksWonVipCount }}
          </p> -->
        </div>

        <div class="bg-white dark:bg-[#18181b]/60 backdrop-blur-xl p-5 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-2xl transition-all hover:border-amber-500/20 group">
          <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 group-hover:text-red-500 transition-colors">Picks Loss</p>
          <p class="text-2xl font-black text-red-500 italic tracking-tighter">{{ picksLossCount }}</p>
          <!-- <p class="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2 leading-relaxed">
            VIP {{ picksLossVipCount }} · Free {{ picksLossCount - picksLossVipCount }}
          </p> -->
        </div>

        <!-- <div class="bg-white dark:bg-[#18181b]/60 backdrop-blur-xl p-5 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center shadow-2xl transition-all hover:border-amber-500/20 group">
          <p class="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 group-hover:text-amber-500 transition-colors">Win Rate</p>
          <p class="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter">{{ winRate }}%</p>
        </div> -->
      </div>

      <div v-if="loadingPicks" class="text-center py-20">
        <div class="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-xs font-black uppercase tracking-widest text-gray-500">Loading History...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="pick in historicalPicks" 
          :key="pick.id"
          class="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#121214] border shadow-2xl transition-all duration-500 hover:-translate-y-2 group flex flex-col min-h-[400px]"
          :class="[
            pick.result === 'Win' ? 'border-green-500/30 shadow-green-500/10 bg-green-500/[0.02]' : 
            pick.result === 'Loss' ? 'border-red-500/30 shadow-red-500/10 bg-red-500/[0.02]' : 
            'border-gray-200 dark:border-white/5'
          ]"
        >
          <!-- VIP Exclusive Overlay -->
          <div v-if="isPickLocked(pick)" class="absolute inset-0 z-30 p-8 text-center bg-white/80 dark:bg-[#0c0c0e]/20 backdrop-blur-md flex flex-col items-center justify-center">
            <img src="../assets/images/Dubclub.webp" class="w-16 h-16 rounded-2xl mb-6 shadow-2xl" alt="DubClub" />
            <h3 class="text-2xl font-black uppercase italic mb-3 text-gray-900 dark:text-white tracking-tighter">VIP Exclusive</h3>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-[200px] leading-relaxed">Subscribe to get this play.</p>
            <a 
              :href="formatExternalLink(subscriptionLink)" 
              target="_blank" 
              class="w-full py-4 bg-[#e67e00] hover:bg-[#ff8c00] text-white font-black rounded-2xl transition-all uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-[#e67e00]/20 hover:scale-[1.02] active:scale-[0.98] mb-8"
            >
              Unlock Picks
            </a>

            <div class="flex items-center gap-12 pt-6 border-t border-gray-200 dark:border-white/10 w-full justify-center">
              <div class="text-center">
                <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Wager</p>
                <p class="text-base font-black text-gray-900 dark:text-white italic tracking-tighter leading-none">{{ formatCurrency(pick.wager) }}</p>
              </div>
              <div class="text-center">
                <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Payout</p>
                <p class="text-base font-black text-amber-500 italic tracking-tighter leading-none">{{ formatCurrency(pick.wager * parseFloat(pick.odds)) }}</p>
              </div>
            </div>
          </div>

          <!-- Header -->
          <div class="relative z-10 p-6 flex items-center justify-between" :class="{'blur-md select-none pointer-events-none opacity-50': isPickLocked(pick)}">
            <div class="flex items-center gap-3">
              <span class="text-xl font-black italic tracking-tighter text-gray-900 dark:text-white uppercase">Marko <span class="text-amber-500">Picks</span></span>
              <span class="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border"
                :class="isPickSubscriberOnly(pick) 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                  : 'bg-gray-500/10 text-gray-500 border-gray-500/20'">
                {{ isPickSubscriberOnly(pick) ? 'VIP' : 'FREE' }}
              </span>
            </div>
            <div class="text-[10px] font-black text-gray-500 dark:text-gray-500 uppercase tracking-widest">
              {{ pick.date }} {{ pick.start_time }}
            </div>
          </div>

          <!-- Body -->
          <div class="relative z-10 px-6 py-4 flex flex-col flex-1" :class="{'blur-md select-none pointer-events-none opacity-50': isPickLocked(pick)}">
            <div class="flex items-start justify-between mb-8">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 group-hover:border-amber-500/30 transition-colors">
                  <svg v-if="pick.is_parlay" class="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                  <svg v-else class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="sportIconPaths[getSportIcon(pick.sport)]"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-black text-gray-900 dark:text-white uppercase leading-tight italic tracking-tighter">{{ pick.is_parlay ? 'PARLAY' : (pick.bet_type || pick.sport) }}</h3>
                </div>
              </div>
              
              <span 
                class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border transition-all" 
                :class="[
                  pick.result === 'Win' ? 'bg-green-500 text-white border-green-400/20' :
                  pick.result === 'Loss' ? 'bg-red-500 text-white border-red-400/20' :
                  pick.result === 'Refund' ? 'bg-gray-500 text-white border-white/10' :
                  getPickStatus(pick) === 'LIVE' ? 'bg-red-500 text-white border-red-400/20' :
                  'bg-indigo-500 text-white border-indigo-400/20'
                ]"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-white" :class="{'animate-pulse': getPickStatus(pick) === 'LIVE'}"></span>
                {{ (pick.result && pick.result !== 'Upcoming') ? pick.result : getPickStatus(pick) }}
              </span>
            </div>

            <!-- Content Pushed to Bottom -->
            <div class="relative z-10 flex-1 flex flex-col justify-end">
              <div v-if="pick.is_parlay" class="space-y-3 mb-8">
                <div v-for="(leg, idx) in [...parseParlayPicks(pick.title)].reverse().slice(0, 3)" :key="idx" class="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group-hover:bg-gray-100 dark:group-hover:bg-white/[0.08] transition-colors">
                  <div class="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                  <p class="text-sm font-black text-gray-800 dark:text-white/90 leading-tight italic">{{ leg.title }}</p>
                </div>
              </div>
              <div v-else class="mb-8">
                <h4 class="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight italic tracking-tighter">{{ pick.title }}</h4>
                <p class="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-wider pl-1">{{ pick.match_name }}</p>
              </div>

              <div class="relative z-10 flex items-center justify-between py-6 border-t border-gray-100 dark:border-white/5">
                <div>
                  <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Odds</p>
                  <p class="text-lg font-black text-amber-500 italic tracking-tighter leading-none">{{ pick.odds }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Confidence</p>
                  <p class="text-lg font-black text-gray-900 dark:text-white italic tracking-tighter leading-none">{{ pick.confidence || 'HIGH' }}</p>
                </div>
              </div>
              
              <button 
                v-if="pick.is_parlay && parseParlayPicks(pick.title).length > 3" 
                @click.stop="openParlayModal(pick)" 
                class="mb-2 w-full py-4 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 font-black rounded-2xl border border-amber-500/20 transition-all uppercase text-[10px] tracking-[0.2em] shadow-lg"
              >
                View Full Parlay
              </button>
            </div>
          </div>

          <!-- Footer Always Visible -->
          <div class="relative z-10 px-6 pb-8 flex gap-3" :class="{'blur-md opacity-20': isPickLocked(pick)}">
            <div class="flex-1 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center transition-colors group-hover:bg-gray-100 dark:group-hover:bg-white/[0.05]">
              <p class="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Wager</p>
              <p class="text-sm font-black text-gray-900 dark:text-white italic tracking-tighter leading-none">{{ formatCurrency(pick.wager) }}</p>
            </div>
            <div 
              class="flex-1 p-4 rounded-2xl border flex flex-col items-center justify-center transition-all duration-500 shadow-2xl"
              :class="[
                pick.result === 'Win' ? 'bg-green-500/10 border-green-500/20 shadow-green-500/5' : 
                pick.result === 'Loss' ? 'bg-red-500/10 border-red-500/20 shadow-red-500/5' : 
                'bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/5'
              ]"
            >
              <p class="text-[8px] font-black uppercase tracking-widest mb-1" :class="pick.result === 'Win' ? 'text-green-500' : pick.result === 'Loss' ? 'text-red-500' : 'text-gray-500'">
                {{ pick.result === 'Win' ? 'Profit' : (pick.result === 'Loss' ? 'Loss' : 'Payout') }}
              </p>
              <p class="text-sm font-black italic tracking-tighter leading-none" :class="pick.result === 'Win' ? 'text-green-500' : pick.result === 'Loss' ? 'text-red-500' : 'text-gray-900 dark:text-white'">
                {{ pick.result === 'Win' ? '+' : '' }}{{ formatCurrency(pick.result === 'Win' ? pick.profit : (pick.result === 'Loss' ? -Math.abs(pick.wager) : (pick.profit || (pick.wager * (parseFloat(pick.odds) - 1))))) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="!loadingPicks && totalPages > 1" class="mt-12 flex items-center justify-between px-4">
        <div class="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalHistoricalPicks) }} of {{ totalHistoricalPicks }} picks
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg class="w-4 h-4 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          <div class="flex items-center gap-1.5">
            <button 
              v-for="page in totalPages" 
              :key="page"
              @click="changePage(page)"
              class="w-10 h-10 rounded-xl text-[11px] font-black transition-all"
              :class="currentPage === page ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5'"
            >
              {{ page }}
            </button>
          </div>

          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="p-3 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg class="w-4 h-4 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Profit Calendar Section -->
    <section id="calendar" class="py-24 px-4 md:px-8 max-w-7xl mx-auto">
      <div class="relative group">
        <!-- Main Calendar Glow -->
        <div class="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-600/20 rounded-[2.2rem] md:rounded-[3.2rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <div class="relative bg-gray-50 dark:bg-[#0c0c0e] rounded-[2rem] md:rounded-[3rem] p-4 md:p-10 border border-gray-200 dark:border-white/5 shadow-3xl overflow-hidden">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <h2 class="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Performance</h2>
              </div>
              <h3 class="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Profit <span class="text-amber-500">Calendar</span></h3>
            </div>
            
            <div class="flex items-center justify-between md:justify-start gap-2 md:gap-6 bg-white dark:bg-white/5 p-2 rounded-2xl border border-gray-200 dark:border-white/10 w-full md:w-auto">
              <button @click="prevMonth" class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-all border border-gray-200 dark:border-white/5 shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <span class="text-xs md:text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest min-w-[120px] md:min-w-[140px] text-center italic truncate">{{ calendarMonthName }}</span>
              <button @click="nextMonth" class="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white transition-all border border-gray-200 dark:border-white/5 shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1 md:gap-4 relative z-10">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="text-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-gray-500 pb-4 md:pb-6">
              {{ day }}
            </div>
            <div 
              v-for="(day, idx) in calendarDays" 
              :key="idx"
              class="aspect-square rounded-xl md:rounded-3xl border transform-gpu transition-[transform,background-color,border-color,opacity] duration-300 flex flex-col items-center justify-center p-1 md:p-3 relative group/day overflow-hidden"
              :class="[
                !day.day ? 'bg-transparent border-transparent pointer-events-none' : 'bg-white dark:bg-[#18181b]/60 border-gray-200 dark:border-white/5 hover:border-amber-500/30 hover:bg-gray-50 dark:hover:bg-[#18181b]/80 hover:-translate-y-1 cursor-pointer',
                day.hasPicks && day.profit > 0 ? 'bg-green-500/10 border-green-500/20' : '',  
                day.hasPicks && day.profit < 0 ? 'bg-red-500/10 border-red-500/20' : '',
                day.day && !day.hasPicks ? 'opacity-40 grayscale-[0.5]' : ''
              ]"
            >
              <div v-if="day.day" class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/day:opacity-100 transition-opacity duration-300"></div>
              
              <span v-if="day.day" class="text-[10px] md:text-xs font-black text-gray-700 dark:text-white/90 relative z-10">{{ day.day }}</span>
              <span v-if="day.day && day.hasPicks" class="text-[7px] md:text-[10px] font-black mt-0.5 md:mt-2 relative z-10 italic tracking-tighter leading-none" :class="day.profit >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'">
                {{ day.profit >= 0 ? '+' : '' }}{{ formatCurrency(day.profit) }}
              </span>
              
              <div v-if="day.hasPicks" class="absolute top-1 right-1 md:top-3 md:right-3 w-1 md:w-1.5 h-1 md:h-1.5 rounded-full" :class="day.profit >= 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Upcoming Giveaway Section -->
    <section id="giveaway" class="py-24 px-6 md:px-8 max-w-7xl mx-auto">
      <div class="relative group">
        <div class="relative bg-gray-50 dark:bg-[#0c0c0e] rounded-[3rem] p-10 md:p-20 border border-gray-200 dark:border-white/5 shadow-3xl overflow-hidden text-center">
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
            <div v-for="i in 12" :key="i" 
              class="absolute w-2 h-4 rounded-sm bg-amber-500/40 animate-pulse"
              :style="{
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDelay: Math.random() * 5 + 's',
                animationDuration: (Math.random() * 3 + 2) + 's'
              }"
            ></div>
          </div>

          <div class="relative z-10 space-y-10">
            <div class="flex flex-col items-center space-y-6">
              <div class="relative"></div>
            </div>

            <div class="space-y-4">
              <h2 class="text-5xl md:text-8xl font-black tracking-tight uppercase italic leading-none">
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 drop-shadow-2xl">Giveaway</span>
              </h2>
              <p class="text-base md:text-lg font-medium text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
               Your win starts here ⚡<br class="hidden md:block"/>
              </p>
            </div>

            <div class="max-w-xl mx-auto p-1 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-2xl">
              <div class="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-white/10">
                <div class="flex-1 px-8 py-6 flex items-center justify-center gap-4 group/status">
                  <div class="w-10 h-10 rounded-full border-2 border-dashed border-amber-500/40 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                  </div>
                  <div class="text-left">
                    <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Status</p>
                    <p class="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tight group-hover:text-amber-500 transition-colors">{{ giveawayStatusLabel }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Participants Marquee -->
            <div v-if="displayedGiveawayParticipants.length > 0" class="max-w-2xl mx-auto overflow-hidden relative py-6 bg-black/20 backdrop-blur-md rounded-2xl border border-white/5">
              <div class="absolute top-0 left-6 z-20">
                <span class="px-2 py-0.5 rounded-md bg-amber-500 text-[8px] font-black uppercase tracking-widest text-black shadow-lg shadow-amber-500/20">Live Entries</span>
              </div>
              <div class="flex whitespace-nowrap animate-marquee mt-2 w-max">
                <div v-for="(participant, idx) in [...displayedGiveawayParticipants, ...displayedGiveawayParticipants]" :key="`${participant}-${idx}`" class="flex items-center mx-8">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse"></span>
                  <span class="ml-3 text-xs font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-300 group-hover:text-amber-500 transition-colors">
                    {{ participant }}
                  </span>
                </div>
              </div>
              <!-- Faded Edges -->
              <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-50/50 dark:from-[#0c0c0e]/80 to-transparent z-10"></div>
              <div class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-50/50 dark:from-[#0c0c0e]/80 to-transparent z-10"></div>
            </div>

            <!-- Winner selected: same celebration treatment as the former modal, inline in the card -->
            <div
              v-if="giveawayWinnerStakeId"
              class="max-w-2xl mx-auto winner-glass-modal relative rounded-[2rem] border overflow-hidden shadow-2xl text-center"
            >
              <div class="winner-glow absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[560px] pointer-events-none"></div>
              <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400"></div>
              <div class="winner-spark winner-spark-a pointer-events-none"></div>
              <div class="winner-spark winner-spark-b pointer-events-none"></div>
              <div class="absolute inset-0 winner-glass-overlay pointer-events-none"></div>

              <div class="relative p-6 md:p-10 space-y-6 md:space-y-7">
                <div class="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/20 border border-amber-300/40 flex items-center justify-center celebration-badge-pop celebration-badge-ring shadow-[0_0_40px_rgba(245,158,11,0.45)]">
                  <span class="text-3xl md:text-4xl">🏆</span>
                </div>

                <p class="text-sm md:text-base font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-200 px-2">
                  {{ giveawayName }}
                </p>

                <div class="space-y-2">
                  <p class="text-[16px] md:text-[20px] font-black uppercase tracking-[0.35em] text-amber-500">Congratulations!</p>
                  <h3 class="text-xl md:text-2xl font-black italic uppercase text-gray-900 dark:text-white leading-tight px-2">
                    Collect your prize on <span class="text-amber-500">X</span>
                  </h3>
                  <a
                    :href="formatExternalLink(xLink)"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open X profile"
                    class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10 text-gray-900 dark:text-white leading-none transition-all hover:text-amber-500 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(245,158,11,0.25)]"
                  >
                    <svg class="w-8 h-8 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.55l-5.13-6.71L5.2 22H1.94l7.6-8.69L1.5 2h6.72l4.64 6.13L18.244 2zm-1.15 18h1.8L7.24 3.9H5.3L17.094 20z" />
                    </svg>
                  </a>
                </div>

                <div class="rounded-2xl p-4 md:p-5 bg-white/55 dark:bg-white/5 backdrop-blur-sm border border-white/45 dark:border-white/15 space-y-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_34px_rgba(0,0,0,0.18)] text-center">
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Winning Stake ID</p>
                  <p class="text-lg md:text-3xl font-black text-emerald-500 break-all">{{ giveawayWinnerStakeId }}</p>
                  <p v-if="giveawayWinnerIsMyEntry" class="text-xs font-black uppercase tracking-widest text-amber-500">
                    This is your entry. You won! 🎉
                  </p>
                </div>
                <p class="text-xs font-bold text-red-500 uppercase tracking-wider">
                    Note: Winnings will be voided if they are not claimed within 1 hour.
                </p>
                <div class="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
                  <p v-if="giveawayWinnerEntryId !== null">Winner entry ID: #{{ giveawayWinnerEntryId }}</p>
                  <p v-if="giveawayHasEntered && giveawayUserStakeId" class="text-green-500">
                    Your entry: {{ giveawayUserStakeId }}
                  </p>
                  <p><span class="text-gray-400">Prize:</span> <span class="text-gray-900 dark:text-white">{{ giveawayPrize }}</span></p>
                </div>
                
              </div>
            </div>
            
            <div
              v-else
              class="max-w-2xl mx-auto rounded-[2rem] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 backdrop-blur-xl shadow-2xl p-6 md:p-8 text-left space-y-5"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  First {{ giveawaySlots }} entries only
                </p>
                <p class="text-xs font-black uppercase tracking-widest text-amber-500">
                  {{ giveawayEntriesCount }}/{{ giveawaySlots }} joined · {{ giveawayRemainingSlots }} slots left
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <!-- <p class="md:col-span-2 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Name: <span class="text-gray-900 dark:text-white">{{ giveawayName }}</span>
                </p> -->
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Name: <span class="text-gray-900 dark:text-white">{{ giveawayName }}</span></p>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Prize: <span class="text-gray-900 dark:text-white">{{ giveawayPrize }}</span></p>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Winners: <span class="text-gray-900 dark:text-white">{{ giveawayWinnerCount }}</span></p>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Draw After: <span class="text-gray-900 dark:text-white">{{ giveawayDrawAfterMinutes >= 60 ? `${Math.round(giveawayDrawAfterMinutes / 60)}h` : `${giveawayDrawAfterMinutes}m` }}</span></p>
              </div>

              <div v-if="user" class="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white text-[12px] font-black uppercase overflow-hidden border border-amber-500/20">
                   <img v-if="user.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" class="w-full h-full object-cover" />
                   <span v-else>{{ user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) }}</span>
                </div>
                <div>
                   <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">Logged in as</p>
                   <p class="text-[11px] font-bold text-gray-900 dark:text-white">{{ user.user_metadata?.full_name || user.email }}</p>
                </div>
              </div>

              <div v-else class="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5 mt-4">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Login with Discord to join</p>
                <button
                  type="button"
                  @click="signInWithDiscord"
                  class="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-black uppercase tracking-wider transition-all transform active:scale-[0.98]"
                >
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Login with Discord
                </button>
              </div>

              <form @submit.prevent="submitGiveawayEntry" class="space-y-4">
                <div class="space-y-2">
                  <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Stake ID</label>
                  <input
                    v-model.trim="giveawayStakeId"
                    type="text"
                    placeholder="Enter your Stake ID"
                    :disabled="!giveawayIsActive || giveawaySubmitting || giveawayHasEntered || giveawayRemainingSlots <= 0 || !!giveawayWinnerStakeId"
                    class="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-[#0f0f11] border border-gray-200 dark:border-white/10 font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  :disabled="!giveawayIsActive || giveawaySubmitting || giveawayHasEntered || giveawayRemainingSlots <= 0 || !!giveawayWinnerStakeId"
                  class="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#09090b] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {{
                    !user
                      ? 'Login to Join'
                      : !giveawayIsActive
                      ? 'Giveaway Stopped'
                      : giveawayHasEntered
                      ? 'Entry Submitted'
                      : giveawayWinnerStakeId
                        ? 'Winner Selected'
                      : giveawayRemainingSlots <= 0
                        ? 'Giveaway Closed'
                        : giveawaySubmitting
                          ? 'Submitting...'
                          : 'Submit Entry'
                  }}
                </button>
              </form>
              <p v-if="!user" class="text-xs font-bold text-amber-500 uppercase tracking-wider text-center">
                Login using discord to join the give away!
              </p>
              <p class="text-xs font-bold text-red-500 uppercase tracking-wider">
                Note: Winnings will be voided if they are not claimed within 1 hour.
              </p>
              <p v-if="giveawayHasEntered && giveawayUserStakeId" class="text-xs font-bold text-green-500 uppercase tracking-wider">
                Your entry: {{ giveawayUserStakeId }}
              </p>
              <!-- <p v-if="!giveawayIsActive" class="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Giveaway is currently paused by admin.
              </p> -->
              <!-- <p v-if="giveawayRoundId !== null" class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Giveaway ID: #{{ giveawayRoundId }}
              </p> -->
              <p v-if="giveawayWinnerEntryId !== null" class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Winner Entry ID: #{{ giveawayWinnerEntryId }}
              </p>
              <p v-if="!giveawayWinnerStakeId && giveawayDrawSecondsRemaining !== null" class="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Winner draw in: {{ formattedGiveawayDrawTime }}
              </p>
              <p v-if="giveawayWinnerStakeId" class="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                Winner: {{ giveawayWinnerStakeId }}
              </p>
              <!-- <div class="space-y-2">
                <p class="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Participants
                </p>
                <div
                  v-if="displayedGiveawayParticipants.length > 0"
                  class="max-h-40 overflow-y-auto rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-[#0f0f11]/80 p-3 space-y-1"
                >
                  <p
                    v-for="(participant, idx) in displayedGiveawayParticipants"
                    :key="`${participant}-${idx}`"
                    class="text-[11px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide break-all"
                  >
                    {{ idx + 1 }}. {{ participant }}
                  </p>
                </div>
                <p v-else class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  No participants found yet.
                </p>
              </div> -->
              <!-- <div v-if="giveawayWinners.length > 0" class="space-y-1">
                <p class="text-xs font-black text-emerald-500 uppercase tracking-wider">Winners List</p>
                <p v-for="winner in giveawayWinners" :key="winner.entry_id" class="text-xs font-bold text-gray-300 uppercase tracking-wider">
                  #{{ winner.entry_id }} - {{ winner.stake_id }}
                </p>
              </div> -->
              <p v-if="giveawayError" class="text-xs font-bold text-red-500 uppercase tracking-wider">
                {{ giveawayError }}
              </p>
              <p v-if="giveawaySuccess" class="text-xs font-bold text-green-500 uppercase tracking-wider">
                {{ giveawaySuccess }}
              </p>
            </div>
            <div class="flex items-center justify-center  grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-200 dark:border-white/5">
              <div class="flex items-center justify-center gap-4 group/feat">
                <div class="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center group-hover/feat:bg-amber-500/10 transition-colors">
                  <span class="text-lg">🎁</span>
                </div>
                <div class="text-left">
                  <p class="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider mb-0.5">More Prizes</p>
                  <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Only for our community</p>
                </div>
              </div>
              <div class="flex items-center justify-center gap-4 group/feat">
                <div class="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center group-hover/feat:bg-amber-500/10 transition-colors">
                  <span class="text-lg">💰</span>
                </div>
                <div class="text-left">
                  <p class="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider mb-0.5">Cash Rewards</p>
                  <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Real rewards, real winners</p>
                </div>
              </div>
              <!-- <div class="flex items-center justify-center gap-4 group/feat">
                <div class="w-10 h-10 rounded-full border border-amber-500/30 flex items-center justify-center group-hover/feat:bg-amber-500/10 transition-colors">
                  <span class="text-lg">👑</span>
                </div>
                <div class="text-left">
                  <p class="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wider mb-0.5">Premium Access</p>
                  <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Special perks & more</p>
                </div> 
              </div>-->
            </div>

            <!-- <p class="text-[10px] font-black text-gray-500 dark:text-gray-600 uppercase tracking-[0.4em] pt-8">
              ❤ Thank you for being part of our community
            </p> -->
          </div>
        </div>
      </div>
    </section>

    <!-- Discord Elite Leaderboard -->
    <section id="leaderboard" class="py-24 px-6 md:px-8 max-w-7xl mx-auto space-y-16">
      <div class="text-center space-y-4">
        <h2 class="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">Discord <span class="text-amber-500">Leaderboard</span></h2>
        <div class="flex flex-col items-center gap-6">
          <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em]">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Live Leaderboard
          </div>
          <p v-if="leaderboardError" class="text-[10px] font-black uppercase tracking-wider text-amber-500 max-w-3xl text-center">
            {{ leaderboardError }}
          </p>
          <p v-if="leaderboardUsingCachedData" class="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-500">
            Cached snapshot shown
          </p>
          
          <button 
            @click="fetchLeaderboard" 
            :disabled="loadingLeaderboard"
            class="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              class="w-4 h-4 transition-transform duration-500 group-hover:rotate-180" 
              :class="{'animate-spin': loadingLeaderboard}"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ loadingLeaderboard ? 'Syncing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>

      <div v-if="loadingLeaderboard && leaderboardUsers.length === 0" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        <p class="text-xs font-black uppercase tracking-widest text-gray-400">Syncing with MEE6...</p>
      </div>

      <div v-else-if="leaderboardUsers.length > 0" class="space-y-12">
        <!-- Podium (Top 3) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end px-4">
          <!-- Rank 2 -->
          <div v-if="leaderboardUsers[1]" class="order-2 md:order-1 p-8 rounded-[3rem] bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 shadow-2xl relative overflow-hidden group transition-all hover:-translate-y-2">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gray-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div class="relative z-10 text-center space-y-6">
              <div class="flex flex-col items-center">
                <div class="relative mb-6">
                  <div class="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border-2 border-gray-200 dark:border-gray-500 overflow-hidden shadow-xl">
                    <img v-if="leaderboardUsers[1].avatar" :src="leaderboardUsers[1].avatar" class="w-full h-full object-cover" :alt="leaderboardUsers[1].name" />
                    <span v-else class="text-2xl font-black text-gray-400">{{ leaderboardUsers[1].initials }}</span>
                  </div>
                  <div class="absolute -top-3 -right-3 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full border-4 border-white dark:border-[#18181b] flex items-center justify-center text-xl shadow-lg">🥈</div>
                </div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Rank 2 • LVL {{ leaderboardUsers[1].level }}</p>
                <p class="text-xl font-black text-gray-900 dark:text-white uppercase italic truncate max-w-full">{{ leaderboardUsers[1].name }}</p>
              </div>
            </div>
          </div>

          <!-- Rank 1 (Champion) -->
          <div v-if="leaderboardUsers[0]" class="order-1 md:order-2 p-10 rounded-[3.5rem] bg-amber-600 shadow-2xl shadow-amber-500/20 relative overflow-hidden group scale-110 z-10 transition-all hover:-translate-y-4">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div class="relative z-10 text-center space-y-8">
              <div class="flex flex-col items-center">
                <div class="relative mb-6">
                  <div class="w-28 h-28 rounded-[2rem] bg-white/20 flex items-center justify-center border-4 border-white/30 overflow-hidden shadow-2xl">
                    <img v-if="leaderboardUsers[0].avatar" :src="leaderboardUsers[0].avatar" class="w-full h-full object-cover" :alt="leaderboardUsers[0].name" />
                    <span v-else class="text-4xl font-black text-white">{{ leaderboardUsers[0].initials }}</span>
                  </div>
                  <div class="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full border-4 border-amber-600 flex items-center justify-center text-2xl shadow-xl animate-bounce">👑</div>
                </div>
                <p class="text-[10px] font-black text-white/70 uppercase tracking-[0.4em] mb-1">Champion • LVL {{ leaderboardUsers[0].level }}</p>
                <p class="text-3xl font-black text-white uppercase italic truncate max-w-full">{{ leaderboardUsers[0].name }}</p>
              </div>
            </div>
          </div>

          <!-- Rank 3 -->
          <div v-if="leaderboardUsers[2]" class="order-3 p-8 rounded-[3rem] bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 shadow-2xl relative overflow-hidden group transition-all hover:-translate-y-2">
            <div class="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div class="relative z-10 text-center space-y-6">
              <div class="flex flex-col items-center">
                <div class="relative mb-6">
                  <div class="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border-2 border-orange-500/30 overflow-hidden shadow-xl">
                    <img v-if="leaderboardUsers[2].avatar" :src="leaderboardUsers[2].avatar" class="w-full h-full object-cover" :alt="leaderboardUsers[2].name" />
                    <span v-else class="text-2xl font-black text-gray-400">{{ leaderboardUsers[2].initials }}</span>
                  </div>
                  <div class="absolute -top-3 -right-3 w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full border-4 border-white dark:border-[#18181b] flex items-center justify-center text-xl shadow-lg">🥉</div>
                </div>
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Rank 3 • LVL {{ leaderboardUsers[2].level }}</p>
                <p class="text-xl font-black text-gray-900 dark:text-white uppercase italic truncate max-w-full">{{ leaderboardUsers[2].name }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- List Leaderboard (Rank 4-20) -->
        <div class="max-w-5xl mx-auto rounded-[3rem] bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
                  <th class="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest w-24 text-center">Rank</th>
                  <th class="px-8 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                  <th class="px-8 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Level</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                <tr v-for="(member, idx) in leaderboardUsers.slice(3)" :key="member.id" class="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-200">
                  <td class="px-10 py-6 text-center">
                    <span class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-xs font-black text-gray-500 dark:text-gray-400 group-hover:bg-amber-600 group-hover:text-white transition-all mx-auto">
                      {{ idx + 4 }}
                    </span>
                  </td>
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 overflow-hidden group-hover:scale-110 transition-transform">
                        <img v-if="member.avatar" :src="member.avatar" class="w-full h-full object-cover" :alt="member.name" />
                        <span v-else class="text-sm font-black text-amber-500">{{ member.initials }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-sm font-black text-gray-900 dark:text-white">{{ member.name }}</span>
                        <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Verified Elite</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-6 text-center">
                    <span class="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500">
                      LVL {{ member.level }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="!loadingLeaderboard" class="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white dark:bg-[#18181b] rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-2xl max-w-5xl mx-auto">
        <div class="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <div class="space-y-2">
          <h3 class="text-2xl font-black uppercase italic text-gray-900 dark:text-white">Connection Error</h3>
          <p class="text-gray-500 font-medium max-w-md mx-auto">We couldn't reach the MEE6 API. This might be due to server restrictions or maintenance.</p>
        </div>
        <button 
          @click="fetchLeaderboard" 
          class="px-10 py-5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1 uppercase text-xs tracking-widest flex items-center gap-3"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Try Again
        </button>
      </div>
    </section>

    <!--<div v-if="showWinnerCelebrationModal" class="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/45 backdrop-blur-md" @click="closeWinnerCelebrationModal"></div>

      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          v-for="piece in confettiPieces"
          :key="piece.id"
          class="confetti-piece"
          :style="{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            '--confetti-rotate': `${piece.rotate}deg`
          }"
        >
          {{ piece.emoji }}
        </div>
      </div>

      <div class="winner-glass-modal relative z-10 w-full max-w-2xl rounded-[2.5rem] border overflow-hidden">
        <div class="winner-glow absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[560px] pointer-events-none"></div>
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400"></div>
        <div class="winner-spark winner-spark-a pointer-events-none"></div>
        <div class="winner-spark winner-spark-b pointer-events-none"></div>
        <div class="absolute inset-0 winner-glass-overlay pointer-events-none"></div>

        <div class="relative p-8 md:p-10 text-center space-y-7">
          <button
            @click="closeWinnerCelebrationModal"
            aria-label="Close winner modal"
            class="absolute top-3 right-3 md:top-4 md:right-4 w-10 h-10 rounded-xl bg-white/40 dark:bg-white/10 border border-white/40 dark:border-white/15 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-white/15 transition-all"
          >
            <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M6 6l12 12M18 6L6 18"></path>
            </svg>
          </button>

          <div class="mx-auto w-20 h-20 rounded-full bg-amber-500/20 border border-amber-300/40 flex items-center justify-center celebration-badge-pop celebration-badge-ring shadow-[0_0_40px_rgba(245,158,11,0.45)]">
            <span class="text-4xl">🏆</span>
          </div>

          <div class="space-y-2">
            <p class="text-[20px] font-black uppercase tracking-[0.35em] text-amber-500">CONGRATULATIONS!</p>
            <h1 class="text-1xl md:text-1xl font-black italic uppercase text-gray-900 dark:text-white leading-none">
              Collect your prize on <span class="text-amber-500">X</span>
            </h1>
            <br>
            <a :href="formatExternalLink(xLink)" target="_blank" rel="noopener noreferrer" aria-label="Open X profile" class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/35 dark:bg-white/5 border border-white/40 dark:border-white/10 text-gray-900 dark:text-white leading-none transition-all hover:text-amber-500 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(245,158,11,0.25)]">
              <svg class="w-10 h-10 md:w-8 md:h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.55l-5.13-6.71L5.2 22H1.94l7.6-8.69L1.5 2h6.72l4.64 6.13L18.244 2zm-1.15 18h1.8L7.24 3.9H5.3L17.094 20z" />
              </svg>
            </a>
          </div>

          <div class="rounded-2xl p-5 bg-white/55 dark:bg-white/5 backdrop-blur-sm border border-white/45 dark:border-white/15 space-y-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_34px_rgba(0,0,0,0.18)]">
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Winning Stake ID</p>
            <p class="text-xl md:text-3xl font-black text-emerald-500 break-all">{{ winnerCelebrationStakeId }}</p>
            <p v-if="winnerCelebrationIsMyEntry" class="text-xs font-black uppercase tracking-widest text-amber-500">
              This is your entry. You won! 🎉
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-1 gap-3">
            <button
              @click="closeWinnerCelebrationModal"
              class="w-full py-3.5 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>-->

    <!-- Socials Section -->
    <section id="socials" class="py-24 px-6 md:px-8 bg-gray-50 dark:bg-[#0c0c0e] transition-colors duration-500">
      <div class="max-w-7xl mx-auto">
        <div class="text-center space-y-4 mb-16">
          <h2 class="text-4xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">Connect <span class="text-amber-500">Now</span></h2>
          <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">Never miss a pick. Follow us everywhere.</p>
        </div>      

        <div class="flex flex-wrap justify-center gap-6 md:gap-10">
          <a :href="formatExternalLink(discordLink)" target="_blank" class="group">
            <div class="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all duration-500 hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 group-hover:bg-amber-500">
              <svg class="w-10 h-10 text-amber-500 group-hover:text-white transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3333-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3333-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </div>
          </a>

          <a :href="formatExternalLink(xLink)" target="_blank" class="group">
            <div class="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all duration-500 hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 group-hover:bg-amber-500">
              <svg class="w-10 h-10 text-blue-400 group-hover:text-white transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </div>
          </a>

          <a :href="formatExternalLink(instagramLink)" target="_blank" class="group">
            <div class="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all duration-500 hover:border-pink-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20 group-hover:bg-pink-600">
              <svg class="w-10 h-10 text-pink-500 group-hover:text-white transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <div class="pt-12 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
      <div class="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
        <span>© {{ new Date().getFullYear() }} Marko Picks. All rights reserved.</span>
      </div>
    </div>

    <!-- Parlay Modal -->
    <div v-if="isParlayModalOpen && selectedParlay" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" @click="closeParlayModal"></div>
      
      <div class="bg-white dark:bg-[#0c0c0e] w-full max-w-xl rounded-[3rem] shadow-3xl relative z-10 overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
        <div class="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
            </div>
            <div>
              <h2 class="text-2xl font-black italic uppercase text-gray-900 dark:text-white leading-tight">Parlay <span class="text-amber-500">Details</span></h2>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Odds: {{ selectedParlay.odds }}</p>
            </div>
          </div>
          <button @click="closeParlayModal" class="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div v-for="(leg, idx) in parseParlayPicks(selectedParlay.title)" :key="idx" class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative p-6 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center gap-6">
              <div class="w-12 h-12 rounded-2xl bg-white dark:bg-black/20 flex items-center justify-center text-lg font-black text-amber-500 shadow-sm border border-gray-100 dark:border-white/5">
                {{ idx + 1 }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <p class="text-lg font-medium text-gray-900 dark:text-white leading-tight">{{ leg.title }}</p>
                  <span v-if="leg.odds" class="text-sm font-medium text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg">@{{ leg.odds }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-8 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 space-y-4">
          <div class="flex items-center justify-between px-4">
            <div class="text-center">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Odds</p>
              <p class="text-2xl font-black text-amber-500">{{ selectedParlay.odds }}</p>
            </div>
            <div class="h-8 w-px bg-gray-200 dark:bg-white/10"></div>
            <div class="text-center">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <span class="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                {{ selectedParlay.result || 'Upcoming' }}
              </span>
            </div>
          </div>
          <button @click="closeParlayModal" class="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-2xl uppercase text-xs tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95">
            Close Overview
          </button>
        </div>
      </div>
    </div>

    <!-- Date Details Modal -->
    <div v-if="isDateModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" @click="isDateModalOpen = false"></div>
      
      <div class="bg-white dark:bg-[#0c0c0e] w-full max-w-xl rounded-[3rem] shadow-3xl relative z-10 overflow-hidden border border-gray-200 dark:border-white/10 flex flex-col transform transition-all animate-in fade-in zoom-in duration-300">
        <div class="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <h2 class="text-2xl font-black italic uppercase text-gray-900 dark:text-white leading-tight">Date <span class="text-amber-500">Overview</span></h2>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ formatDate(selectedDate) }}</p>
            </div>
          </div>
          <button @click="isDateModalOpen = false" class="p-3 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="p-8 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div v-for="(pick, idx) in selectedDatePicks" :key="idx" class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative p-5 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black border border-gray-100 dark:border-white/5 shadow-sm"
                  :class="pick.result === 'Win' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'">
                  {{ pick.result === 'Win' ? 'W' : 'L' }}
                </div>
                <div>
                  <p class="text-sm font-black text-gray-900 dark:text-white uppercase italic leading-tight">{{ pick.title }}</p>
                  <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ pick.sport }} • @{{ pick.odds }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-black italic" :class="pick.profit >= 0 ? 'text-green-500' : 'text-red-500'">
                  {{ pick.profit >= 0 ? '+' : '' }}{{ formatCurrency(pick.profit) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-8 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
          <button @click="isDateModalOpen = false" class="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-2xl uppercase text-xs tracking-[0.2em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95">
            Close Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient {
  animation: gradient 3s ease infinite;
}

.winner-glass-modal {
  background: linear-gradient(
    140deg,
    rgba(255, 255, 255, 0.72),
    rgba(255, 255, 255, 0.46)
  );
  border-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow:
    0 30px 70px rgba(0, 0, 0, 0.32),
    0 0 40px rgba(245, 158, 11, 0.35),
    0 0 90px rgba(34, 211, 238, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.28) inset;
}

.dark .winner-glass-modal {
  background: linear-gradient(
    145deg,
    rgba(22, 22, 28, 0.78),
    rgba(18, 18, 24, 0.58)
  );
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow:
    0 30px 70px rgba(0, 0, 0, 0.55),
    0 0 45px rgba(245, 158, 11, 0.45),
    0 0 110px rgba(16, 185, 129, 0.22),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
}

.winner-glass-overlay {
  background:
    radial-gradient(circle at 15% 10%, rgba(255, 255, 255, 0.35), transparent 34%),
    radial-gradient(circle at 85% 100%, rgba(34, 211, 238, 0.14), transparent 38%);
}

.winner-spark {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 9999px;
  filter: blur(42px);
  opacity: 0.42;
  animation: winner-spark-float 6s ease-in-out infinite;
}

.winner-spark-a {
  top: -80px;
  right: -70px;
  background: rgba(245, 158, 11, 0.42);
}

.winner-spark-b {
  bottom: -95px;
  left: -70px;
  background: rgba(16, 185, 129, 0.36);
  animation-delay: 1.5s;
}

.celebration-badge-ring {
  position: relative;
}

.celebration-badge-ring::after {
  content: "";
  position: absolute;
  inset: -10px;
  border-radius: 9999px;
  border: 1px solid rgba(245, 158, 11, 0.42);
  animation: winner-ring-pulse 2.4s ease-out infinite;
}

.winner-glow {
  background:
    radial-gradient(circle, rgba(245, 158, 11, 0.28) 0%, rgba(16, 185, 129, 0.18) 36%, transparent 72%);
  filter: blur(80px);
}

.confetti-piece {
  position: absolute;
  top: -8%;
  font-size: 1.35rem;
  animation-name: confetti-fall;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.95;
  }
  100% {
    transform: translateY(110vh) rotate(var(--confetti-rotate, 360deg));
    opacity: 0;
  }
}

.celebration-badge-pop {
  animation: celebration-pop 0.6s ease-out;
}

@keyframes celebration-pop {
  0% {
    transform: scale(0.75);
    opacity: 0;
  }
  70% {
    transform: scale(1.08);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes winner-spark-float {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.04);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}

@keyframes winner-ring-pulse {
  0% {
    transform: scale(0.92);
    opacity: 0.7;
  }
  70% {
    transform: scale(1.2);
    opacity: 0;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes loading-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}

@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}

.animate-loading-pulse {
  animation: loading-pulse 2s ease-in-out infinite;
}

.animate-loading-bar {
  animation: loading-bar 2s ease-in-out infinite;
}

.animate-marquee {
  animation: marquee 45s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}

html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: #09090b;
}
::-webkit-scrollbar-thumb {
  background: #18181b;
  border-radius: 5px;
  border: 3px solid #09090b;
}
::-webkit-scrollbar-thumb:hover {
  background: #27272a;
}
</style>
