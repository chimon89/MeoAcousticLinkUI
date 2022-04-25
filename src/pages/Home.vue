<template>
  <div id="home">
    <div class="navbar bg-base-100">
      <div class="flex-none">
        <button class="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
      <div class="flex-1">
        <a class="btn btn-ghost normal-case text-xl">MeoAcousticLink</a>
      </div>
      <div class="flex-none">
        <button class="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
        </button>
      </div>
    </div>
    <div class="container mt-8">
      <div class="join-btn w-1/3 mx-auto py-1">
        <router-link to="/room"><button class="btn btn-block">一起听</button></router-link>
      </div>
      <div class="ncm-login-btn w-1/3 mx-auto py-1">
        <label for="ncm-login-model" class="btn btn-block btn-primary modal-button">{{ !!ncmUser ? 'Logged as ' + ncmUser : '扫码登录'}}</label>
        <input type="checkbox" id="ncm-login-model" class="modal-toggle" @click="ncmQrLogin">
        <div class="modal">
          <div class="modal-box w-11/12 max-w-5xl">
            <h3 class="font-bold text-lg mx-auto">扫码登录</h3>
            <div class="w-1/4 mx-auto text-center" ref="ncm-qr">
            </div>
            <div class="modal-action">
              <label for="ncm-login-model" class="btn btn-error">{{ ncmLoginStatus }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: "Home",
  data() {
    return {
      ncmLoginStatus: 'Loading',
      ncmUser: ''
    }
  },
  created() {
    let cookie = localStorage.getItem('MAL_NCM_COOKIE')
    if (!!cookie) {
      axios({
        url: `https://ncm.api.chimon.work/login/status?timestamp=${Date.now()}`,
        method: 'POST',
        data: {
          cookie: cookie
        }
      }).then(({data:res})=> {
        this.ncmUser = res.data.profile.nickname
      })
    }
  },
  methods: {
    ncmQrLogin: function () {
      let unikey = ''
      let timer = null
      this.$refs["ncm-qr"].innerHTML=`<i class="iconfont icon-loading"></i>`
      axios({
        url: `https://ncm.api.chimon.work/login/qr/key?timestamp=${Date.now()}`
      }).then(({data:res}) => {
        unikey = res.data.unikey
        axios({
          url: `https://ncm.api.chimon.work/login/qr/create?key=${unikey}&qrimg=true&timestamp=${Date.now()}`
        }).then(({data:res}) => {
          this.$refs["ncm-qr"].innerHTML = `<img src="${res.data.qrimg}" alt="ncm-qr">`
          timer = setInterval(() => {
            axios({
              url: `https://ncm.api.chimon.work/login/qr/check?key=${unikey}&timestamp=${Date.now()}`
            }).then(({data:res})=>{
              if (res.code === 803) {
                localStorage.setItem('MAL_NCM_COOKIE', res.cookie)
                console.log(res.cookie)
                axios({
                  url: `https://ncm.api.chimon.work/login/status?timestamp=${Date.now()}`,
                  method: 'POST',
                  data: {
                    cookie: res.cookie
                  }
                }).then(({data:res})=> {
                  this.ncmLoginStatus = `登陆成功：${res.data.profile.nickname}`
                })
                clearInterval(timer)
              } else {
                this.ncmLoginStatus = res.message
              }
            })
          }, 1500)
        })
      })

    }
  }
}
</script>

<style scoped>
@import "../iconfont/iconfont.css";
</style>
