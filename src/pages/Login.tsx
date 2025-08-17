import React, { useState } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../services/store'

export default function Login(){
  const nav = useNavigate()
  const loc = useLocation()
  const { signIn } = useAuth()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)

  async function onSubmit(e:React.FormEvent){
    e.preventDefault()
    try{
      setLoading(true)
      await signIn(email,password)
      const to = (loc.state as any)?.from?.pathname || '/'
      nav(to, { replace:true })
    }catch(err:any){
      alert(err.message)
    }finally{ setLoading(false) }
  }

  return (
    <Box sx={{display:'grid',placeItems:'center',minHeight:'100dvh', p:2}}>
      <Paper elevation={1} sx={{ p:3, width:'min(420px,100%)' }}>
        <Stack spacing={2}>
          <Typography variant="h5" textAlign="center">تسجيل الدخول</Typography>
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} required />
              <TextField type="password" label="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} required />
              <Button type="submit" variant="contained" disabled={loading}>{loading?'...':'دخول'}</Button>
            </Stack>
          </Box>
          <Button component={RouterLink} to="/register">إنشاء حساب</Button>
        </Stack>
      </Paper>
    </Box>
  )
}
