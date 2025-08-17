import React, { useState } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/store'

export default function Register(){
  const nav = useNavigate()
  const { signUp } = useAuth()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)

  async function onSubmit(e:React.FormEvent){
    e.preventDefault()
    try{
      setLoading(true)
      await signUp(email,password)
      alert('تم إنشاء الحساب. قد تحتاج لتأكيد البريد.')
      nav('/login')
    }catch(err:any){
      alert(err.message)
    }finally{ setLoading(false) }
  }

  return (
    <Box sx={{display:'grid',placeItems:'center',minHeight:'100dvh', p:2}}>
      <Paper elevation={1} sx={{ p:3, width:'min(420px,100%)' }}>
        <Stack spacing={2}>
          <Typography variant="h5" textAlign="center">إنشاء حساب</Typography>
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} required />
              <TextField type="password" label="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} required />
              <Button type="submit" variant="contained" disabled={loading}>{loading?'...':'تسجيل'}</Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}
