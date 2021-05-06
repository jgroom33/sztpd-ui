import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  modules: {
  },
  getters: {
    username: state => state.username,
    password: state => state.password,
    host: state => state.host,
  },
  state: {
    username: null,
    password: null,
    host: "http://localhost:8080",
  },
  mutations: {
    setUsername(state, payload) {
      state.username = payload;
    },
    setPassword(state, payload) {
      state.password = payload;
    },
    setHost(state, payload) {
      state.host = payload;
    }
  },
  strict: debug
});
