<template>
    <NuxtLink :to="article._path" class="group">
        <article>
            
            <div class="flex justify-between">
            
                <h1
                class="text-2xl font-semibold font-display tracking-tight text-gray-800 dark:text-gray-100 group-hover:text-primary-600">
                {{ article.title }}
            </h1>
                <time
                class="relative z-10 mb-3 flex items-center text-sm text-gray-400 dark:text-gray-500 pl-3.5"
                ><span class="absolute inset-y-0 left-0 flex items-center" aria-hidden="true"><span
                        class="h-4 w-0.5 rounded-full bg-gray-200 dark:bg-gray-500"></span></span>
                {{ getReadableDate(article.published) }}
            </time>
            </div>
            
            <p class="relative z-10 mt-2 text-sm text-gray-600 dark:text-gray-400">
                {{ article.description }}
            </p>
        </article>
    </NuxtLink>
</template>

<script setup>
defineProps({
    article: {
        type: Object,
        required: true,
    },
});
</script>