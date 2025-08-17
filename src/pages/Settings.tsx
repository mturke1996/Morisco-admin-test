import React, { useState } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../services/store'
import { supabase } from '../services/supabaseClient'

export default function Settings(){
  const { brand, updateBrand, logoUrl, updateLogoUrl } = useAuth()
  const [brandName,setBrandName]=useState(brand)
  const [logo,setLogo]=useState<File|null>(null)

  async function uploadLogo(){
    if(!logo) return
    const ext = logo.name.split('.').pop()
    const fileName = `brand.${ext}`
    const up = await supabase.storage.from('branding').upload(fileName, logo, { upsert: true })
    if(up.error) return alert(up.error.message)
    const pub = supabase.storage.from('branding').getPublicUrl(fileName)
    updateLogoUrl(pub.data.publicUrl)
    alert('تم رفع الشعار')
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb:2 }}>الإعدادات</Typography>
      <Paper sx={{ p:2 }}>
        <Stack spacing={2}>
          <TextField label="اسم المقهى" value={brandName} onChange={e=>setBrandName(e.target.value)} />
          <Button variant="contained" onClick={()=>{ updateBrand(brandName); alert('تم الحفظ') }}>حفظ الاسم</Button>
          <TextField type="file" inputProps={{ accept:'image/*' }} onChange={(e:any)=>setLogo(e.target.files?.[0]??null)} />
          <Button variant="outlined" onClick={uploadLogo}>رفع الشعار</Button>
          <TextField label="رابط الشعار الحالي" value={logoUrl} onChange={e=>updateLogoUrl(e.target.value)} />
        </Stack>
      </Paper>
    </Box>
  )
}
