<template>
    <main class="min-h-screen">
        <div class="my-4">
            <h1 class="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                Recent Posts
            </h1>
            <UDivider :ui="{border: { base: 'dark:border-gray-500' }}"  icon="i-solar-document-add-outline" />
        </div>
        <ul class="space-y-16">
            <li v-for="(article, id) in articles" :key="id">
                <BlogCard :article="article" />
            </li>
        </ul>
    </main>
</template>

<script setup>
useSeoMeta({
  title: 'Home',
  ogTitle: 'Home',
  description: 'Welcome to the tech blog of Tito Garrido, a seasoned Solutions Architect, SysAdmin, and Programmer based in São Paulo, Brazil. Dive into insightful posts on cutting-edge technologies, cloud infrastructure, and automation tools.',
  ogDescription: 'Welcome to the tech blog of Tito Garrido, a seasoned Solutions Architect, SysAdmin, and Programmer based in São Paulo, Brazil. Dive into insightful posts on cutting-edge technologies, cloud infrastructure, and automation tools. ',
  ogImage: 'https://titogarrido.nuxt.pages/images/profile2.jpeg',
  twitterCard: 'summary_large_image',
})
const today = new Date();
const { data: articles } = await useAsyncData("all-articles", () =>
    queryContent("/blog").where({ draft: { $ne: true }, published: { $lte: today } }).sort({ published: -1 }).find()
);

</script>