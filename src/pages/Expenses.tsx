import React, { useEffect, useState } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { supabase } from '../services/supabaseClient'
import dayjs from 'dayjs'

export default function Expenses(){
  const [list,setList]=useState<any[]>([])
  const [form,setForm]=useState({ amount:0, description:'', date: dayjs().format('YYYY-MM-DD') })

  useEffect(()=>{ load() },[])
  async function load(){
    const { data } = await supabase.from('expenses').select('*').order('date',{ascending:false})
    setList(data||[])
  }
  async function addItem(){
    const ins = await supabase.from('expenses').insert(form)
    if(ins.error) return alert(ins.error.message)
    setForm({ amount:0, description:'', date: dayjs().format('YYYY-MM-DD') })
    load()
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb:2 }}>المصروفات</Typography>
      <Paper sx={{ p:2, mb:2 }}>
        <Stack spacing={2}>
          <TextField label="المبلغ" type="number" value={form.amount} onChange={e=>setForm({...form, amount:+e.target.value})} />
          <TextField label="الوصف" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
          <TextField label="التاريخ" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
          <Button variant="contained" onClick={addItem}>حفظ</Button>
        </Stack>
      </Paper>
      <Paper sx={{ p:2 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr><th>التاريخ</th><th>الوصف</th><th>المبلغ</th></tr>
          </thead>
          <tbody>
            {list.map(i=> <tr key={i.id}><td>{i.date}</td><td>{i.description}</td><td>{i.amount}</td></tr>)}
          </tbody>
        </table>
      </Paper>
    </Box>
  )
}
