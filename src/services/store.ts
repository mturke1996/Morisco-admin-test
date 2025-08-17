import { create } from 'zustand'
import { supabase } from './supabaseClient'

type AuthState = {
  session: any
  user: any
  brand: string
  logoUrl: string
  init: () => Promise<void>
  signIn: (email:string,password:string) => Promise<void>
  signUp: (email:string,password:string) => Promise<void>
  signOut: () => Promise<void>
  updateBrand: (b:string)=>void
  updateLogoUrl: (u:string)=>void
}

const LS = { brand:'brand', logo:'logo' }

export const useAuth = create<AuthState>((set, get)=>({
  session: null,
  user: null,
  brand: localStorage.getItem(LS.brand) || (import.meta.env.VITE_BRAND_NAME ?? 'Morisco Café'),
  logoUrl: localStorage.getItem(LS.logo) || (import.meta.env.VITE_BRAND_LOGO_URL ?? ''),
  init: async ()=>{
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null })
    supabase.auth.onAuthStateChange((_e, s)=> set({ session: s, user: s?.user ?? null }))
  },
  signIn: async (email,password)=>{
    const { error } = await supabase.auth.signInWithPassword({ email,password })
    if(error) throw error
  },
  signUp: async (email,password)=>{
    const { error } = await supabase.auth.signUp({ email,password })
    if(error) throw error
  },
  signOut: async ()=>{
    await supabase.auth.signOut()
    set({ session:null, user:null })
    location.href='/login'
  },
  updateBrand: (b)=>{ localStorage.setItem(LS.brand,b); set({ brand:b }) },
  updateLogoUrl: (u)=>{ localStorage.setItem(LS.logo,u); set({ logoUrl:u }) },
}))

useAuth.getState().init()
