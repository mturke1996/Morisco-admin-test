import React, { useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2 as Grid, Paper, Stack, TextField, Typography, Avatar } from '@mui/material'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'

type EmpForm = { name:string; phone:string; daily_rate:number; image?:File|null }

export default function Employees(){
  const [items,setItems]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [form,setForm]=useState<EmpForm>({ name:'', phone:'', daily_rate:0, image:null })
  const nav = useNavigate()

  useEffect(()=>{ load() },[])

  async function load(){
    const { data } = await supabase.from('employees').select('*').order('created_at',{ascending:false})
    setItems(data||[])
  }

  async function onSubmit(){
    try{
      let image_url:string|undefined
      const { data: inserted, error } = await supabase.from('employees').insert({ name: form.name, phone: form.phone, daily_rate: form.daily_rate }).select().single()
      if(error) throw error
      if(form.image){
        const ext = form.image.name.split('.').pop()
        const fileName = `${inserted.id}.${ext}`
        const up = await supabase.storage.from('employee-photos').upload(fileName, form.image, { upsert: true })
        if(up.error) throw up.error
        const pub = supabase.storage.from('employee-photos').getPublicUrl(fileName)
        image_url = pub.data.publicUrl
        await supabase.from('employees').update({ image_url }).eq('id', inserted.id)
      }
      setOpen(false); setForm({ name:'', phone:'', daily_rate:0, image:null }); load()
    }catch(err:any){ alert(err.message) }
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb:2 }}>
        <Typography variant="h5">الموظفون</Typography>
        <Button variant="contained" onClick={()=>setOpen(true)}>إضافة موظف</Button>
      </Stack>
      <Grid container spacing={2}>
        {items.map(emp=>(
          <Grid size={{ xs:12, sm:6, md:4 }} key={emp.id}>
            <Paper onClick={()=>nav(`/employees/${emp.id}`)} sx={{ p:2, display:'flex', gap:2, alignItems:'center', cursor:'pointer', border:'1px solid #eee' }}>
              <Avatar src={emp.image_url} alt={emp.name} sx={{ width:64, height:64 }} />
              <Box>
                <Typography fontWeight={600}>{emp.name}</Typography>
                <Typography color="text.secondary" fontSize={14}>{emp.phone}</Typography>
                <Typography fontSize={14}>اليومية: {emp.daily_rate}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={()=>setOpen(false)} fullWidth>
        <DialogTitle>إضافة موظف جديد</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt:1 }}>
            <TextField label="الاسم" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            <TextField label="الهاتف" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
            <TextField label="اليومية" type="number" value={form.daily_rate} onChange={e=>setForm({...form, daily_rate:+e.target.value})} />
            <TextField type="file" inputProps={{ accept:'image/*' }} onChange={(e:any)=>setForm({...form, image:e.target.files?.[0]})} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>إلغاء</Button>
          <Button onClick={onSubmit} variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
