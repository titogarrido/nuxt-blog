<template>
    <div
        class="p-4 flex flex-col items-center text-center opacity-80 hover:opacity-100 transition-opacity duration-300">
        <NuxtLink to="/">
            <img src="/images/profile2.jpeg" alt="Tito Garrido"
                class="w-48 h-48 rounded-full mb-4 border border-gray p-[5px]" />
        </NuxtLink>
        <h2 class="text-xl font-semibold mb-1">Tito Garrido</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Solutions Architect, SysAdmin and Programmer</p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-8">
            <icon name="solar:map-point-bold"></icon> São Paulo, Brazil
        </p>
        <div class="flex flex-col justify-start items-start space-y-4">
            <div>
                <a href="https://twitter.com/titogarrido" target="_blank" rel="noopener noreferrer">
                    <Icon aria-hidden="true" name="iconoir:twitter" class="w-5 h-5" /> Twitter
                </a>
            </div>
            <div>
                <a href="https://www.linkedin.com/in/titogarrido" target="_blank" rel="noopener noreferrer">
                    <Icon aria-hidden="true" name="iconoir:linkedin" class="w-5 h-5" /> LinkedIn
                </a>
            </div>
            <div>
                <a href="https://github.com/titogarrido" target="_blank" rel="noopener noreferrer">
                    <Icon aria-hidden="true" name="iconoir:github" class="w-5 h-5" /> GitHub
                </a>
            </div>
            <div>
                <a href="https://stackoverflow.com/users/1695094/tito" target="_blank" rel="noopener noreferrer">
                    <Icon aria-hidden="true" name="iconoir:stackoverflow" class="w-5 h-5" /> StackOverflow
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>

</script>

<style lang="scss" scoped></style>