import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, Paper, Stack, TextField, Typography, MenuItem } from '@mui/material'
import dayjs from 'dayjs'
import { supabase } from '../services/supabaseClient'
import { exportElementToPDF } from '../services/pdf'

export default function Reports(){
  const [emps,setEmps]=useState<any[]>([])
  const [empId,setEmpId]=useState<string>('')
  const [from,setFrom]=useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [to,setTo]=useState(dayjs().format('YYYY-MM-DD'))
  const [rows,setRows]=useState<any[]>([])
  const [emp,setEmp]=useState<any>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{ load() },[])
  async function load(){
    const { data } = await supabase.from('employees').select('id,name,daily_rate').order('name')
    setEmps(data||[])
  }

  async function run(){
    if(!empId) return
    const emp = emps.find(e=>e.id===empId); setEmp(emp)
    const t = await supabase.from('timesheets').select('*').eq('employee_id', empId).gte('date', from).lte('date', to).order('date')
    const w = await supabase.from('withdrawals').select('*').eq('employee_id', empId).gte('date', from).lte('date', to)
    const mapW:Record<string,number> = {}
    ;(w.data||[]).forEach((x:any)=>{ mapW[x.date]=(mapW[x.date]||0)+(x.amount||0) })
    setRows((t.data||[]).map((r:any)=>({ ...r, withdraw: mapW[r.date]||0 })))
  }

  const days = rows.filter(r=>r.check_in && r.check_out).length
  const totalWithdraw = (rows||[]).reduce((a,b)=>a+(b.withdraw||0),0)
  const totalEarn = days * (emp?.daily_rate||0)
  const balance = totalEarn - totalWithdraw

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb:2 }}>
        <Typography variant="h5">التقارير</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" disabled={!rows.length} onClick={()=>printRef.current && exportElementToPDF(printRef.current, 'employee-report.pdf')}>طباعة تقرير</Button>
          <Button variant="contained" onClick={run}>عرض</Button>
        </Stack>
      </Stack>

      <Paper sx={{ p:2, mb:2 }}>
        <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
          <TextField select label="اختر موظف" value={empId} onChange={e=>setEmpId(e.target.value)} sx={{ minWidth: 220 }}>
            {emps.map(e=><MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
          </TextField>
          <TextField label="من" value={from} onChange={e=>setFrom(e.target.value)} />
          <TextField label="إلى" value={to} onChange={e=>setTo(e.target.value)} />
        </Stack>
      </Paper>

      <Box ref={printRef}>
        <Paper sx={{ p:2 }}>
          <Typography variant="h6" sx={{ mb:1 }}>تقرير: {emp?.name||'-'}</Typography>
          <Box sx={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr><th>التاريخ</th><th>حضور</th><th>انصراف</th><th>ساعات</th><th>سحب</th><th>اليومية</th></tr>
              </thead>
              <tbody>
                {rows.map(r=>{
                  const hours = r.check_in && r.check_out ? (dayjs(r.check_out).diff(dayjs(r.check_in),'minute')/60).toFixed(2) : '-'
                  return <tr key={r.id}><td>{r.date}</td><td>{r.check_in?dayjs(r.check_in).format('HH:mm'):'-'}</td><td>{r.check_out?dayjs(r.check_out).format('HH:mm'):'-'}</td><td>{hours}</td><td>{r.withdraw}</td><td>{emp?.daily_rate||0}</td></tr>
                })}
              </tbody>
              <tfoot>
                <tr><td colSpan={4}></td><td><b>إجمالي السحب</b></td><td>{totalWithdraw}</td></tr>
                <tr><td colSpan={4}></td><td><b>أيام العمل</b></td><td>{days}</td></tr>
                <tr><td colSpan={4}></td><td><b>إجمالي المستحق</b></td><td>{totalEarn}</td></tr>
                <tr><td colSpan={4}></td><td><b>الرصيد</b></td><td><b>{balance}</b></td></tr>
              </tfoot>
            </table>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}
