<template>
  <Toolbar>
    <template #left>
      <Button
        label="Running"
        @click="() => $router.push('/ietf-datastores:running')"
        class="p-button p-button-text p-button-plain p-button-lg"
      />
      <Button
        label="Certs"
        @click="() => $router.push('/certs')"
        class="p-button p-button-text p-button-plain p-button-lg"
      />
      <Button
        label="Transport"
        @click="() => $router.push('/transport')"
        class="p-button p-button-text p-button-plain p-button-lg"
      />
      <Button
        label="Device Types"
        @click="() => $router.push('/device-types')"
        class="p-button p-button-text p-button-plain p-button-lg"
      />
      <Button
        label="Boot Images"
        @click="() => $router.push('/boot-images')"
        class="p-button p-button-text p-button-plain p-button-lg"
      />
      <Button
        label="Configs"
        @click="() => $router.push('/configurations')"
        class="p-button p-button-text p-button-plain p-button-lg"
      />
      <Button
        label="Conveyed Info"
        @click="() => $router.push('/conveyed-information')"
        class="p-button p-button-text p-button-plain p-button-lg"
      />
      <Button
        label="Devices"
        @click="() => $router.push('/devices')"
        class="p-button p-button-text p-button-plain p-button-lg"
      />
    </template>
    <template #right>
      <span class="p-float-label">
        <InputText id="username" type="text" v-model="username" />
        <label for="inputtext">Username</label>
      </span>
      <span class="p-float-label">
        <InputText id="password" type="password" v-model="password" />
        <label for="inputtext">Password</label>
      </span>
    </template>
  </Toolbar>
</template>

<script>
export default {
  name: "Topnavbar",
  data() {
    return {
      username: "",
      password: ""
    };
  },
  computed: {},
  created() {
    this.username = this.$store.state.username
    this.password = this.$store.state.password
  },
  watch: {
    username: function(val) {
      this.$store.commit('setUsername', val)
      this.username = val
    },
    password: function(val) {
      this.$store.commit('setPassword', val)
      this.password = val
    },
  },
};
</script>
