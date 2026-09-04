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
        <el-form :model="form" class="login-form" :rules="rules" ref="formRef">
          <el-form-item prop="username">
            <el-input type="text" placeholder="输入账号" v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" placeholder="输入密码" v-model="form.password" show-password></el-input>
          </el-form-item>
          <el-button class="login-button" type="primary" @click="handleSubmit" :loading="submitting">登录</el-button>
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
import type {FormInstance, FormRules} from 'element-plus'
import {useUserStore} from "@/stores/user.ts";
import {login} from "@/api/auth.ts";

const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
})
const rules = reactive<FormRules<typeof form>>({
  username: [
    {required: true, message: '请输入账号', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, message: '至少输入6位密码', trigger: 'blur'}
  ]
})
const message = ref('')
const router = useRouter()
const userStore = useUserStore()
const submitting = ref(false)



async function handleSubmit() {
  if (submitting.value) return
  message.value = ''
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true

    const result = await login({
      username: form.username.trim(),
      password: form.password,
    }).then(res=>{
      userStore.setUser(res)
      form.password = ''
      router.push('/admin/home')

    }).catch(error=>{
      message.value =
          error instanceof Error ? error.message : '登录未完成，请稍后重试'
    }).finally(()=>{
      submitting.value = false

    })
  }

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