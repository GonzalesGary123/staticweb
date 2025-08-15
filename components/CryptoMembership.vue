<template>
  <section id="membership" class="section-padding relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-sky-100/50 to-blue-100/50"></div>
    
    <div class="container-custom relative z-10">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center px-4 py-2 bg-sky-100/80 backdrop-blur-sm border border-sky-300/50 rounded-full text-sm font-medium text-sky-700 mb-6 shadow-lg">
          <span class="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse"></span>
          Choose Your Membership
        </div>
        
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Crypto Group <span class="text-gradient-primary">Membership Tiers</span>
        </h2>
        
        <p class="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Select the perfect membership level for your crypto journey. All tiers include access to our exclusive community.
        </p>
      </div>

      <!-- Membership Tiers -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <!-- Free Tier -->
        <div class="membership-card">
          <div class="membership-header">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Free Member</h3>
            <div class="text-4xl font-bold text-sky-600 mb-2">$0<span class="text-lg text-gray-500">/month</span></div>
            <p class="text-gray-600">Perfect for crypto beginners</p>
          </div>
          
          <div class="membership-features">
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Access to public channels</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Basic market updates</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Community forum access</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Weekly newsletter</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-gray-400 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-400 line-through">Premium channels</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-gray-400 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-400 line-through">Trading signals</span>
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
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Premium Member</h3>
            <div class="text-4xl font-bold text-sky-600 mb-2">$29<span class="text-lg text-gray-500">/month</span></div>
            <p class="text-gray-600">For active crypto enthusiasts</p>
          </div>
          
          <div class="membership-features">
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Everything in Free</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Premium Discord channels</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Daily trading signals</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Expert Q&A sessions</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Portfolio tracking tools</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Priority support</span>
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
            <h3 class="text-2xl font-bold text-gray-900 mb-2">VIP Member</h3>
            <div class="text-4xl font-bold text-sky-600 mb-2">$99<span class="text-lg text-gray-500">/month</span></div>
            <p class="text-gray-600">For serious investors & traders</p>
          </div>
          
          <div class="membership-features">
            <ul class="space-y-3">
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Everything in Premium</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">1-on-1 expert consultations</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Early access to presales</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Private investment group</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">Exclusive networking events</span>
              </li>
              <li class="flex items-center">
                <span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                <span class="text-gray-700">24/7 VIP support</span>
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
        <h3 class="text-2xl font-bold text-gray-900 mb-8">All Members Get Access To:</h3>
        <div class="grid md:grid-cols-4 gap-6">
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-sky-200/50">
              <span class="text-2xl">📱</span>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Mobile App</h4>
            <p class="text-gray-600 text-sm">Access our community on the go</p>
          </div>
          
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-sky-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-200/50">
              <span class="text-2xl">🎥</span>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Video Content</h4>
            <p class="text-gray-600 text-sm">Educational videos and tutorials</p>
          </div>
          
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-sky-200/50">
              <span class="text-2xl">📊</span>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Market Tools</h4>
            <p class="text-gray-600 text-sm">Charts, alerts, and analysis</p>
          </div>
          
          <div class="benefit-item">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-200/50">
              <span class="text-2xl">🎁</span>
            </div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Rewards Program</h4>
            <p class="text-gray-600 text-sm">Earn rewards for participation</p>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-16">
        <h3 class="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
        <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
            <p class="text-gray-600">Yes, you can cancel your subscription at any time. No long-term commitments required.</p>
          </div>
          
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
            <p class="text-gray-600">Premium and VIP memberships come with a 7-day free trial to test all features.</p>
          </div>
          
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-gray-900 mb-2">How do I join the community?</h4>
            <p class="text-gray-600">After signing up, you'll receive an email with links to join our Discord and Telegram groups.</p>
          </div>
          
          <div class="faq-item">
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Are trading signals profitable?</h4>
            <p class="text-gray-600">While we provide analysis, all trading decisions are your own. Past performance doesn't guarantee future results.</p>
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(186, 230, 253, 0.5);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;
  position: relative;
  transition: all 0.3s;
}

.membership-card:hover {
  transform: scale(1.05);
}

.membership-card.featured {
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.5);
  transform: scale(1.05);
}

.membership-badge {
  position: absolute;
  top: -1rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
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
  border-bottom: 1px solid rgba(186, 230, 253, 0.5);
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(186, 230, 253, 0.5);
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-primary:hover {
  box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px) scale(1.05);
}

.btn-outline {
  border: 2px solid rgba(14, 165, 233, 0.5);
  color: #0ea5e9;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.btn-outline:hover {
  background: #0ea5e9;
  color: white;
  border-color: #0ea5e9;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>