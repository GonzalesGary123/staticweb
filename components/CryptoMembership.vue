<template>
  <section id="membership" class="section-padding relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark-800/50 to-dark-900/50"></div>
    
    <div class="container-custom relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6">
          <span class="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse"></span>
          Choose Your Membership
        </div>
        
        <h2 class="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
          Crypto Group <span class="text-gradient-primary">Membership Tiers</span>
        </h2>
        
        <p class="text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
          Select the perfect membership level for your crypto journey. All tiers include access to our exclusive community.
        </p>
      </div>

      <!-- Membership Tiers -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <!-- Free Tier -->
        <div class="membership-card">
          <div class="membership-header">
            <h3 class="text-2xl font-bold text-white mb-2">Free Member</h3>
            <div class="text-4xl font-bold text-white mb-2">$0<span class="text-lg text-white/60">/month</span></div>
            <p class="text-white/70">Perfect for crypto beginners</p>
          </div>
          
          <div class="membership-features">
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Access to public channels</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Basic market updates</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Community forum access</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Weekly newsletter</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-gray-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/40 line-through">Premium channels</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-gray-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/40 line-through">Trading signals</span>
              </li>
            </ul>
          </div>
          
          <div class="membership-cta">
            <button class="btn-outline w-full">Join Free</button>
          </div>
        </div>

        <!-- Premium Tier -->
        <div class="membership-card featured">
          <div class="membership-badge">Most Popular</div>
          <div class="membership-header">
            <h3 class="text-2xl font-bold text-white mb-2">Premium Member</h3>
            <div class="text-4xl font-bold text-white mb-2">$29<span class="text-lg text-white/60">/month</span></div>
            <p class="text-white/70">For active crypto enthusiasts</p>
          </div>
          
          <div class="membership-features">
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Everything in Free</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Premium Discord channels</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Daily trading signals</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Expert Q&A sessions</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Portfolio tracking tools</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Priority support</span>
              </li>
            </ul>
          </div>
          
          <div class="membership-cta">
            <button class="btn-primary w-full">Join Premium</button>
          </div>
        </div>

        <!-- VIP Tier -->
        <div class="membership-card">
          <div class="membership-header">
            <h3 class="text-2xl font-bold text-white mb-2">VIP Member</h3>
            <div class="text-4xl font-bold text-white mb-2">$99<span class="text-lg text-white/60">/month</span></div>
            <p class="text-white/70">For serious investors & traders</p>
          </div>
          
          <div class="membership-features">
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Everything in Premium</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">1-on-1 expert consultations</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Early access to presales</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Private investment group</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">Exclusive networking events</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-white/80">24/7 VIP support</span>
              </li>
            </ul>
          </div>
          
          <div class="membership-cta">
            <button class="btn-outline w-full">Join VIP</button>
          </div>
        </div>
      </div>

      <!-- Additional Benefits -->
      <div class="text-center">
        <h3 class="text-2xl font-bold text-white mb-8">All Members Get Access To:</h3>
        <div class="grid md:grid-cols-4 gap-6">
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">📱</span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2">Mobile App</h4>
            <p class="text-white/70 text-sm">Access our community on the go</p>
          </div>
          
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-secondary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🎥</span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2">Video Content</h4>
            <p class="text-white/70 text-sm">Educational videos and tutorials</p>
          </div>
          
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">📊</span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2">Market Tools</h4>
            <p class="text-white/70 text-sm">Charts, alerts, and analysis</p>
          </div>
          
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🎁</span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2">Rewards Program</h4>
            <p class="text-white/70 text-sm">Earn rewards for participation</p>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-16">
        <h3 class="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
        <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h4>
            <p class="text-white/70">Yes, you can cancel your subscription at any time. No long-term commitments required.</p>
          </div>
          
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-white mb-2">Is there a free trial?</h4>
            <p class="text-white/70">Premium and VIP memberships come with a 7-day free trial to test all features.</p>
          </div>
          
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-white mb-2">How do I join the community?</h4>
            <p class="text-white/70">After signing up, you'll receive an email with links to join our Discord and Telegram groups.</p>
          </div>
          
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-white mb-2">Are trading signals profitable?</h4>
            <p class="text-white/70">While we provide analysis, all trading decisions are your own. Past performance doesn't guarantee future results.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Component logic can be added here if needed
</script>

<style scoped>
.membership-card {
  @apply card-glass p-8 relative transition-all duration-300 hover:scale-105;
}

.membership-card.featured {
  @apply ring-2 ring-accent-500/50 transform scale-105;
}

.membership-badge {
  @apply absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-accent-500 to-primary-500 text-white text-sm font-bold px-4 py-2 rounded-full;
}

.membership-header {
  @apply text-center mb-8 pb-8 border-b border-white/10;
}

.membership-features {
  @apply mb-8;
}

.membership-cta {
  @apply text-center;
}

.benefit-item {
  @apply text-center;
}

.faq-item {
  @apply card-glass p-6;
}

.card-glass {
  @apply bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl;
}

.btn-primary {
  @apply bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25 transform hover:-translate-y-1;
}

.btn-outline {
  @apply border-2 border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-white/40;
}
</style>