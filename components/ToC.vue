<script setup>
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => queryContent(route.path).findOne())
if (page && page.body && page.body.toc && page.body.toc.links.length > 0) {
    console.log(page.body)
}
</script>

<template>
    <nav v-if="page && page.body && page.body.toc && page.body.toc.links.length > 0" class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Table of Contents</h2>
        <ul>
            <li v-for="item in page.body.toc.links" :key="item.id" class="mb-2">
                <a :href="'#' + item.id" class="text-teal-500 hover:underline">
                    {{ item.text }}
                </a>
                <ul v-if="item.children" class="ml-4 mt-2">
                    <li v-for="child in item.children" :key="child.id" class="mb-2">
                        <a :href="'#' + child.id" class="text-teal-400 hover:underline">
                            {{ child.text }}
                        </a>
                    </li>
                </ul>
            </li>
        </ul>
    </nav>
</template>
