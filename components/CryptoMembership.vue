<template>
  <section id="membership" class="section-padding relative overflow-hidden">
    <div class="container-custom relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-full text-sm font-medium text-orange-300 mb-6 shadow-lg">
          <span class="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
          Choose Your Arena Tier
        </div>
        
        <h2 class="text-4xl md:text-5xl font-bold text-white leading-tight mb-6 font-orbitron">
          Crypto Arena <span class="text-gradient-primary">Membership Tiers</span>
        </h2>
        
        <p class="text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
          Select the perfect membership level for your crypto gaming journey. All tiers include access to our exclusive arena.
        </p>
      </div>

      <!-- Membership Tiers -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <!-- Free Tier -->
        <div class="membership-card">
          <div class="membership-header">
            <h3 class="text-2xl font-bold text-white mb-2 font-orbitron">Rookie Warrior</h3>
            <div class="text-4xl font-bold text-orange-400 mb-2">$0<span class="text-lg text-gray-400">/month</span></div>
            <p class="text-gray-300">Perfect for crypto beginners</p>
          </div>
          
          <div class="membership-features">
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Access to public channels</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Basic market updates</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Arena forum access</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Weekly newsletter</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-gray-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-500 line-through">Premium channels</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-gray-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-500 line-through">Trading signals</span>
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
            <h3 class="text-2xl font-bold text-white mb-2 font-orbitron">Elite Warrior</h3>
            <div class="text-4xl font-bold text-orange-400 mb-2">$29<span class="text-lg text-gray-400">/month</span></div>
            <p class="text-gray-300">For active crypto enthusiasts</p>
          </div>
          
          <div class="membership-features">
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Everything in Rookie</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Premium Discord channels</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Daily trading signals</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Expert Q&A sessions</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Portfolio tracking tools</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Priority support</span>
              </li>
            </ul>
          </div>
          
          <div class="membership-cta">
            <button class="btn-primary w-full">Join Elite</button>
          </div>
        </div>

        <!-- VIP Tier -->
        <div class="membership-card">
          <div class="membership-header">
            <h3 class="text-2xl font-bold text-white mb-2 font-orbitron">Legendary Warrior</h3>
            <div class="text-4xl font-bold text-orange-400 mb-2">$99<span class="text-lg text-gray-400">/month</span></div>
            <p class="text-gray-300">For serious investors & traders</p>
          </div>
          
          <div class="membership-features">
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Everything in Elite</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">1-on-1 expert consultations</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Early access to presales</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Private investment group</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">Exclusive networking events</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-300">24/7 VIP support</span>
              </li>
            </ul>
          </div>
          
          <div class="membership-cta">
            <button class="btn-outline w-full">Join Legendary</button>
          </div>
        </div>
      </div>

      <!-- Additional Benefits -->
      <div class="text-center">
        <h3 class="text-2xl font-bold text-white mb-8 font-orbitron">All Warriors Get Access To:</h3>
        <div class="grid md:grid-cols-4 gap-6">
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
              <span class="text-2xl">📱</span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2 font-orbitron">Mobile App</h4>
            <p class="text-gray-300 text-sm">Access our arena on the go</p>
          </div>
          
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-600/20 to-orange-700/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
              <span class="text-2xl">🎥</span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2 font-orbitron">Video Content</h4>
            <p class="text-gray-300 text-sm">Educational videos and tutorials</p>
          </div>
          
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-orange-400/20 to-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-500/30">
              <span class="text-2xl">📊</span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2 font-orbitron">Market Tools</h4>
            <p class="text-gray-300 text-sm">Charts, alerts, and analysis</p>
          </div>
          
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
              <span class="text-2xl">🎁</span>
            </div>
            <h4 class="text-lg font-semibold text-white mb-2 font-orbitron">Rewards Program</h4>
            <p class="text-gray-300 text-sm">Earn rewards for participation</p>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-16">
        <h3 class="text-2xl font-bold text-white text-center mb-8 font-orbitron">Frequently Asked Questions</h3>
        <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-white mb-2 font-orbitron">Can I cancel anytime?</h4>
            <p class="text-gray-300">Yes, you can cancel your subscription at any time. No long-term commitments required.</p>
          </div>
          
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-white mb-2 font-orbitron">Is there a free trial?</h4>
            <p class="text-gray-300">Elite and Legendary memberships come with a 7-day free trial to test all features.</p>
          </div>
          
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-white mb-2 font-orbitron">How do I join the arena?</h4>
            <p class="text-gray-300">After signing up, you'll receive an email with links to join our Discord and Telegram groups.</p>
          </div>
          
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-white mb-2 font-orbitron">Are trading signals profitable?</h4>
            <p class="text-gray-300">While we provide analysis, all trading decisions are your own. Past performance doesn't guarantee future results.</p>
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
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 0.5rem;
  padding: 2rem;
  position: relative;
  transition: all 0.3s;
}

.membership-card:hover {
  transform: translateY(-5px);
}

.membership-card.featured {
  box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.5);
  transform: scale(1.05);
}

.membership-badge {
  position: absolute;
  top: -1rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.membership-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 107, 53, 0.3);
}

.membership-features {
  margin-bottom: 2rem;
}

.membership-cta {
  text-align: center;
}

.benefit-item {
  text-align: center;
}

.faq-item {
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(8px);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.1), inset 0 0 20px rgba(255, 107, 53, 0.05);
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 107, 53, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
  transform: translateY(-2px);
  border-color: rgba(255, 107, 53, 0.8);
}

.btn-outline {
  border: 2px solid rgba(255, 107, 53, 0.5);
  color: #ff6b35;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-outline:hover {
  background: #ff6b35;
  color: white;
  border-color: #ff6b35;
  box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
}

.font-orbitron {
  font-family: 'Orbitron', monospace;
}
</style>