<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Chat with Your Guide</h1>
    
    <!-- Chat Interface -->
    <div class="flex flex-col h-[70vh] border rounded-lg">
      <!-- Chat History -->
      <div class="flex-grow p-4 overflow-y-auto bg-gray-50">
        <!-- AI Message -->
        <div class="flex mb-4">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2">
            <span>AI</span>
          </div>
          <div class="max-w-[75%]">
            <div class="bg-blue-100 p-3 rounded-lg">
              <p>Hello! I'm Lisa, your AI museum guide. How can I help you today?</p>
            </div>
            <span class="text-xs text-gray-500">10:30 AM</span>
          </div>
        </div>
        
        <!-- User Message -->
        <div class="flex mb-4 justify-end">
          <div class="max-w-[75%]">
            <div class="bg-white border p-3 rounded-lg">
              <p>Can you tell me more about the Egyptian collection?</p>
            </div>
            <span class="text-xs text-gray-500 text-right block">10:31 AM</span>
          </div>
          <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ml-2">
            <span>U</span>
          </div>
        </div>
        
        <!-- AI Message with Image -->
        <div class="flex mb-4">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2">
            <span>AI</span>
          </div>
          <div class="max-w-[75%]">
            <div class="bg-blue-100 p-3 rounded-lg">
              <p class="mb-2">The Egyptian collection features artifacts from ancient Egypt, including mummies, sarcophagi, and hieroglyphic inscriptions. The highlight is the Rosetta Stone, which was key to deciphering hieroglyphics.</p>
              <div class="bg-gray-200 h-32 flex items-center justify-center rounded">
                <span class="text-gray-500">Image of Rosetta Stone</span>
              </div>
            </div>
            <span class="text-xs text-gray-500">10:32 AM</span>
          </div>
        </div>
      </div>
      
      <!-- Quick Questions -->
      <div class="p-2 border-t border-b bg-gray-50">
        <p class="text-sm font-medium mb-2">Quick Questions:</p>
        <div class="flex flex-wrap gap-2">
          <button class="bg-white border px-3 py-1 rounded-full text-sm hover:bg-gray-100">
            Where is the Mona Lisa?
          </button>
          <button class="bg-white border px-3 py-1 rounded-full text-sm hover:bg-gray-100">
            Tell me about Renaissance art
          </button>
          <button class="bg-white border px-3 py-1 rounded-full text-sm hover:bg-gray-100">
            Museum opening hours
          </button>
        </div>
      </div>
      
      <!-- Input Area -->
      <div class="p-3 bg-white flex items-center">
        <button class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-2">
          <span>🎤</span>
        </button>
        <input type="text" placeholder="Type your question here..." class="flex-grow border rounded-lg px-3 py-2 mr-2">
        <button class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <span>➤</span>
        </button>
      </div>
    </div>
    
    <!-- Voice Interface Status -->
    <div class="mt-4 text-center text-sm text-gray-500">
      <p>Voice interface is ready. Click the microphone icon to start speaking.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Chat page logic will be implemented here
</script>