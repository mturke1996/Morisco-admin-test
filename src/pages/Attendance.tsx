import React, { useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { supabase } from '../services/supabaseClient'
import dayjs from 'dayjs'

export default function Attendance(){
  const [emps,setEmps]=useState<any[]>([])
  const [empId,setEmpId]=useState<string>('')
  const [manualOpen,setManualOpen]=useState(false)
  const [form,setForm]=useState({ date: dayjs().format('YYYY-MM-DD'), check_in:'', check_out:'' })

  useEffect(()=>{ load() },[])
  async function load(){
    const { data } = await supabase.from('employees').select('id,name').order('name')
    setEmps(data||[])
  }

  async function checkInNow(){
    if(!empId) return alert('اختر موظفاً')
    const today = dayjs().format('YYYY-MM-DD')
    const now = dayjs().toISOString()
    const up = await supabase.from('timesheets').upsert({ employee_id: empId, date: today, check_in: now }, { onConflict: 'employee_id,date' })
    if(up.error) return alert(up.error.message)
    alert('تم تسجيل الحضور')
  }

  async function checkOutNow(){
    if(!empId) return alert('اختر موظفاً')
    const today = dayjs().format('YYYY-MM-DD')
    const now = dayjs().toISOString()
    const up = await supabase.from('timesheets').update({ check_out: now }).eq('employee_id', empId).eq('date', today)
    if(up.error) return alert(up.error.message)
    alert('تم تسجيل الانصراف')
  }

  async function saveManual(){
    if(!empId) return alert('اختر موظفاً')
    const payload = {
  employee_id: empId,
  date: form.date,
  check_in: form.check_in ? dayjs(`${form.date} ${form.check_in}`).toISOString() : null,
  check_out: form.check_out ? dayjs(`${form.date} ${form.check_out}`).toISOString() : null,
}
    const up = await supabase.from('timesheets').upsert(payload, { onConflict: 'employee_id,date' })
    if(up.error) return alert(up.error.message)
    setManualOpen(false)
    alert('تم الحفظ')
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb:2 }}>الحضور والإنصراف</Typography>
      <Stack direction="row" spacing={2} sx={{ mb:2 }}>
        <TextField select label="اختر موظف" value={empId} onChange={e=>setEmpId(e.target.value)} sx={{ minWidth: 220 }}>
          {emps.map(e=><MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
        </TextField>
        <Button variant="contained" onClick={checkInNow}>حضور الآن</Button>
        <Button variant="outlined" onClick={checkOutNow}>انصراف الآن</Button>
        <Button variant="text" onClick={()=>setManualOpen(true)}>إدخال يدوي</Button>
      </Stack>

      <Dialog open={manualOpen} onClose={()=>setManualOpen(false)} fullWidth>
        <DialogTitle>إدخال يدوي</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt:1 }}>
            <TextField label="التاريخ (YYYY-MM-DD)" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
            <TextField label="وقت الحضور (HH:mm)" value={form.check_in} onChange={e=>setForm({...form, check_in:e.target.value})} />
            <TextField label="وقت الانصراف (HH:mm)" value={form.check_out} onChange={e=>setForm({...form, check_out:e.target.value})} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setManualOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={saveManual}>حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
