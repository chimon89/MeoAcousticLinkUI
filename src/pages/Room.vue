<template>
  <div id="room">
    <div class="drawer drawer-end">
      <input id="music-search-drawer" type="checkbox" class="drawer-toggle">
      <div class="drawer-content">
        <div class="navbar bg-base-100">
          <div class="flex-none">
            <router-link to="/home">
              <button class="btn btn-square btn-ghost">
                <span class="iconfont icon-arrow_navbar_right"></span>
              </button>
            </router-link>
          </div>
          <div class="flex-1">
            <a class="btn btn-ghost normal-case text-xl">一起听</a>
          </div>
          <div class="flex-none">
            <label for="music-search-drawer" class="drawer-button btn btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              &nbsp;&nbsp;点歌
            </label>
          </div>
        </div>
        <div class="container py-4 mb-20">
          <div class="flex flex-col lg:flex-row">
            <div class="basis-2/3 m-1 p-1">
              <div id="playlist" class="w-full overflow-x-auto">
                <audio ref="audio" @timeupdate="updateMusicBox" @ended="endedMusicBox" src=""></audio>
                <table class="table table-compact table-auto w-full">
                  <thead>
                  <tr>
                    <th>标题</th>
                    <th>歌手</th>
                    <th>专辑</th>
                    <th>时间</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr class="hover" v-for="(song, index) in playlist" @click="cutSong(index)">
                    <td>{{ song.name }}</td>
                    <td>{{ song.artists }}</td>
                    <td>{{ song.album.name }}</td>
                    <td>{{ formatDuration(song.duration / 1000) }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="basis-1/3 m-1 p-1 bg-base-100">无编排</div>
          </div>
        </div>

        <footer class="fixed bottom-0 bg-base-100 w-full z-20">
          <div class="container">
            <div class="music-bottom-box p-2">
              <div class="flex justify-between py-1">
                <span>{{ playingMusicName ? playingMusicName : '就绪' }}</span>
                <div class="flex justify-between">
                  <button class="btn btn-xs btn-ghost" @click="toPreviousSong"><span class="iconfont icon-previous"></span></button>
                  <button class="btn btn-xs btn-ghost" @click="playToggle"><span :class="isPlay ? 'iconfont icon-pause' : 'iconfont icon-play'"></span></button>
                  <button class="btn btn-xs btn-ghost" @click="toNextSong"><span class="iconfont icon-next"></span></button>
                </div>
              </div>
              <div class="flex justify-between items-center py-1">
                <span>{{ formatDuration(audioCurrentTime) }}</span>
                <div class="w-full px-2">
                  <input type="range" min="0" :max="audioDuration" :value="audioCurrentTime" @click="changeCurrentTime" class="range range-xs">
                </div>
                <span>{{ formatDuration(audioDuration) }}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <div class="drawer-side">
        <label for="music-search-drawer" class="drawer-overlay"></label>
        <div class="p-4 overflow-y-auto w-full lg:w-8/12 bg-base-100 text-base-content">
          <div>
            <label for="music-search-drawer" class="drawer-button btn btn-ghost">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path></svg>
              返回
            </label>
          </div>
          <div class="p-2">
            <input ref="searchBox" type="text" placeholder="搜索单曲" class="input input-bordered w-full" @input="searchMusic">
          </div>
          <div class="px-4 py-2">
            <span class="text-2xs">{{ !!searchSongList ? '仅显示30条结果，若未能找到你想要的结果，请尝试调整搜索词。' : ''}}</span>
          </div>
          <ul class="menu">
            <li class="hover-bordered" v-for="item in searchSongList" :key="item.id" @click="addPlaylist(item)">
              <a>
                <button :class='playlist.indexOf(item) === -1 ? "btn btn-sm btn-active btn-ghost search-add-btn" : "btn btn-sm btn-success search-add-btn"'>
                  <span :class='playlist.indexOf(item) === -1 ? "iconfont icon-add" : "iconfont icon-right"'></span>
                </button>
                {{ item.name }} - {{item.artists}}
                <div class="badge badge-outline truncate">{{ item.album.name }}</div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: "Room",
  data () {
    return {
      playlist: [],
      searchSongList: [],
      isPlay: false,
      playIndex: 0,
      playingMusicName: '',
      audioDuration: 0,
      audioCurrentTime: 0,
      /* 节流 */
      searchingDone: true,
      searchTimer: null
    }
  },
  methods: {
    playToggle: function () {
      if (!this.isPlay) {
        this.isPlay = true
        this.$refs.audio.play()
      } else {
        this.isPlay = false
        this.$refs.audio.pause()
      }
    },
    forcePlay: function () {
      this.isPlay = true
      this.$refs.audio.play()
    },
    forcePause: function () {
      this.isPlay = false
      this.$refs.audio.pause()
    },
    changeCurrentTime() {
      this.forcePause()
      this.$refs.audio.currentTime = this.audioCurrentTime
      this.forcePlay()
    },
    updateMusicBox: function () {
      if (!this.playlist.length) {
        this.playingMusicName = ''
      } else {
        this.playingMusicName = `${this.playlist[this.playIndex].name} - ${this.playlist[this.playIndex].artists}`
      }
      this.audioCurrentTime = this.$refs.audio.currentTime
      this.audioDuration = this.$refs.audio.duration
    },
    endedMusicBox: function () {
      this.forcePause()
      this.toNextSong()
    },
    searchMusic() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        console.log(this.$refs.searchBox.value)
        if (!!this.$refs.searchBox.value.trim() && this.searchingDone) {
          this.searchingDone = false
          axios({
            url: `https://ncm.api.chimon.work/search?keywords=${this.$refs.searchBox.value.trim()}`
          }).then(({data: res}) => {
            this.searchSongList = []
            console.log(res.result.songs)
            res.result.songs.forEach(i=>{
              let song = {}
              song.id = i.id
              song.name = i.name
              song.album = i.album
              song.duration = i.duration

              let artists = []
              i.artists.forEach(j=>{
                artists.push(j.name)
              })
              song.artists = artists.join("/") === '' ? '未知' : artists.join("/")
              this.searchSongList.push(song)
            })
            this.searchingDone = true
          }).catch(err => {
            console.log(err)
            this.searchingDone = true
          })
        }
      }, 400)
    },
    addPlaylist(obj) {
      this.playlist.indexOf(obj) === -1 ? this.playlist.push(obj) : console.log('重复添加' + JSON.stringify(obj))
    },
    formatDuration(duration) {
      let m = Math.floor(duration / 60).toString()
      let s = Math.floor(duration % 60) < 10
        ? '0'+Math.floor(duration % 60).toString()
        : Math.floor(duration % 60).toString()
      return `${m}:${s}`
    },
    cutSong(index) {
      this.forcePause()
      this.playIndex = index
      this.playingMusicName = '正在解析'
      axios({
        url: `https://ncm.api.chimon.work/song/url?id=${this.playlist[index].id}`,
        method: 'POST',
        data: {
          cookie: localStorage.getItem('MAL_NCM_COOKIE')
        }
      }).then(({data:res}) => {
        this.$refs.audio.src = res.data[0].url
        this.forcePlay()
      })
    },
    toNextSong() {
      this.forcePause()
      if (this.playIndex === this.playlist.length - 1) {
        this.playIndex = 0
      } else {
        this.playIndex += 1
      }
      this.cutSong(this.playIndex)
    },
    toPreviousSong() {
      this.forcePause()
      if (this.playIndex === 0) {
        this.playIndex = this.playlist.length - 1
      } else {
        this.playIndex -= 1
      }
      this.cutSong(this.playIndex)
    },
  }
}
</script>

<style scoped>
@import '../iconfont/iconfont.css';
</style>
