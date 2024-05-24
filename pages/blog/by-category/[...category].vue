<template>
    <main class="min-h-screen">
        <div class="my-4">
            <h1 class="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                Posts from {{ category }} tag
            </h1>
            <UDivider icon="i-solar-document-add-outline" />
        </div>
        <ul class="space-y-16">
            <li v-for="(article, id) in articles" :key="id">
                <BlogCard :article="article" />
            </li>
        </ul>
    </main>
</template>

<script setup>
const route = useRoute();
const { category } = route.params;

const { data: articles } = await useAsyncData("all-articles", () =>
    queryContent("/blog").where({ tags: { $contains: category } }).sort({ published: -1 }).find()
);
</script>

<style lang="scss" scoped></style>