<template>
  <div class="login-page">
    <div class="login-shell">
      <div class="brand-panel">
        <p class="brand-description">BA LEARN</p>
        <h1>用户运营后台</h1>
        <p>学习并复刻 BuildAdmin 前端架构</p>
      </div>
      <div class="form-panel">
        <div>标题</div>
        <el-form :model="form" class="login-form">
          <el-form-item>
            <el-input type="text" placeholder="输入账号" v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item>
            <el-input type="password" placeholder="输入密码" v-model="form.password" show-password></el-input>
          </el-form-item>
          <el-checkbox v-model="form.remember">保持登录</el-checkbox>
          <el-button class="login-button" type="primary" @click="handleSubmit">登录</el-button>
        </el-form>
        <p v-if="message" class="result-message">
          {{ message }}
        </p>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import {reactive, ref} from 'vue'
import { useRouter } from 'vue-router'
const message = ref('')
const router = useRouter();
function handleSubmit() {
  router.push('/admin/home')
}
const form = reactive({
  username: '',
  password: '',
  remember: false,
})
</script>


<style scoped>
.login-page {
  --page-bg: #f2f5ff;
  --panel-bg: #ffffff;
  --brand-bg: #F08080FF;
  --text-main: #182230;
  --text-muted: #667085;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column nowrap;
  padding: 1px;
  box-sizing: border-box;
  color: var(--text-main);
  background: var(--page-bg);
}

.login-shell {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: min(960px, 100%);
  min-height: 560px;
  background: var(--panel-bg);
  border-radius: 2px;
  box-shadow: 0 24px 70px rgba(31, 45, 78, 0.16);
  overflow: hidden;
}

.brand-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--brand-bg);
  color: #fff;
  padding: 48px;
}

.form-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px;
  gap: 10px;
}

.brand-description {
  color: rgba(255, 255, 255, 0.8);
}

.login-button {
  width: 100%;
}

.login-form {
  width: 100%;
}
.result-message {
  margin: 16px 0 0;
  color: var(--text-muted);
  text-align: center;
  font-size: 14px;
}

@media(max-width: 720px){
.brand-panel{
  display: none;
}
  .form-panel{

    padding: 36px 24px;
  }

  .login-page {
    padding: 16px;
  }

  .login-shell {
    display: block;
    width: min(420px, 100%);
    min-height: auto;
  }
}
</style>