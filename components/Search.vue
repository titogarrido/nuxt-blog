<template>
    <div>
        <UButton color="white" variant="ghost" icon="i-solar-magnifer-linear" @click="isOpen = true" />
        <UModal v-model="isOpen">
            <UInput icon="i-solar-magnifer-linear" size="xl" v-model="searchString" variant="none"
                placeholder="Search..." autocomplete="off" :ui="{ icon: { trailing: { pointer: '' } } }"
                @keyup="search">
                <template #trailing>
                    <UButton v-show="searchString !== ''" color="gray" variant="link" icon="i-heroicons-x-mark-20-solid"
                        :padded="false" @click="clearSearch" />
                </template>
            </UInput>
            <div class="cursor-pointer hover:bg-gray-100 p-2" v-for="result in results" :key="result.id">
                <ULink @click="isOpen = false" class="text-sm" :to="result.id">
                    {{ result.title }} <span class="text-clip overflow-hidden text-gray-400"> {{ result.content
                        }}</span>
                </ULink>
            </div>
        </UModal>
    </div>
</template>

<script setup>
const isOpen = ref(false)

defineShortcuts({
    escape: {
        usingInput: true,
        whenever: [isOpen],
        handler: () => { isOpen.value = false }
    }
})

const searchString = ref('')
const results = ref([])
const searching = ref(false)


const search = async () => {
    searching.value = true
    const res = await searchContent(searchString.value)
    results.value = res.value // res is a computed so we pluck out the .value and just add it to our ref
    searching.value = false
}

function clearSearch() {
    searchString.value = ''
    results.value = []
}

</script>