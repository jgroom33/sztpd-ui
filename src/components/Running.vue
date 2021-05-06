<template>
  <div class="p-grid p-dir-col p-justify-center" style="text-align:center">
    <Button label="ietf-datastores:running" class="p-button-secondary p-disabled p-button-lg" />
    <div class="p-col">
      <div class="p-grid p-justify-center">
          <vue-json-pretty :path="'res'" :data="config"> </vue-json-pretty>
      </div>
    </div>
    <div class="p-col p-justify-center">
      <Message
        v-for="msg of errors"
        :sticky="true"
        severity="error"
        :key="msg.id"
        :closable="true"
        >{{ msg["error-message"] }}
      </Message>
    </div>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
export default {
  components: {VueJsonPretty},
  name: "Running",
  computed: {
    username: function() {
      return this.$store.state.username;
    },
    password: function() {
      return this.$store.state.password;
    },
    host: function() {
      return this.$store.state.host;
    },
  },
  data() {
    return {
      loading: true,
      errors: [],
      auth: "",
      info: [],
      config: ""
    };
  },
  created() {
    this.auth =
      "Basic " +
      btoa(this.$store.state.username + ":" + this.$store.state.password);
    this.getConfig();
  },
  methods: {
    show_and_load() {
      this.create_dialog = true;
      this.getInfo();
    },
    getConfig() {
      fetch(
        `${this.host}/restconf/ds/ietf-datastores:running`,
        {
          headers: {
            Accept: "application/yang-data+json",
            "Content-Type": "application/yang-data+json",
            Authorization: this.auth,
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          this.loading = false;
          this.config = json;
        });
    },
  },
};
</script>
