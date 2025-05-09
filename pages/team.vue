<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <!-- Back to Main Site Link -->
    <div class="mb-8 text-left">
      <a 
        href="https://hugo.isclay.com" 
        target="_blank" 
        rel="noopener noreferrer"
        class="inline-flex items-center text-sm text-primary hover:underline"
      >
        <Icon name="ph:arrow-left-bold" class="mr-2 h-4 w-4" />
        Back to hugo.isclay.com
      </a>
    </div>
    <!-- End Back to Main Site Link -->

    <header class="mb-12 text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
        Meet Our Team
      </h1>
      <p class="mt-4 text-lg text-muted-foreground">
        The brilliant minds behind Hugo AI Tour Guide. (This is our latest team lineup.)
      </p>
    </header>

    <!-- Achievements Section - New Pill Style -->
    <section class="mb-12 flex justify-center">
      <a href="https://elevenlabs.io/blog/announcing-the-winners-of-the-elevenlabs-worldwide-hackathon#6-1st-prize-hugo-tour-guide" target="_blank" rel="noopener noreferrer" class="inline-block hover:scale-105 transition-transform duration-200">
        <div class="inline-flex items-center space-x-2 rounded-full bg-purple-100 px-6 py-3 text-sm font-semibold text-purple-700 shadow-md dark:bg-purple-600/20 dark:text-purple-300">
          <span class="text-lg">🏆</span>
          <span>We just won 1st place in the 11Labs X a16z Worldwide Hackathon!</span>
        </div>
      </a>
    </section>

    <!-- Incubation Information Section -->
    <section class="mb-12 text-center">
      <div class="flex flex-col items-center justify-center gap-2 sm:gap-3">
        <p class="text-muted-foreground">
          Proudly incubated at
        </p>
        <Button as-child size="lg" class="rounded-full font-semibold px-6 h-auto py-2.5"> 
          <a href="https://www.betauniversity.org/" target="_blank" rel="noopener noreferrer">
            Beta University / BETA Camp
          </a>
        </Button>
        <p class="mt-1 text-sm text-muted-foreground max-w-lg mx-auto">
          A Silicon Valley-based program empowering early-stage entrepreneurs.
        </p>
      </div>
    </section>

    <!-- Team Members Section -->
    <section class="mb-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- YiFan Sun -->
        <Card class="text-center border shadow-lg">
          <CardContent class="pt-6">
            <Avatar class="w-32 h-32 mx-auto mb-4 text-4xl">
              <AvatarImage src="/images/YIFAN_SUN.jpeg" alt="YiFan Sun" />
              <AvatarFallback>YS</AvatarFallback>
            </Avatar>
            <a href="https://www.linkedin.com/in/yilun-s/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-foreground hover:text-primary group">
              <h3 class="text-xl font-semibold group-hover:underline">YiFan Sun</h3>
              <Icon name="mdi:linkedin" class="w-5 h-5 ml-2 text-blue-600 group-hover:text-blue-700" />
            </a>
            <p class="text-primary mt-1">Founder</p>
            <p class="text-sm text-muted-foreground">Columbia University</p>
          </CardContent>
        </Card>

        <!-- Changting Lu -->
        <Card class="text-center border shadow-lg">
          <CardContent class="pt-6">
            <Avatar class="w-32 h-32 mx-auto mb-4 text-4xl">
              <AvatarImage src="/images/CHANGTING_LU.jpeg" alt="Changting Lu" />
              <AvatarFallback>CL</AvatarFallback>
            </Avatar>
            <a href="https://www.linkedin.com/in/changting-lu/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-foreground hover:text-primary group">
              <h3 class="text-xl font-semibold group-hover:underline">Changting Lu</h3>
              <Icon name="mdi:linkedin" class="w-5 h-5 ml-2 text-blue-600 group-hover:text-blue-700" />
            </a>
            <p class="text-primary mt-1">Co-Founder & Chief Content Advisor</p>
            <p class="text-sm text-muted-foreground">California Institute of the Arts (CalArts)</p>
          </CardContent>
        </Card>

        <!-- Zhen Zhang -->
        <Card class="text-center border shadow-lg">
          <CardContent class="pt-6">
            <Avatar class="w-32 h-32 mx-auto mb-4 text-4xl">
              <AvatarImage src="/images/ZHEN_ZHANG.jpeg" alt="Zhen Zhang" />
              <AvatarFallback>ZZ</AvatarFallback>
            </Avatar>
            <a href="https://www.linkedin.com/in/isakeem/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-foreground hover:text-primary group">
              <h3 class="text-xl font-semibold group-hover:underline">Zhen Zhang</h3>
              <Icon name="mdi:linkedin" class="w-5 h-5 ml-2 text-blue-600 group-hover:text-blue-700" />
            </a>
            <p class="text-primary mt-1">Co-Founder & Tech Lead</p>
            <p class="text-sm text-muted-foreground">Trine University</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Product Preview Section -->
    <section class="mb-16">
      <div class="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div class="relative p-6 md:p-16">
          <!-- Background Color Block -->
          <div class="absolute inset-0 grid grid-cols-12 size-full">
            <div class="col-span-full lg:col-span-7 lg:col-start-6 bg-muted/30 dark:bg-neutral-800/40 w-full h-5/6 rounded-xl sm:h-3/4 lg:h-full"></div>
          </div>
          <!-- End Background Color Block -->

          <!-- Grid -->
          <div class="relative z-10 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
            <!-- Image Display Area -->
            <div class="lg:col-span-6 lg:order-1 flex justify-center items-center min-h-[650px] sm:min-h-[750px]">
              <div class="relative h-[650px] w-full flex items-center justify-center mb-8 md:mb-12 overflow-hidden">
                <TransitionGroup 
                  name="feature-slide" 
                  tag="div" 
                  class="relative w-full h-full flex items-center justify-center"
                >
                  <div 
                    v-for="(feature, index) in productFeatures" 
                    :key="feature.id" 
                    :class="['feature-image-item', getAnimateState(index, activeIndex), 'overflow-hidden', 'rounded-xl', 'shadow-xl', 'dark:shadow-gray-900/20']" 
                    @click="selectFeature(feature.id)"
                    class="cursor-pointer flex items-center justify-center"
                  >
                    <img 
                      :src="feature.imageUrl" 
                      :alt="feature.name" 
                      class="w-full h-full object-cover"
                    />
                  </div>
                </TransitionGroup>
              </div>
            </div>
            <!-- End Image Display Area -->

            <!-- Feature Navigation Area -->
            <div class="mt-10 lg:mt-0 lg:col-span-6 lg:col-start-7 xl:col-start-8 lg:order-2">
              <h2 class="text-2xl text-foreground font-bold sm:text-3xl mb-6 md:mb-10">
                Hugo's Core Capabilities
              </h2>

              <div class="flex flex-col gap-4">
                <button 
                  v-for="feature in productFeatures" 
                  :key="feature.id + '-trigger'" 
                  @click="selectFeature(feature.id)"
                  type="button"
                  class="w-full text-left p-4 md:p-5 rounded-xl transition-all duration-200 ease-in-out focus:outline-none ring-1 ring-transparent hover:bg-muted dark:hover:bg-muted/50"
                  :class="{
                    'bg-card shadow-xl scale-[1.03] dark:bg-neutral-700/60': activeFeatureId === feature.id,
                    'bg-muted/40 dark:bg-neutral-800/30': activeFeatureId !== feature.id
                  }"
                >
                  <span class="flex gap-x-4 sm:gap-x-6">
                    <Icon 
                      :name="feature.iconName" 
                      class="shrink-0 mt-1 sm:mt-2 size-6 md:size-7 text-foreground"
                      :class="{ 'text-primary dark:text-blue-500': activeFeatureId === feature.id }"
                    />
                    <span class="grow">
                      <span 
                        class="block text-lg font-semibold text-foreground"
                        :class="{ 'text-primary dark:text-blue-500': activeFeatureId === feature.id }"
                      >
                        {{ feature.title }}
                      </span>
                      <span 
                        class="block mt-1 text-sm text-muted-foreground"
                        :class="{ 'text-card-foreground dark:text-gray-200': activeFeatureId === feature.id }"
                      >
                        {{ feature.description }}
                      </span>
                    </span>
                  </span>
                </button>
              </div>
            </div>
            <!-- End Feature Navigation Area -->
          </div>
          <!-- End Grid -->
        </div>
      </div>
    </section>

    <!-- Product Video Section -->
    <section class="mb-16">
      <h2 class="text-3xl font-semibold mb-8 text-center">Watch Hugo in Action</h2>
      <div 
        style="position: relative; width: 100%; padding-bottom: 60%;" 
        class="rounded-lg overflow-hidden shadow-xl"
      >
        <iframe 
          src="https://www.youtube.com/embed/Mp87eaIXcqE" 
          title="Hugo AI Tour Guide Demo"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerpolicy="strict-origin-when-cross-origin" 
          allowfullscreen
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        ></iframe>
      </div>
      <p class="mt-4 text-center text-muted-foreground">
        See how Hugo provides a seamless and engaging experience for your users.
      </p>
    </section> 
    <!-- End Product Video Section -->

    <!-- New Full-Width CTA Section -->
    <section class="py-16 lg:py-24 bg-muted/40 dark:bg-muted/20">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-6">
          Ready to Explore Hugo?
        </h2>
        <p class="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Experience the future of AI-powered guided tours. Click the button below to try our interactive demo.
        </p>
        <Button as-child size="lg" class="px-10 py-4 rounded-lg font-semibold text-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <a href="https://hugo.isclay.com" target="_blank" rel="noopener noreferrer">
            Try The Demo Now
            <Icon name="ph:rocket-launch-bold" class="ml-3 h-6 w-6" />
          </a>
        </Button>
      </div>
    </section>
    <!-- End New Full-Width CTA Section -->

    <!-- Join Waiting List Section -->
    <section class="py-12 bg-muted dark:bg-muted/50">
      <div class="container mx-auto px-4 py-8 md:py-12">
        <h2 class="text-3xl font-semibold mb-8 text-center">Join Our Seed Users</h2>
        <div class="max-w-lg mx-auto text-lg text-muted-foreground space-y-6">
          <p>
            Be among the first to experience Hugo and help shape the future of AI-powered travel assistance.
          </p>
          <form @submit.prevent="handleSignup" class="flex flex-col sm:flex-row gap-4">
            <Input 
              v-model="email" 
              type="email" 
              placeholder="Enter your email" 
              class="flex-grow"
            />
            <Button type="submit">Sign Up</Button>
          </form>
          <p class="mt-4 text-sm text-muted-foreground">
            Alternatively, you can <a href="https://hugo.isclay.com" class="text-primary hover:underline">Join the Waitinglist</a> or <a href="https://hugo.isclay.com" class="text-primary hover:underline">Try demo</a>.
          </p>
        </div>
      </div>
    </section>

    <!-- Partnership Section -->
    <!-- <section class="mb-16">
      <div class="prose dark:prose-invert max-w-none">
        <h2 class="text-3xl font-semibold mb-8 text-center">Partnership</h2>
        <p class="mb-2 text-muted-foreground">Looking for Partnerships</p>
        <p class="mb-4 text-muted-foreground">
          If you're in the travel or museum space—or a digital nomad yourself—we'd love to hear your insights and explore potential collaborations. Let's shape the future of travel together!
        </p>
        <p class="text-muted-foreground">
          Contact: <a href="mailto:contact@hugoguide.xyz" class="text-primary hover:underline">contact@hugoguide.xyz</a>
        </p>
      </div>
    </section> -->

    <!-- Footer Placeholder -->
    <footer class="mt-16 text-center text-sm text-muted-foreground">
      <p>&copy; {{ new Date().getFullYear() }} Hugo AI Tour Guide. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button';

