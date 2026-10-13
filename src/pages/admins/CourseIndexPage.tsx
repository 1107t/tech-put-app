import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import Modal from '../../components/admin/Modal'
import { adminLogout, getCurrentAdmin, type Admin } from '../../lib/adminApi'
import { getApiErrorMessage } from '../../lib/api'
import { getCourses, type Course, NewCourse, updateCourse, DeletCourse } from '../../lib/courseApi'
import '../../styles/pages/courses.css'

export default function CourseIndexPage() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [saving, setSaving] = useState(false)
  const [createError, setCreateError] = useState('')
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editName, setEditName] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const deleteInProgress = useRef(false)

  function openEditModal(course: Course) {
    setEditingCourse(course)
    setEditName(course.name)
    setEditError('')
  }

  function closeEditModal() {
    if (!editSaving) setEditingCourse(null)
  }

  async function handleUpdateCourse() {
    if (!editingCourse || editSaving) return
    if (!editName.trim()) {
      setEditError('コース名を入力してください')
      return
    }
    setEditSaving(true)
    setEditError('')
    try {
      await updateCourse(editingCourse.id, editName)
      setEditingCourse(null)
      setReload(previous => previous + 1)
    } catch (err) {
      setEditError(getApiErrorMessage(err, 'コース名の更新に失敗しました。'))
    } finally {
      setEditSaving(false)
    }
  }

  const deleteCourse = async(id: string) => {
    if (deleteInProgress.current) return
    const course = courses.find(item => item.id === id)
    if (!window.confirm(`「${course?.name ?? 'このコース'}」を本当に削除してよいですか？`)) return
    deleteInProgress.current = true
    setDeletingId(id)
    setDeleteError('')
    try {
      await DeletCourse(id)
      setReload(previous => previous + 1)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'コースの削除に失敗しました。'))
    } finally {
      deleteInProgress.current = false
      setDeletingId(null)
    }
  }


  function openCreateModal() {
    setCourseName('')
    setCreateError('')
    setShowCreateModal(true)
  }

  function closeCreateModal() {
    if (!saving) setShowCreateModal(false)
  }

  async function handleCreateCourse() {
    if (saving) return
    if (!courseName.trim()) {
      setCreateError('コース名を入力してください')
      return
    }
    setSaving(true)
    setCreateError('')
    try {
      await NewCourse(courseName)
      setShowCreateModal(false)
      setCourseName('')
      // reloadの変更で、既存のuseEffectが一覧を再取得する。
      setReload(previous => previous + 1)
    } catch (err) {
      setCreateError(getApiErrorMessage(err, 'コースの作成に失敗しました。'))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    async function loadCourses() {
      try {
        const currentAdmin = await getCurrentAdmin()
        if (cancelled) return
        if (!currentAdmin) {
          navigate('/admin/login', { replace: true })
          return
        }
        setAdmin(currentAdmin)
        const data = await getCourses()
        if (!cancelled) setCourses(data)
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'コースを取得できませんでした。'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void loadCourses()
    return () => { cancelled = true }
  }, [navigate, reload])

  async function handleLogout() {
    await adminLogout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <AdminLayout admin={admin} onLogout={handleLogout} headerTitle="コース一覧">

      <section className="course-index" aria-labelledby="course-index-title">
        <div className="course-index__heading">
          <div>
            <h1 id="course-index-title">コース一覧</h1>
            <p>学習コースを一覧で確認できます。</p>
          </div>
          <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          ＋ コースを新規作成
        </button>
        </div>
        {deleteError && <p className="text-danger" role="alert">{deleteError}</p>}
        {loading ? (
          <p role="status">コースを読み込み中です…</p>
        ) : error ? (
          <div role="alert" className="course-index__error">
            <p>{error}</p>
            <button type="button" onClick={() => setReload(value => value + 1)}>再読み込み</button>
          </div>
        ) : courses.length === 0 ? (
          <div className="course-index__empty">コースはまだ登録されていません。</div>
        ) : (
          <ul className="course-index__list">
            {courses.map(course => (
              <li key={course.id} className="course-index__card">
                <h2>{course.name}</h2>
                <div className="course-index__actions">
                  <button type="button" className="text-info-emphasis fw-bold" onClick={() => openEditModal(course)}>コース名を編集</button>
                  <button type="button" className="course-index__delete fw-bold" disabled={deletingId !== null} onClick={()=>deleteCourse(course.id)}>
                    {deletingId === course.id ? '削除中…' : 'コースを削除'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="コースを新規作成"
        titleId="course-create-title"
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={closeCreateModal} disabled={saving}>
              キャンセル
            </button>
            <button type="button" className="btn btn-primary" disabled={saving}
            onClick={handleCreateCourse}
            >
              {saving ? '作成中…' : '作成する'}
            </button>
          </>
        }
      >
        <div>
          <label htmlFor="course-name" className="form-label fw-semibold">
            コース名 <span className="text-danger">必須</span>
          </label>
          <input
            id="course-name"
            className="form-control"
            type="text"
            value={courseName}
            onChange={event => setCourseName(event.target.value)}
            placeholder="例：Web制作 基礎コース"
            required
            maxLength={255}
            disabled={saving}
            aria-invalid={!!createError}
            aria-describedby="course-create-help"
          />
          <p id="course-create-help" className="text-muted small mt-2 mb-0">
            コース名を入力して「作成する」を押してください。
          </p>
          {createError && <p className="text-danger mt-2 mb-0" role="alert">{createError}</p>}
        </div>
      </Modal>
      <Modal
        isOpen={editingCourse !== null}
        onClose={closeEditModal}
        title="コース名を編集"
        titleId="course-edit-title"
        footer={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={closeEditModal} disabled={editSaving}>キャンセル</button>
            <button type="submit" form="course-edit-form" className="btn btn-primary" disabled={editSaving}>
              {editSaving ? '保存中…' : '保存する'}
            </button>
          </>
        }
      >
        <form id="course-edit-form" onSubmit={event => { event.preventDefault(); void handleUpdateCourse() }}>
          <label htmlFor="course-edit-name" className="form-label fw-semibold">コース名 <span className="text-danger">必須</span></label>
          <input
            id="course-edit-name"
            className="form-control"
            value={editName}
            onChange={event => setEditName(event.currentTarget.value)}
            onFocus={event => event.currentTarget.select()}
            required
            maxLength={255}
            disabled={editSaving}
            aria-invalid={!!editError}
            aria-describedby={editError ? 'course-edit-error' : undefined}
          />
          {editError && <p id="course-edit-error" className="text-danger mt-2 mb-0" role="alert">{editError}</p>}
        </form>
      </Modal>
    </AdminLayout>
  )
}
