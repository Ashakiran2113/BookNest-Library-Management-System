const DEFAULT_BASE_URL = 'http://localhost:4000/api'

const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_LIBRARY_API_BASE_URL || DEFAULT_BASE_URL
  return configured.replace(/\/$/, '')
}

const getAuthToken = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('booknest-auth') || 'null')
    return saved?.token || ''
  } catch {
    return ''
  }
}

const requestJson = async (path, options = {}) => {
  const baseUrl = getApiBaseUrl()
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }

  const token = getAuthToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  })

  const responseBody = await response.clone().json().catch(() => ({}))

  if (!response.ok) {
    const message = responseBody?.message || responseBody?.error || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return responseBody.data !== undefined ? responseBody.data : responseBody
}

export const fetchPublicStats = async () => {
  const data = await requestJson('/public/stats')
  return {
    totalBooks: Number(data?.totalBooks ?? 0),
    registeredStudents: Number(data?.registeredStudents ?? 0),
    booksBorrowed: Number(data?.booksBorrowed ?? 0),
    availableBooks: Number(data?.availableBooks ?? 0),
  }
}

export const fetchFeaturedBooks = async () => {
  const books = await requestJson('/books')
  const list = Array.isArray(books) ? books : books?.data || []

  return list.map((book, index) => ({
    id: book.id ?? book._id ?? `${book.title ?? 'book'}-${index}`,
    title: book.title ?? 'Untitled Book',
    author: book.author ?? 'Unknown Author',
    category: book.category ?? book.genre ?? 'General',
    availability: book.availability ?? (book.availableCopies > 0 ? 'Available' : 'Borrowed'),
    cover: book.cover ?? book.image ?? book.thumbnail ?? 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    description: book.description ?? 'A valuable title in our digital library collection.',
  }))
}

export const fetchBookCatalog = async () => {
  const books = await requestJson('/books')
  const list = Array.isArray(books) ? books : books?.data || []

  return list.map((book, index) => ({
    id: book.id ?? book._id ?? `${book.title ?? 'book'}-${index}`,
    title: book.title ?? 'Untitled Book',
    author: book.author ?? 'Unknown Author',
    category: book.category ?? book.genre ?? 'General',
    availability: book.availability ?? (book.availableCopies > 0 ? 'Available' : 'Borrowed'),
    cover: book.cover ?? book.image ?? book.thumbnail ?? 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    description: book.description ?? 'A valuable title in our digital library collection.',
  }))
}

export const loginRequest = async ({ email, password, role }) => {
  const payload = await requestJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  })

  return {
    token: payload?.token || '',
    name: payload?.user?.full_name || payload?.user?.name || payload?.name || 'BookNest User',
    email: payload?.user?.email || email,
    role: payload?.user?.role_name || payload?.user?.role || role || 'student',
    ...payload,
  }
}

export const registerRequest = async ({ fullName, email, studentId, phone, department, yearOfStudy, password, confirmPassword }) => {
  const payload = await requestJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName,
      email,
      studentId,
      phone,
      department,
      yearOfStudy,
      password,
      confirmPassword,
      role: 'student',
    }),
  })

  return {
    token: payload?.token || '',
    name: payload?.user?.full_name || fullName,
    email: payload?.user?.email || email,
    role: payload?.user?.role_name || payload?.user?.role || 'student',
    ...payload,
  }
}

export const forgotPasswordRequest = async (email) => {
  return requestJson('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export const resetPasswordRequest = async ({ token, password, confirmPassword }) => {
  return requestJson('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password, confirmPassword }),
  })
}

export const fetchStudentDashboard = async () => {
  return requestJson('/dashboard/student')
}

export const fetchAdminDashboard = async () => {
  return requestJson('/dashboard/admin')
}

export const borrowBookRequest = async (bookId) => {
  return requestJson(`/books/${bookId}/borrow`, {
    method: 'POST',
  })
}

export const returnBookRequest = async (bookId) => {
  return requestJson(`/books/${bookId}/return`, {
    method: 'POST',
  })
}

export const getCurrentUser = async () => {
  return requestJson('/auth/me')
}