definePageMeta({
  layout: 'fullscreen'
});

interface ProductFeature {
  id: string;
  name: string; 
  title: string; 
  description: string;
  imageUrl: string;
  iconName: string; 
}

const productFeatures = ref<ProductFeature[]>([
  {
    id: "personalized-planning",
    iconName: "ph:gear-six-fill", 
    title: "Personalized Planning",
    description: "AI crafts unique itineraries tailored to your interests, preferences, and travel style.",
    imageUrl: "/images/screenshots/app_home.jpg",
    name: "Hugo AI Tour Guide - Personalized Planning Interface", 
  },
  {
    id: "guided-mode",
    iconName: "ph:map-trifold-fill",
    title: "Guided Tour Mode",
    description: "Explore with interactive maps and live AI explanations for points of interest.",
    imageUrl: "/images/screenshots/app_guide.jpg",
    name: "Hugo AI Tour Guide - Guided Tour Mode with Map",
  },
  {
    id: "interactive-adjustments",
    iconName: "ph:arrows-in-line-vertical-fill",
    title: "Interactive Adjustments",
    description: "Easily modify your itinerary anytime using simple voice or text commands.",
    imageUrl: "/images/screenshots/app_guide_tips.jpg",
    name: "Hugo AI Tour Guide - Interactive Route Adjustments or Tips",
  },
  {
    id: "content-generation",
    iconName: "ph:text-aa-fill",
    title: "Content Generation",
    description: "Generates rich, engaging content for various platforms and use cases.",
    imageUrl: "/images/screenshots/app_add_to_home.jpg", 
    name: "Content Generation Feature",
  },
  {
    id: "multi-language-support",
    iconName: "ph:translate-fill",
    title: "Multi-language Support",
    description: "Supports multiple languages for a global audience.",
    imageUrl: "/images/screenshots/app_home.jpg", 
    name: "Multi-language Support Feature",
  }
]);

