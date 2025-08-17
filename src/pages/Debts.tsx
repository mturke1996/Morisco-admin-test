import React, { useEffect, useState } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { supabase } from '../services/supabaseClient'
import dayjs from 'dayjs'

export default function Debts(){
  const [list,setList]=useState<any[]>([])
  const [form,setForm]=useState({ client_name:'', amount:0, paid:0, date: dayjs().format('YYYY-MM-DD') })

  useEffect(()=>{ load() },[])
  async function load(){
    const { data } = await supabase.from('debts').select('*').order('date',{ascending:false})
    setList(data||[])
  }
  async function addItem(){
    const ins = await supabase.from('debts').insert(form)
    if(ins.error) return alert(ins.error.message)
    setForm({ client_name:'', amount:0, paid:0, date: dayjs().format('YYYY-MM-DD') })
    load()
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb:2 }}>ديون العملاء</Typography>
      <Paper sx={{ p:2, mb:2 }}>
        <Stack spacing={2}>
          <TextField label="اسم العميل" value={form.client_name} onChange={e=>setForm({...form, client_name:e.target.value})} />
          <TextField label="القيمة" type="number" value={form.amount} onChange={e=>setForm({...form, amount:+e.target.value})} />
          <TextField label="المدفوع" type="number" value={form.paid} onChange={e=>setForm({...form, paid:+e.target.value})} />
          <TextField label="التاريخ" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
          <Button variant="contained" onClick={addItem}>حفظ</Button>
        </Stack>
      </Paper>
      <Paper sx={{ p:2 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr><th>التاريخ</th><th>العميل</th><th>القيمة</th><th>المدفوع</th><th>المتبقي</th></tr>
          </thead>
          <tbody>
            {list.map(i=>{
              const remaining = (i.amount||0) - (i.paid||0)
              return <tr key={i.id}><td>{i.date}</td><td>{i.client_name}</td><td>{i.amount}</td><td>{i.paid}</td><td>{remaining}</td></tr>
            })}
          </tbody>
        </table>
      </Paper>
    </Box>
  )
}
