<template>
  <main class="min-h-screen my-4">
    <div
      class="prose dark:prose-invert prose-blockquote:not-italic prose-pre:bg-gray-900 prose-img:ring-1 prose-img:ring-gray-200 dark:prose-img:ring-white/10 prose-img:rounded-lg">
      <ContentDoc v-slot="{ doc }" tag="article">
        <h1 class="mb-0">{{ doc.title }}</h1>
        <span><time class="relative z-10 mb-3 flex items-center text-sm text-gray-400 dark:text-gray-500">
            {{ getReadableDate(doc.published) }}
          </time></span>
        <ToC></ToC>
        <article>
          <ContentRenderer :value="doc" />
        </article>
      </ContentDoc>
    </div>
  </main>
</template>
<script setup>
const route = useRoute();
const { slug } = route.params;

</script>
<style>
.prose h2 a,
.prose h3 a {
  @apply no-underline;
}
</style>