const activeFeatureId = ref<string>(productFeatures.value[Math.floor(productFeatures.value.length / 2)].id);

function selectFeature(id: string) {
  activeFeatureId.value = id;
  console.log('selectFeature - new activeFeatureId:', activeFeatureId.value);
  console.log('selectFeature - new activeIndex:', activeIndex.value);
};

const activeIndex = computed(() => {
  return productFeatures.value.findIndex(f => f.id === activeFeatureId.value)
});

const getAnimateState = (itemIndex: number, currentActiveIdx: number): string => {
  const diff = itemIndex - currentActiveIdx;
  let state = '';
  if (diff === 0) {
    state = 'center';
  } else if (diff === -1) {
    state = 'leftPeek';
  } else if (diff === 1) {
    state = 'rightPeek';
  } else if (diff < -1) {
    state = 'farLeft';
  } else if (diff > 1) {
    state = 'farRight';
  }
  console.log(`Item ${itemIndex}, Active ${currentActiveIdx}, Diff ${diff}, State: ${state}`);
  return state;
};

const activeFeature = computed(() => {
  return productFeatures.value.find(f => f.id === activeFeatureId.value) || productFeatures.value[0];
});

const email = ref('');

function handleSignup() {
  if (email.value) {
    console.log('Signing up with email:', email.value);
    alert(`Thank you for signing up with ${email.value}!`);
    email.value = ''; 
  }
};
</script>

