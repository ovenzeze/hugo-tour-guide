<template>
  <div class="container mx-auto p-4">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-3xl font-bold">AI Tour Guide - Home</h1>
      <Badge variant="secondary" class="ml-4 text-base px-3 py-1 rounded-lg shadow">Beta</Badge>
    </div>
    <p class="mb-6 text-gray-600 text-lg">Welcome to the AI Tour Guide, your personalized museum experience assistant.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card class="flex flex-col items-center justify-center p-6 rounded-2xl shadow-md hover:shadow-xl transition">
        <NuxtLink to="/guide" class="flex flex-col items-center no-underline text-inherit w-full">
          <Icon name="ph:user-circle" size="40" style="color: #6366f1" class="mb-2" />
          <CardHeader class="items-center text-center p-0">
            <CardTitle class="text-lg font-semibold mb-1">AI Guide Introduction</CardTitle>
            <CardDescription class="text-gray-500">Meet your AI guide Lisa Ghimire</CardDescription>
          </CardHeader>
        </NuxtLink>
      </Card>
      <Card class="flex flex-col items-center justify-center p-6 rounded-2xl shadow-md hover:shadow-xl transition">
        <NuxtLink to="/preference" class="flex flex-col items-center no-underline text-inherit w-full">
          <Icon name="ph:gear" size="40" style="color: #6366f1" class="mb-2" />
          <CardHeader class="items-center text-center p-0">
            <CardTitle class="text-lg font-semibold mb-1">Preferences</CardTitle>
            <CardDescription class="text-gray-500">Set your visit preferences</CardDescription>
          </CardHeader>
        </NuxtLink>
      </Card>
      <Card class="flex flex-col items-center justify-center p-6 rounded-2xl shadow-md hover:shadow-xl transition">
        <NuxtLink to="/tour" class="flex flex-col items-center no-underline text-inherit w-full">
          <Icon name="ph:map-trifold" size="40" style="color: #6366f1" class="mb-2" />
          <CardHeader class="items-center text-center p-0">
            <CardTitle class="text-lg font-semibold mb-1">Exhibit Navigation</CardTitle>
            <CardDescription class="text-gray-500">Explore museum exhibits</CardDescription>
          </CardHeader>
        </NuxtLink>
      </Card>
      <Card class="flex flex-col items-center justify-center p-6 rounded-2xl shadow-md hover:shadow-xl transition">
        <NuxtLink to="/chat" class="flex flex-col items-center no-underline text-inherit w-full">
          <Icon name="ph:microphone" size="40" style="color: #6366f1" class="mb-2" />
          <CardHeader class="items-center text-center p-0">
            <CardTitle class="text-lg font-semibold mb-1">Voice Interaction</CardTitle>
            <CardDescription class="text-gray-500">Chat with your AI guide</CardDescription>
          </CardHeader>
        </NuxtLink>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '~/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
// Home page logic will be implemented here
</script>
