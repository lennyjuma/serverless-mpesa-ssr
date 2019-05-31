// store.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

// Assume we have a universal API that returns Promises
// and ignore the implementation details
import { fetchSources, fetchHeadlines, fetchItem } from "./api/index"

export function createStore () {
    return new Vuex.Store({
        // IMPORTANT: state must be a function so the module can be
        // instantiated multiple times
        state: () => ({
            items: {},
            sources: {},
            news: {}
        }),

        actions: {
            fetchSources({commit}){
                return fetchSources().then((sources) => {
                    commit('setSources', sources);
                });
            },
            fetchHeadlines({commit}, source){
                return fetchHeadlines(source).then((news) => {
                    commit('setNews', {source, news});
                });
            },
            fetchItem ({ commit }, id) {
                // return the Promise via `store.dispatch()` so that we know
                // when the data has been fetched
                return fetchItem(id).then(item => {
                    commit('setItem', { id, item })
                })
            }
        },

        mutations: {
            setSources(state, {sources}){
                Vue.set(state.sources, 'sources', sources);
            },
            setNews(state, {source, news}){
                Vue.set(state.news, source, news);
            },
            setItem (state, { id, item }) {
                Vue.set(state.items, id, item)
            }
        }
    })
}