<template>
  <div class="bg-gray-50 dark:bg-gray-800">
    <NuxtLoadingIndicator color="primary" />
    <NavBar />
    <div class="h-32"></div>
    <div class="flex flex-col lg:flex-row">
      <div
        class="lg:w-1/4 lg:fixed lg:h-screen lg:top-0 lg:left-0 lg:border-r lg:border-gray-200 dark:lg:border-gray-700">
        <SideBar></SideBar>
      </div>
      <div class="lg:ml-[25%] w-full">
        <UContainer>
          <NuxtPage />
        </UContainer>
      </div>
    </div>
    <div class="h-32"></div>
    <footer class="dark:bg-gray-800 text-right py-4 text-gray-300 cursor-pointer">
      &#8508;
    </footer>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Home',
  ogTitle: 'Home',
  description: 'Welcome to the tech blog of Tito Garrido, a seasoned Solutions Architect, SysAdmin, and Programmer based in São Paulo, Brazil. Dive into insightful posts on cutting-edge technologies, cloud infrastructure, and automation tools.',
  ogDescription: 'Welcome to the tech blog of Tito Garrido, a seasoned Solutions Architect, SysAdmin, and Programmer based in São Paulo, Brazil. Dive into insightful posts on cutting-edge technologies, cloud infrastructure, and automation tools. ',
  ogImage: '/images/profile2.jpeg',
  twitterCard: 'summary_large_image',
})
useHead
  ({
    titleTemplate
      : (titleChunk
      ) => {
        return titleChunk
          ? `${titleChunk
          } - Tito Garrido` : 'Tito Garrido';
      }
    ,
    script: [{ 'defer': true, src: 'https://cloud.umami.is/script.js', 'data-website-id': '0865b7b7-b077-425b-b549-29b6add38806' }]
  }
  )
</script>
