import React, { useEffect, useState } from 'react'
import { Box, Grid2 as Grid, Paper, Stack, Typography } from '@mui/material'
import { supabase } from '../services/supabaseClient'
import dayjs from 'dayjs'

export default function Dashboard(){
  const [stats,setStats]=useState({ employees:0, salesToday:0, salesMonth:0 })
  useEffect(()=>{ load() },[])

  async function load(){
    const { count: empCount } = await supabase.from('employees').select('*', { count:'exact', head:true })
    const today = dayjs().format('YYYY-MM-DD')
    const monthStart = dayjs().startOf('month').format('YYYY-MM-DD')
    const { data: ordersToday } = await supabase.from('orders').select('total,created_at').gte('created_at', today).lt('created_at', dayjs().add(1,'day').format('YYYY-MM-DD'))
    const { data: ordersMonth } = await supabase.from('orders').select('total,created_at').gte('created_at', monthStart)
    const salesToday = (ordersToday||[]).reduce((a,b)=>a+(b.total||0),0)
    const salesMonth = (ordersMonth||[]).reduce((a,b)=>a+(b.total||0),0)
    setStats({ employees: empCount||0, salesToday, salesMonth })
  }

  const CardStat = ({title, value}:{title:string, value:number}) => (
    <Paper elevation={0} sx={{ p:2, border:'1px solid #eee' }}>
      <Stack>
        <Typography color="text.secondary">{title}</Typography>
        <Typography variant="h4">{value.toFixed(2)}</Typography>
      </Stack>
    </Paper>
  )

  return (
    <Box sx={{ p:1 }}>
      <Typography variant="h5" sx={{ mb:2 }}>لوحة التحكم</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs:12, md:4 }}><CardStat title="عدد الموظفين" value={stats.employees} /></Grid>
        <Grid size={{ xs:12, md:4 }}><CardStat title="مبيعات اليوم" value={stats.salesToday} /></Grid>
        <Grid size={{ xs:12, md:4 }}><CardStat title="مبيعات الشهر" value={stats.salesMonth} /></Grid>
      </Grid>
    </Box>
  )
}
