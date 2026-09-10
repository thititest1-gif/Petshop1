import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import liff from '@line/liff'

const LIFF_ID = String(import.meta.env.VITE_LIFF_ID || '').trim()

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState('กำลังเตรียมระบบ...')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const initLiff = async () => {
      try {
        if (!LIFF_ID) {
          setError('ยังไม่ได้ตั้งค่า LIFF ID')
          setStatus('รอการตั้งค่า LIFF')
          return
        }

        await liff.init({ liffId: LIFF_ID })
        if (cancelled) return
        setReady(true)

        if (!liff.isLoggedIn()) {
          setStatus('พร้อมเข้าสู่ระบบด้วย LINE')
          return
        }

        const profile = await liff.getProfile()
        if (cancelled) return

        const existing = JSON.parse(localStorage.getItem('petshop_user') || '{}')
        const user = {
          ...existing,
          lineUserId: profile.userId,
          name: profile.displayName,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl || existing.pictureUrl || '',
          statusMessage: profile.statusMessage || '',
          loggedIn: true,
          loginProvider: 'line',
        }

        localStorage.setItem('petshop_user', JSON.stringify(user))
        localStorage.setItem('petshop_user_auth', 'true')
        navigate(location.state?.from || '/home', { replace: true })
      } catch (err) {
        console.error('LIFF initialization/login failed:', err)
        if (!cancelled) {
          const code = err?.code ? ` [${err.code}]` : ''
          const detail = err?.message ? `: ${err.message}` : ''
          setError(`เชื่อมต่อ LINE ไม่สำเร็จ${code}${detail}`)
          setStatus('เข้าสู่ระบบไม่สำเร็จ')
        }
      }
    }

    initLiff()
    return () => { cancelled = true }
  }, [navigate, location.state?.from])

  const loginWithLine = () => {
    if (!ready || !LIFF_ID) return
    setError('')
    setStatus('กำลังเปิด LINE...')
    if (!liff.isLoggedIn()) liff.login()
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#fff8f2] px-4 py-6 text-gray-900 sm:px-6">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full bg-orange-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 size-72 rounded-full bg-orange-100 blur-3xl" />
      <div className="pointer-events-none absolute right-5 top-8 rotate-12 text-orange-200/70">
        <i className="fa-solid fa-paw text-4xl" />
      </div>
      <div className="pointer-events-none absolute bottom-20 left-4 -rotate-12 text-orange-100">
        <i className="fa-solid fa-paw text-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[430px] items-center justify-center">
        <section className="w-full overflow-hidden rounded-[30px] border border-orange-100 bg-white shadow-[0_18px_55px_rgba(180,83,9,0.12)]">
          {/* Mobile hero */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 px-6 pb-9 pt-8 text-white">
            <div className="absolute -right-10 -top-12 size-36 rounded-full border-[22px] border-white/10" />
            <div className="absolute -bottom-14 -left-10 size-32 rounded-full border-[18px] border-white/10" />

            <div className="relative flex items-center justify-center">
              <div className="grid size-[72px] place-items-center rounded-[24px] bg-white shadow-xl shadow-orange-700/20">
                <i className="fa-solid fa-paw text-[34px] text-orange-500" />
              </div>
            </div>
            <h1 className="relative mt-5 text-center text-[28px] font-black tracking-tight">Pet Shop</h1>
            <p className="relative mt-1 text-center text-sm font-medium text-orange-50">ทุกความสุขของสัตว์เลี้ยง อยู่ใกล้แค่ปลายนิ้ว</p>
          </div>

          <div className="px-5 pb-6 pt-6 sm:px-7">
            <div className="text-center">
              <h2 className="text-xl font-extrabold">ยินดีต้อนรับกลับมา 🐾</h2>
              <p className="mt-1 text-sm text-gray-500">เข้าสู่ระบบเพื่อเริ่มช้อปปิ้งและดูแลสัตว์เลี้ยงของคุณ</p>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                <i className="fa-solid fa-circle-exclamation mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={loginWithLine}
              disabled={!ready}
              className="mt-6 flex h-[54px] w-full items-center justify-center rounded-2xl bg-[#06C755] text-[15px] font-extrabold text-white shadow-[0_10px_24px_rgba(6,199,85,0.2)] transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className="fa-brands fa-line mr-2.5 text-xl" />
              {ready ? 'เข้าสู่ระบบด้วย LINE' : 'กำลังเตรียม LINE...'}
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[11px] font-medium text-gray-400">หรือ</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex h-[50px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 transition active:scale-[.98] hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              <i className="fa-solid fa-house mr-2" />
              เข้าใช้งานแบบ Guest
            </button>

            <button
              type="button"
              onClick={() => navigate('/home/admin/login')}
              className="mt-3 flex h-[46px] w-full items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-xs font-bold text-violet-700 transition active:scale-[.98] hover:bg-violet-100"
            >
              <i className="fa-solid fa-shield-halved mr-2" />
              เข้าสู่ระบบผู้ดูแลระบบ
            </button>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
              <i className="fa-solid fa-lock" />
              <span>{status}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
