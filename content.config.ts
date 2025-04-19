import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
    collections: {
        content: defineCollection({
            source: '**/*.md',
            type: 'page',
            // Define custom schema for docs collection
            schema: z.object({
                tags: z.array(z.string()),
                image: z.string(),
                date: z.date() // Corrected to use z.date() instead of z.Date()
            })
        })
    }
})
