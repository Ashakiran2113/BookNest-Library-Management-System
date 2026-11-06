import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BellRing,
  BookCopy,
  BookOpenText,
  BookText,
  CalendarClock,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  Globe,
  GraduationCap,
  LibraryBig,
  Menu,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import {
  fetchBookCatalog,
  fetchFeaturedBooks,
  fetchPublicStats,
  fetchStudentDashboard,
  getCurrentUser,
  borrowBookRequest,
  loginRequest,
  registerRequest,
  resetPasswordRequest,
  forgotPasswordRequest,
} from './services/libraryApi'

const STORAGE_KEY = 'booknest-auth'
const AuthContext = createContext(null)

const navItems = [
  { label: 'Home', href: '/#top' },
  { label: 'Explore Books', href: '/books' },
  { label: 'Features', href: '/#features' },
  { label: 'About Us', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

const featureList = [
  {
    icon: Sparkles,
    title: 'Smart Book Discovery',
    description: 'Find the right resources faster with intelligent recommendations and category discovery.',
  },
  {
    icon: BookOpenText,
    title: 'Easy Book Borrowing',
    description: 'Streamlined borrowing workflows make checking out titles simple and stress-free.',
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Availability',
    description: 'Students stay informed with live status updates on what is available in the library.',
  },
  {
    icon: BookText,
    title: 'Digital Borrowing History',
    description: 'Track borrowed books, reading progress, and past access without paperwork.',
  },
  {
    icon: CalendarClock,
    title: 'Automated Due-Date Tracking',
    description: 'Never miss a due date with timely reminders and clear borrowing timelines.',
  },
  {
    icon: WalletCards,
    title: 'Transparent Fine Management',
    description: 'Stay in control of dues and charges with a clear, transparent financial view.',
  },
]

const howItWorks = [
  { step: '01', title: 'Create Your Account', description: 'Register in minutes and personalize your reading journey.' },
  { step: '02', title: 'Explore and Discover Books', description: 'Browse by category, topic, and reading goals to find your next read.' },
  { step: '03', title: 'Borrow Books and Track Your Reading', description: 'Manage loans, due dates, and reading history from one smart dashboard.' },
]

const sampleTestimonials = [
  {
    name: 'Aarav Sharma',
    role: 'B.Tech Computer Science',
    quote: 'The platform feels premium and easy to use. I can discover books in minutes and keep my reading goals on track.',
  },
  {
    name: 'Meera Nair',
    role: 'B.Sc Mathematics',
    quote: 'The digital borrowing history and due-date reminders make library access effortless and stress-free.',
  },
  {
    name: 'Kabir Singh',
    role: 'MBA Student',
    quote: 'It gives the library a modern, organized experience without losing the trust and depth of traditional learning.',
  },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

const defaultBorrowedBooks = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Personal Development',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    progress: 72,
    dueDate: '2026-11-18',
    pagesRead: 180,
    totalPages: 320,
  },
  {
    id: 'deep-work',
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Productivity',
    cover: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=80',
    progress: 36,
    dueDate: '2026-11-22',
    pagesRead: 94,
    totalPages: 260,
  },
  {
    id: 'clean-code',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Technology',
    cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80',
    progress: 58,
    dueDate: '2026-11-16',
    pagesRead: 140,
    totalPages: 240,
  },
]

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [borrowedBooks, setBorrowedBooks] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`${STORAGE_KEY}-books`) || 'null')
      return Array.isArray(stored) && stored.length ? stored : defaultBorrowedBooks
    } catch {
      return defaultBorrowedBooks
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  useEffect(() => {
    const hydrateUser = async () => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (!saved?.token) return

      try {
        const response = await getCurrentUser()
        const authenticatedUser = response?.user || response
        setUser({
          ...authenticatedUser,
          token: saved.token,
          role: authenticatedUser.role_name || authenticatedUser.role || saved.role,
          name: authenticatedUser.full_name || authenticatedUser.name || saved.name,
          email: authenticatedUser.email || saved.email,
        })
      } catch {
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    hydrateUser()
  }, [])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-books`, JSON.stringify(borrowedBooks))
  }, [borrowedBooks])

  const login = async ({ email, password, role }) => {
    const response = await loginRequest({ email, password, role })

    const authenticatedUser = response?.user || response
    const userState = {
      ...authenticatedUser,
      id: authenticatedUser.id || authenticatedUser.user_id || response.email,
      token: response.token,
      name: authenticatedUser.full_name || authenticatedUser.name || response.name,
      role: authenticatedUser.role_name || authenticatedUser.role || response.role || role,
      email: authenticatedUser.email || response.email || email,
    }
    setUser(userState)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userState))
    return response
  }

  const register = async (form) => {
    const response = await registerRequest(form)

    const authenticatedUser = response?.user || response
    const userState = {
      ...authenticatedUser,
      id: authenticatedUser.id || authenticatedUser.user_id || response.email,
      token: response.token,
      name: authenticatedUser.full_name || authenticatedUser.name || response.name,
      role: authenticatedUser.role_name || authenticatedUser.role || response.role || 'student',
      email: authenticatedUser.email || response.email || form.email,
    }
    setUser(userState)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userState))
    return response
  }

  const logout = () => {
    setUser(null)
    setBorrowedBooks(defaultBorrowedBooks)
    localStorage.removeItem(STORAGE_KEY)
  }

  const borrowBook = async (book) => {
    try {
      await borrowBookRequest(book.id)
    } catch (error) {
      throw error
    }

    setBorrowedBooks((current) => {
      if (current.some((item) => item.id === book.id)) {
        return current
      }

      return [
        {
          id: book.id,
          title: book.title,
          author: book.author,
          category: book.category,
          cover: book.cover,
          progress: 12,
          dueDate: '2026-11-27',
          pagesRead: 32,
          totalPages: 280,
        },
        ...current,
      ]
    })
  }

  const syncBorrowedBooks = async () => {
    const token = user?.token || JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')?.token
    if (!token) return

    try {
      const response = await fetchStudentDashboard()
      const loans = response?.loans || response?.data?.loans || []
      const normalized = loans.map((loan) => ({
        id: loan.bookId || loan.id,
        title: loan.title,
        author: loan.author,
        category: loan.category,
        cover: loan.cover || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
        progress: 35,
        dueDate: loan.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
        pagesRead: 80,
        totalPages: 260,
      }))
      if (normalized.length) {
        setBorrowedBooks(normalized)
      }
    } catch {
      // Keep current in-memory book list when the backend is unavailable.
    }
  }

  const updateReadingProgress = (bookId, progressValue) => {
    setBorrowedBooks((current) =>
      current.map((book) =>
        book.id === bookId
          ? {
              ...book,
              progress: Math.min(100, Math.max(0, progressValue)),
              pagesRead: Math.round((Math.min(100, Math.max(0, progressValue)) / 100) * book.totalPages),
            }
          : book,
      ),
    )
  }

  const value = useMemo(
    () => ({ user, borrowedBooks, login, register, logout, borrowBook, updateReadingProgress, syncBorrowedBooks }),
    [borrowedBooks, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
  }

  return children
}

function AnimatedCounter({ value, suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value)
      return undefined
    }

    let rafId
    const startTime = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(value * eased))

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [duration, reduceMotion, value])

  return <span>{display.toLocaleString()}{suffix}</span>
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 shadow-[0_8px_32px_rgba(20,43,74,0.08)] backdrop-blur-xl' : 'bg-transparent'}`}>
      <div className="section-shell flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3" aria-label="BookNest home">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#142b4a] text-white shadow-[0_10px_30px_rgba(20,43,74,0.2)]">
            <BookOpenText className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-[-0.06em] text-[#142b4a]">BookNest</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative text-sm font-medium text-slate-700 transition hover:text-[#142b4a]"
            >
              {item.label}
              <span className="absolute -bottom-2 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-[#356ae6] transition-transform duration-200 hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#356ae6] hover:text-[#356ae6]">
                Dashboard
              </Link>
              <button type="button" onClick={logout} className="rounded-full bg-[#142b4a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#203a67]">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#356ae6] hover:text-[#356ae6]">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-[#142b4a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#203a67]">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-[#142b4a] shadow-sm lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white/95 px-4 py-4 shadow-xl lg:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-[#142b4a]">
                {item.label}
              </a>
            ))}
            {!user && (
              <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3">
                <Link to="/login" onClick={() => setOpen(false)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="rounded-full bg-[#142b4a] px-4 py-2 text-center text-sm font-semibold text-white">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function HeroSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="top" className="section-shell relative overflow-hidden pb-20 pt-8 md:pb-24 lg:pt-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-[#dfeeff] blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#356ae6]/10 blur-3xl" />
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dfeeff] bg-[#f3f7ff] px-3 py-2 text-sm font-semibold text-[#356ae6]">
            <Sparkles className="h-4 w-4" />
            Smart digital library experience
          </div>
          <h1 className="text-4xl font-black leading-[1.04] tracking-[-0.08em] text-[#142b4a] sm:text-5xl lg:text-7xl">
            Discover a World of Knowledge.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-slate-600">
            Your gateway to endless learning. Explore books, manage your reading journey, and experience a smarter digital library.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link to="/books" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#142b4a] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(20,43,74,0.2)] transition hover:-translate-y-0.5 hover:bg-[#203a67]">
              Explore Books
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7e5ff] bg-white px-6 py-3.5 text-sm font-semibold text-[#142b4a] transition hover:-translate-y-0.5 hover:border-[#356ae6] hover:text-[#356ae6]">
              Get Started
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-8 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#356ae6]" /> Trusted access</div>
            <div className="flex items-center gap-2"><BellRing className="h-4 w-4 text-[#356ae6]" /> Smart reminders</div>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_top,_rgba(53,106,230,0.18),_transparent_45%)] blur-2xl" />
          <div className="glass-card relative overflow-hidden rounded-[32px] p-5 md:p-6">
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#dfeeff] to-transparent" />
            <div className="relative grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_12px_24px_rgba(20,43,74,0.08)]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Popular</span>
                    <span className="rounded-full bg-[#eaf1ff] px-2 py-1 text-[10px] font-semibold text-[#356ae6]">Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"
                      alt="Atomic Habits book cover"
                      className="h-20 w-16 rounded-xl object-cover shadow-md"
                      loading="eager"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-[#142b4a]">Atomic Habits</h3>
                      <p className="text-sm text-slate-500">James Clear</p>
                      <div className="mt-2 inline-flex items-center rounded-full bg-[#f3f7ff] px-2 py-1 text-[10px] font-semibold text-[#356ae6]">Personal Growth</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[22px] border border-slate-100 bg-[#f3f7ff] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <BookCopy className="h-4 w-4 text-[#356ae6]" />
                      <span className="text-[10px] font-semibold uppercase text-slate-400">New</span>
                    </div>
                    <div className="text-2xl font-black text-[#142b4a]">1.2k</div>
                    <div className="text-xs text-slate-500">Books added</div>
                  </div>
                  <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_12px_22px_rgba(20,43,74,0.05)]">
                    <div className="mb-2 flex items-center justify-between">
                      <GraduationCap className="h-4 w-4 text-[#356ae6]" />
                      <span className="text-[10px] font-semibold uppercase text-slate-400">Live</span>
                    </div>
                    <div className="text-2xl font-black text-[#142b4a]">4.3k</div>
                    <div className="text-xs text-slate-500">Active readers</div>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-0 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[#356ae6]/10 blur-2xl"
                />
                <div className="relative flex h-[330px] w-[240px] items-center justify-center rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_24px_54px_rgba(20,43,74,0.12)]">
                  <motion.div
                    animate={reduceMotion ? undefined : { rotate: [0, 2, -2, 0], y: [0, -8, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-5 top-8 flex h-20 w-16 items-center justify-center rounded-[16px] bg-[#f3f7ff] text-[#142b4a] shadow-md"
                  >
                    <LibraryBig className="h-8 w-8 text-[#356ae6]" />
                  </motion.div>
                  <motion.div
                    animate={reduceMotion ? undefined : { rotate: [0, -3, 3, 0], y: [0, 8, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute right-7 top-14 flex h-24 w-18 items-center justify-center rounded-[18px] bg-[#142b4a] p-3 text-white shadow-lg"
                  >
                    <BookText className="h-9 w-9" />
                  </motion.div>
                  <div className="relative mt-12 flex h-36 w-40 items-center justify-center rounded-[26px] border-2 border-dashed border-[#bcd0ff] bg-[#f8fbff]">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-[#bcd0ff]" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-[#bcd0ff]" />
                    <div className="absolute inset-0 rounded-[26px] bg-[radial-gradient(circle_at_center,_rgba(53,106,230,0.12),_transparent_45%)]" />
                    <BookOpenText className="relative h-12 w-12 text-[#356ae6]" />
                  </div>
                  <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-3 py-2 shadow-md backdrop-blur">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Read now</p>
                    <p className="mt-1 text-sm font-bold text-[#142b4a]">120+ books</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StatsSection() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const data = await fetchPublicStats()
        if (active) setStats(data)
      } catch (error) {
        console.error(error)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const items = [
    { label: 'Total Books', value: stats?.totalBooks ?? 0, suffix: '+' },
    { label: 'Registered Students', value: stats?.registeredStudents ?? 0, suffix: '+' },
    { label: 'Books Borrowed', value: stats?.booksBorrowed ?? 0, suffix: '+' },
    { label: 'Available Books', value: stats?.availableBooks ?? 0, suffix: '+' },
  ]

  return (
    <section id="stats" className="bg-[#f3f7ff] py-20">
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {items.map((item) => (
            <div key={item.label} className="glass-card rounded-[28px] p-6 text-center">
              <div className="text-3xl font-black tracking-[-0.08em] text-[#142b4a] md:text-4xl">
                {loading ? '—' : <AnimatedCounter value={item.value} suffix={item.suffix} />}
              </div>
              <p className="mt-3 text-sm font-medium text-slate-600">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FeaturedBooksSection() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await fetchFeaturedBooks()
        if (active) setBooks(data)
      } catch (error) {
        console.error(error)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <section id="explore-books" className="section-shell py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
      >
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#356ae6]">Featured Collection</p>
          <h2 className="section-title">Explore Your Next Favorite Book.</h2>
          <p className="section-copy mt-3 max-w-xl">Find something inspiring to read from our growing collection.</p>
        </div>
        <Link to="/books" className="inline-flex items-center gap-2 rounded-full border border-[#d7e5ff] bg-white px-5 py-3 text-sm font-semibold text-[#142b4a] transition hover:border-[#356ae6] hover:text-[#356ae6]">
          View All Books
          <ChevronRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-[28px] border border-slate-200 bg-slate-100 p-4">
              <div className="h-72 rounded-2xl bg-slate-200" />
              <div className="mt-4 h-5 w-1/2 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-1/3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book, index) => (
            <motion.article
              key={book.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_46px_rgba(20,43,74,0.05)] transition-all duration-300 hover:shadow-[0_24px_64px_rgba(20,43,74,0.08)]"
            >
              <div className="overflow-hidden rounded-[22px]">
                <img
                  src={book.cover}
                  alt={book.title}
                  loading="lazy"
                  className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#f3f7ff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#356ae6]">{book.category}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${book.availability === 'Available' ? 'bg-[#eafaf3] text-[#1d7b5b]' : 'bg-[#fff3e8] text-[#b46a00]'}`}>
                  {book.availability}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold tracking-[-0.05em] text-[#142b4a]">{book.title}</h3>
              <p className="mt-1 text-sm text-slate-500">by {book.author}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{book.category}</span>
                <Link to={`/books/${book.id}`} className="inline-flex items-center gap-2 rounded-full bg-[#142b4a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#203a67]">
                  View Details
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="bg-[#f3f7ff] py-20">
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#356ae6]">Platform Features</p>
          <h2 className="section-title">Everything You Need for a Smarter Library.</h2>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureList.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf1ff] text-[#356ae6]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold tracking-[-0.05em] text-[#142b4a]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="section-shell py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#356ae6]">How it works</p>
        <h2 className="section-title">Simplify reading from day one.</h2>
      </motion.div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {howItWorks.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="relative rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_46px_rgba(20,43,74,0.04)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#142b4a] text-sm font-black text-white">{step.step}</div>
              {index < howItWorks.length - 1 && <div className="hidden h-px w-12 bg-slate-200 lg:block" />}
            </div>
            <h3 className="text-2xl font-bold tracking-[-0.05em] text-[#142b4a]">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section id="about" className="bg-[#f3f7ff] py-20">
      <div className="section-shell grid items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#356ae6]">About BookNest</p>
          <h2 className="section-title">Making Knowledge Accessible to Everyone.</h2>
          <p className="mt-5 text-base leading-8 text-slate-600">
            BookNest brings the traditional library into a smarter digital format, making it easier for students and readers to explore collections, reserve books, track due dates, and stay engaged with learning. Our platform simplifies library operations through intuitive tools, real-time visibility, and a more welcoming reading experience.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-2xl font-black text-[#142b4a]">98%</p>
              <p className="text-xs text-slate-500">Student satisfaction</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-2xl font-black text-[#142b4a]">24/7</p>
              <p className="text-xs text-slate-500">Library access</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="glass-card relative overflow-hidden rounded-[32px] p-4">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
              alt="Students studying together in library"
              className="h-[420px] w-full rounded-[24px] object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-10 left-10 rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-lg">
              <div className="flex items-center gap-3">
                <CircleCheckBig className="h-7 w-7 rounded-full bg-[#eaf1ff] p-1 text-[#356ae6]" />
                <div>
                  <div className="text-sm font-semibold text-[#142b4a]">Library analytics</div>
                  <div className="text-xs text-slate-500">Updated in real time</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % sampleTestimonials.length)
    }, 4500)

    return () => clearInterval(timer)
  }, [])

  const active = sampleTestimonials[activeIndex]

  return (
    <section className="section-shell py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#356ae6]">Sample feedback</p>
        <h2 className="section-title">Student experiences that shine.</h2>
      </div>

      <motion.div
        key={active.name}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card mx-auto mt-10 max-w-4xl rounded-[30px] p-6 md:p-10"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dfeeff] text-lg font-black text-[#142b4a]">
              {active.name.split(' ').map((name) => name[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="text-lg font-bold text-[#142b4a]">{active.name}</div>
              <div className="text-sm text-slate-500">{active.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#356ae6]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={`${active.name}-${index}`} className="h-5 w-5 fill-current" />
            ))}
          </div>
        </div>

        <p className="mt-8 text-xl leading-9 text-slate-700 md:text-2xl">“{active.quote}”</p>

        <div className="mt-8 flex items-center justify-center gap-2">
          {sampleTestimonials.map((testimonial, index) => (
            <button
              key={testimonial.name}
              type="button"
              aria-label={`Show testimonial ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${activeIndex === index ? 'w-9 bg-[#356ae6]' : 'w-2.5 bg-[#d7e5ff]'}`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function FinalCtaSection() {
  return (
    <section className="section-shell py-20">
      <div className="relative overflow-hidden rounded-[36px] bg-[#142b4a] px-6 py-12 text-white shadow-[0_25px_80px_rgba(20,43,74,0.18)] md:px-10">
        <div className="absolute left-[-8%] top-[-12%] h-56 w-56 rounded-full bg-[#356ae6]/25 blur-3xl" />
        <div className="absolute right-[-6%] bottom-[-14%] h-60 w-60 rounded-full bg-[#7fb8ff]/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <BookOpenText className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-[-0.07em] md:text-5xl">Your Next Great Read Starts Here.</h2>
            <p className="mt-4 text-base text-slate-200 md:text-lg">Join our digital library and make every reading moment count.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/books" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#142b4a] transition hover:bg-slate-100">
              Explore Books
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white py-12">
      <div className="section-shell grid gap-8 lg:grid-cols-[1.2fr_0.9fr_0.9fr_0.7fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#142b4a] text-white">
              <BookOpenText className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-[-0.06em] text-[#142b4a]">BookNest</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">A premium digital library experience built to help readers discover, borrow, and enjoy knowledge with ease.</p>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Quick links</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><a href="/books" className="hover:text-[#142b4a]">Explore Books</a></li>
            <li><a href="/#about" className="hover:text-[#142b4a]">About Us</a></li>
            <li><a href="/#contact" className="hover:text-[#142b4a]">Contact</a></li>
            <li><a href="/login" className="hover:text-[#142b4a]">Login</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Explore</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><a href="/#features" className="hover:text-[#142b4a]">Features</a></li>
            <li><a href="/#stats" className="hover:text-[#142b4a]">Library Stats</a></li>
            <li><a href="/#explore-books" className="hover:text-[#142b4a]">Featured Reads</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">Follow</h3>
          <div className="mt-4 flex items-center gap-3">
            {[Globe, MessageCircle, Send].map((Icon, index) => (
              <a key={index} href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f7ff] text-[#142b4a] transition hover:bg-[#dfeeff]" aria-label="Social link">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="section-shell mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        © 2026 BookNest. All rights reserved.
      </div>
    </footer>
  )
}

function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturedBooksSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <TestimonialsSection />
      <FinalCtaSection />
      <Footer />
    </div>
  )
}

function CatalogPage() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, borrowBook, borrowedBooks } = useAuth()

  useEffect(() => {
    let active = true
    const loadBooks = async () => {
      try {
        const data = await fetchBookCatalog()
        if (active) setBooks(data)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadBooks()
    return () => {
      active = false
    }
  }, [])

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.category.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <Navbar />
      <section className="section-shell py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#356ae6]">Browse Collection</p>
            <h1 className="text-4xl font-black tracking-[-0.07em] text-[#142b4a]">Book Catalog</h1>
          </div>
          <label className="flex w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm md:w-auto">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Search by title, author, or category"
              aria-label="Search books"
            />
          </label>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-[28px] border border-slate-200 bg-slate-100 p-4">
                <div className="h-72 rounded-2xl bg-slate-200" />
                <div className="mt-4 h-5 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredBooks.map((book) => {
              const alreadyBorrowed = borrowedBooks.some((item) => item.id === book.id)

              return (
                <article key={book.id} className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_42px_rgba(20,43,74,0.05)]">
                  <img src={book.cover} alt={book.title} loading="lazy" className="h-72 w-full rounded-[22px] object-cover" />
                  <div className="mt-5 flex items-center justify-between">
                    <span className="rounded-full bg-[#f3f7ff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#356ae6]">{book.category}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${book.availability === 'Available' ? 'bg-[#eafaf3] text-[#1d7b5b]' : 'bg-[#fff3e8] text-[#b46a00]'}`}>
                      {book.availability}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-[#142b4a]">{book.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{book.author}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <Link to={`/books/${book.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#142b4a] transition hover:border-[#356ae6] hover:text-[#356ae6]">
                      View Details
                    </Link>
                    {user ? (
                      <button
                        type="button"
                        onClick={() => borrowBook(book)}
                        disabled={alreadyBorrowed}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#142b4a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#203a67] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {alreadyBorrowed ? 'Borrowed' : 'Borrow'}
                      </button>
                    ) : (
                      <Link to="/login" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#142b4a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#203a67]">
                        Login
                      </Link>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function BookDetailPage() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, borrowBook, borrowedBooks } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const books = await fetchBookCatalog()
        const target = books.find((item) => item.id === id)
        if (active) setBook(target || books[0])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="section-shell py-16">
          <div className="animate-pulse rounded-[26px] border border-slate-200 bg-slate-100 p-8">
            <div className="h-72 w-full rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return <Navigate to="/books" replace />
  }

  const alreadyBorrowed = borrowedBooks.some((item) => item.id === book.id)

  return (
    <div>
      <Navbar />
      <section className="section-shell py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_42px_rgba(20,43,74,0.05)]">
            <img src={book.cover} alt={book.title} className="h-full min-h-[420px] w-full rounded-[22px] object-cover" loading="lazy" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-full bg-[#f3f7ff] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#356ae6]">{book.category}</span>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.07em] text-[#142b4a] md:text-5xl">{book.title}</h1>
            <p className="mt-3 text-lg text-slate-500">by {book.author}</p>
            <div className="mt-5 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${book.availability === 'Available' ? 'bg-[#eafaf3] text-[#1d7b5b]' : 'bg-[#fff3e8] text-[#b46a00]'}`}>
                {book.availability}
              </span>
              <span className="text-sm text-slate-500">Digital library edition</span>
            </div>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">{book.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/books" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#142b4a] hover:border-[#356ae6] hover:text-[#356ae6]">
                Back to books
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    borrowBook(book)
                    navigate('/student/dashboard')
                  }}
                  disabled={alreadyBorrowed}
                  className="inline-flex items-center gap-2 rounded-full bg-[#142b4a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#203a67] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {alreadyBorrowed ? 'Already borrowed' : 'Borrow now'}
                </button>
              ) : (
                <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-[#142b4a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#203a67]">
                  Borrow now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'student' })
  const [error, setError] = useState('')
  const [resetState, setResetState] = useState({ mode: 'login', email: '', token: '', password: '', confirmPassword: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await login({ email: form.email, password: form.password, role: form.role })
      if (response.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#f3f7ff]">
      <Navbar />
      <div className="section-shell flex min-h-[calc(100vh-80px)] items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_24px_68px_rgba(20,43,74,0.08)]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#142b4a] text-white">
              <BookOpenText className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-black tracking-[-0.06em] text-[#142b4a]">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to continue your reading journey.</p>
          </div>

          {resetState.mode === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" placeholder="student@booknest.com" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" placeholder="••••••••" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Role</label>
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white">
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#142b4a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#203a67] disabled:opacity-60">
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
            </form>
          ) : resetState.mode === 'request-reset' ? (
            <form
              onSubmit={async (event) => {
                event.preventDefault()
                setError('')
                try {
                  await forgotPasswordRequest(resetState.email)
                  setResetState({ ...resetState, mode: 'reset-token' })
                } catch (err) {
                  setError(err.message || 'Unable to send reset instructions.')
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email to reset</label>
                <input type="email" value={resetState.email} onChange={(event) => setResetState({ ...resetState, email: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" placeholder="name@college.edu" required />
              </div>
              {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <button type="submit" className="w-full rounded-full bg-[#142b4a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#203a67]">Send reset link</button>
            </form>
          ) : (
            <form
              onSubmit={async (event) => {
                event.preventDefault()
                setError('')
                try {
                  await resetPasswordRequest({
                    token: resetState.token,
                    password: resetState.password,
                    confirmPassword: resetState.confirmPassword,
                  })
                  setResetState({ mode: 'login', email: '', token: '', password: '', confirmPassword: '' })
                  setError('Password reset successful. You can now log in.')
                } catch (err) {
                  setError(err.message || 'Unable to reset password.')
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Reset token</label>
                <input type="text" value={resetState.token} onChange={(event) => setResetState({ ...resetState, token: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" placeholder="paste token" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
                <input type="password" value={resetState.password} onChange={(event) => setResetState({ ...resetState, password: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
                <input type="password" value={resetState.confirmPassword} onChange={(event) => setResetState({ ...resetState, confirmPassword: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" required />
              </div>
              {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
              <button type="submit" className="w-full rounded-full bg-[#142b4a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#203a67]">Reset password</button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-500">
            Need an account? <Link to="/register" className="font-semibold text-[#356ae6]">Create one</Link>
          </div>

          {resetState.mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setResetState({ mode: 'request-reset', email: form.email, token: '', password: '', confirmPassword: '' })
                setError('')
              }}
              className="mt-3 block w-full text-center text-sm font-semibold text-[#356ae6]"
            >
              Forgot password?
            </button>
          )}

          {resetState.mode !== 'login' && (
            <button
              type="button"
              onClick={() => setResetState({ mode: 'login', email: '', token: '', password: '', confirmPassword: '' })}
              className="mt-3 block w-full text-center text-sm font-semibold text-[#356ae6]"
            >
              Back to login
            </button>
          )}

          <div className="mt-6 rounded-2xl bg-[#f3f7ff] p-4 text-xs text-slate-600">
            Secure seed credentials: admin@booknest.com / admin123 or register a student account.
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    studentId: '',
    phone: '',
    department: '',
    yearOfStudy: '1',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await register(form)
      navigate('/student/dashboard')
    } catch (err) {
      setError(err.message || 'Account creation failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#f3f7ff]">
      <Navbar />
      <div className="section-shell flex min-h-[calc(100vh-80px)] items-center justify-center py-12">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_24px_68px_rgba(20,43,74,0.08)]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#142b4a] text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-black tracking-[-0.06em] text-[#142b4a]">Create your free account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input type="text" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Student ID</label>
              <input type="text" value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
                <input type="text" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Year</label>
                <select value={form.yearOfStudy} onChange={(event) => setForm({ ...form, yearOfStudy: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white">
                  {[1,2,3,4].map((year) => (<option key={year} value={year}>{year}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
              <input type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#356ae6] focus:bg-white" required />
            </div>
            {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#142b4a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#203a67] disabled:opacity-60">{isSubmitting ? 'Creating account...' : 'Create account'}</button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-[#356ae6]">Login</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { user } = useAuth()

  const cards = [
    { label: 'Total borrowings', value: '1,287', subtitle: 'Across 24 categories' },
    { label: 'Pending returns', value: '184', subtitle: 'Due in the next 7 days' },
    { label: 'Active students', value: '4,320', subtitle: 'Across 18 departments' },
  ]

  const activity = [
    'New arrivals added this week: 24 titles',
    'Fines collected this month: ₹8,940',
    'Most borrowed category: Computer Science',
  ]

  return (
    <div>
      <Navbar />
      <div className="section-shell py-12">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#356ae6]">Admin dashboard</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.07em] text-[#142b4a]">Welcome, {user?.name || 'Admin'}</h1>
          </div>
          <div className="rounded-full bg-[#f3f7ff] px-4 py-2 text-sm font-semibold text-[#356ae6]">Library status: healthy</div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-black text-[#142b4a]">{card.value}</p>
              <p className="mt-2 text-sm text-slate-500">{card.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
            <h2 className="text-2xl font-black tracking-[-0.06em] text-[#142b4a]">Operational overview</h2>
            <div className="mt-5 space-y-4">
              {activity.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#f3f7ff] px-4 py-3 text-sm text-slate-700">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#356ae6]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
            <h2 className="text-2xl font-black tracking-[-0.06em] text-[#142b4a]">Quick actions</h2>
            <div className="mt-5 space-y-3">
              {['Add books', 'Review fines', 'Manage reservations', 'Send reminders'].map((action) => (
                <button key={action} type="button" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-[#356ae6] hover:text-[#356ae6]">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StudentDashboard() {
  const { user, borrowedBooks, updateReadingProgress } = useAuth()

  const averageProgress = borrowedBooks.length
    ? Math.round(borrowedBooks.reduce((sum, book) => sum + Number(book.progress || 0), 0) / borrowedBooks.length)
    : 0

  const dueSoon = borrowedBooks.filter((book) => {
    const daysLeft = Math.ceil((new Date(book.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 7
  }).length

  return (
    <div>
      <Navbar />
      <div className="section-shell py-12">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#356ae6]">Student dashboard</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.07em] text-[#142b4a]">Welcome back, {user?.name || 'Student'}</h1>
          </div>
          <Link to="/books" className="inline-flex items-center gap-2 rounded-full bg-[#142b4a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#203a67]">
            Browse books
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
            <p className="text-sm text-slate-500">Books borrowed</p>
            <p className="mt-3 text-3xl font-black text-[#142b4a]">{borrowedBooks.length}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
            <p className="text-sm text-slate-500">Due soon</p>
            <p className="mt-3 text-3xl font-black text-[#142b4a]">{dueSoon}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
            <p className="text-sm text-slate-500">Reading progress</p>
            <p className="mt-3 text-3xl font-black text-[#142b4a]">{averageProgress}%</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
            <p className="text-sm text-slate-500">Fines due</p>
            <p className="mt-3 text-3xl font-black text-[#142b4a]">₹0</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-[-0.06em] text-[#142b4a]">My reading journey</h2>
              <span className="rounded-full bg-[#f3f7ff] px-3 py-1 text-xs font-semibold text-[#356ae6]">Live tracking</span>
            </div>

            <div className="space-y-5">
              {borrowedBooks.map((book) => (
                <div key={book.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <img src={book.cover} alt={book.title} className="h-28 w-20 rounded-xl object-cover shadow-sm" />
                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-bold text-[#142b4a]">{book.title}</p>
                          <p className="text-sm text-slate-500">{book.author}</p>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#356ae6]">Due {new Date(book.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>

                      <div className="mt-3">
                        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                          <span>Progress</span>
                          <span>{Number(book.progress || 0)}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-[#356ae6]" style={{ width: `${book.progress}%` }} />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={Number(book.progress || 0)}
                          onChange={(event) => updateReadingProgress(book.id, Number(event.target.value))}
                          className="w-full accent-[#356ae6]"
                          aria-label={`Update reading progress for ${book.title}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
              <h2 className="text-2xl font-black tracking-[-0.06em] text-[#142b4a]">Quick actions</h2>
              <div className="mt-5 space-y-3">
                <Link to="/books" className="flex items-center justify-between rounded-2xl bg-[#f3f7ff] px-4 py-3 text-sm font-semibold text-[#142b4a]">
                  Explore more books
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <button type="button" className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  View borrowing history
                  <Clock3 className="h-4 w-4" />
                </button>
                <button type="button" className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                  Renew due books
                  <CalendarClock className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(20,43,74,0.04)]">
              <h2 className="text-2xl font-black tracking-[-0.06em] text-[#142b4a]">Upcoming reminders</h2>
              <div className="mt-5 space-y-3">
                {borrowedBooks.slice(0, 3).map((book) => (
                  <div key={`${book.id}-reminder`} className="flex items-start gap-3 rounded-2xl bg-[#f3f7ff] p-3">
                    <BellRing className="mt-0.5 h-4 w-4 text-[#356ae6]" />
                    <div>
                      <p className="text-sm font-semibold text-[#142b4a]">{book.title}</p>
                      <p className="text-xs text-slate-500">Due {new Date(book.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/books" element={<CatalogPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