<style scoped>
.feature-image-item {
  position: absolute;
  /* Base width for non-center items, center width will be larger */
  width: 220px; /* Adjusted base width for new aspect ratio */
  height: 600px; /* Further Increased height */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1); 
  backface-visibility: hidden; 
  transform-style: preserve-3d; 
  /* overflow-hidden and rounded-xl are now applied via :class binding */
  /* shadow-xl is now applied via :class binding */
}

/* Define states based on getAnimateState return values */
.center {
  /* Width for the centered, active image */
  width: 280px; /* Adjusted main image width for new aspect ratio */
  transform: translateX(0) scale(1);
  opacity: 1;
  z-index: 10;
}

.leftPeek {
  transform: translateX(-210px) scale(0.80); /* Adjusted X for new widths */
  opacity: 0.6;
  z-index: 5;
}

.rightPeek {
  transform: translateX(210px) scale(0.80); /* Adjusted X for new widths */
  opacity: 0.6;
  z-index: 5;
}

.farLeft {
  transform: translateX(-420px) scale(0.65); /* Adjusted X */
  opacity: 0; 
  z-index: 1;
}

.farRight {
  transform: translateX(420px) scale(0.65); /* Adjusted X */
  opacity: 0; 
  z-index: 1;
}

/* TransitionGroup CSS classes (optional for this specific use case but good practice) */
.feature-slide-move,
.feature-slide-enter-active,
.feature-slide-leave-active {
  transition: all 0.7s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.feature-slide-enter-from,
.feature-slide-leave-to {
  opacity: 0;
  /* You might want to add a transform here if items are actually entering/leaving the list */
  /* e.g., transform: translateY(30px); */
}

.feature-slide-leave-active {
  position: absolute; 
}

/* Additional styling for page if needed */
.container {
  max-width: 1200px;
}

/* Adjustments for better visual hierarchy or spacing */
</style>
