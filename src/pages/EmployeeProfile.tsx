import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { Box, Button, Grid2 as Grid, Paper, Stack, TextField, Typography, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import dayjs from 'dayjs'
import { exportElementToPDF } from '../services/pdf'

export default function EmployeeProfile(){
  const { id } = useParams()
  const [emp,setEmp]=useState<any>(null)
  const [timesheets,setTimesheets]=useState<any[]>([])
  const [withdrawals,setWithdrawals]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [wForm,setWForm]=useState({ amount:0, note:'' })
  const [img,setImg]=useState<File|null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{ load() },[id])

  async function load(){
    const e = await supabase.from('employees').select('*').eq('id', id).single()
    setEmp(e.data)
    const t = await supabase.from('timesheets').select('*').eq('employee_id', id).order('date',{ascending:false})
    setTimesheets(t.data||[])
    const w = await supabase.from('withdrawals').select('*').eq('employee_id', id).order('date',{ascending:false})
    setWithdrawals(w.data||[])
  }

  async function addWithdraw(){
    const ins = await supabase.from('withdrawals').insert({ employee_id: id, amount: wForm.amount, note: wForm.note, date: dayjs().format('YYYY-MM-DD') })
    if(ins.error) return alert(ins.error.message)
    setOpen(false); setWForm({ amount:0, note:''}); load()
  }

  async function updatePhoto(){
    if(!img) return
    const ext = img.name.split('.').pop()
    const fileName = `${id}.${ext}`
    const up = await supabase.storage.from('employee-photos').upload(fileName, img, { upsert: true })
    if(up.error) return alert(up.error.message)
    const pub = supabase.storage.from('employee-photos').getPublicUrl(fileName)
    await supabase.from('employees').update({ image_url: pub.data.publicUrl }).eq('id', id)
    setImg(null); load()
  }

  const totalDays = timesheets.filter(t=>t.check_in && t.check_out).length
  const totalWithdrawn = withdrawals.reduce((a,b)=>a+(b.amount||0),0)
  const earned = totalDays * (emp?.daily_rate||0)
  const balance = earned - totalWithdrawn

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb:2 }}>
        <Typography variant="h5">ملف الموظف</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={()=>setOpen(true)}>تسجيل سحب</Button>
          <Button variant="contained" onClick={()=>printRef.current && exportElementToPDF(printRef.current, `report-${emp?.name}.pdf`)}>طباعة تقرير</Button>
        </Stack>
      </Stack>

      <Box ref={printRef}>
        <Paper sx={{ p:2, mb:2 }}>
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={emp?.image_url} sx={{ width:72, height:72 }} />
              <Box>
                <Typography variant="h6">{emp?.name}</Typography>
                <Typography color="text.secondary">{emp?.phone}</Typography>
              </Box>
            </Stack>
            <Stack>
              <Typography>اليومية: {emp?.daily_rate}</Typography>
              <Typography>أيام العمل: {totalDays}</Typography>
            </Stack>
            <Stack>
              <Typography>المسحوبات: {totalWithdrawn}</Typography>
              <Typography fontWeight={700}>الرصيد: {balance}</Typography>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p:2 }}>
          <Typography fontWeight={600} sx={{ mb:1 }}>سجل الأيام</Typography>
          <Box sx={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr><th>التاريخ</th><th>حضور</th><th>انصراف</th><th>ساعات</th><th>أجر اليوم</th></tr>
              </thead>
              <tbody>
                {timesheets.map(t=>{
                  const hours = t.check_in && t.check_out ? (dayjs(t.check_out).diff(dayjs(t.check_in),'minute')/60).toFixed(2) : '-'
                  return (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.check_in? dayjs(t.check_in).format('HH:mm'):'-'}</td>
                      <td>{t.check_out? dayjs(t.check_out).format('HH:mm'):'-'}</td>
                      <td>{hours}</td>
                      <td>{emp?.daily_rate || 0}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Box>
        </Paper>
      </Box>

      <Paper sx={{ p:2, mt:2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField type="file" inputProps={{ accept:'image/*' }} onChange={(e:any)=>setImg(e.target.files?.[0]??null)} />
          <Button onClick={updatePhoto}>رفع صورة</Button>
        </Stack>
      </Paper>

      <Dialog open={open} onClose={()=>setOpen(false)} fullWidth>
        <DialogTitle>تسجيل سحب</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt:1 }}>
            <TextField label="المبلغ" type="number" value={wForm.amount} onChange={e=>setWForm({...wForm, amount:+e.target.value})} />
            <TextField label="ملاحظة" value={wForm.note} onChange={e=>setWForm({...wForm, note:e.target.value})} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>إلغاء</Button>
          <Button variant="contained" onClick={addWithdraw}>حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
