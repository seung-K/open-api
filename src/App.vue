<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
      </div>
    </v-app-bar>

    <v-main>
      <mainPage/>
    </v-main>
  </v-app>
</template>

<script>
import mainPage from './components/mainPage';

export default {
  name: 'App',

  components: {
    mainPage,
  },
};
</script>
