
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [buckets, setBuckets] = useState([])
  const [bucketName, setBucketName] = useState('')
  const [selectedBucket, setSelectedBucket] = useState('')
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [message, setMessage] = useState('')

  async function checkResponse(response) {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.detail || 'Ошибка запроса')
    }
    return response
  }

  async function loadBuckets() {
    try {
      const response = await checkResponse(await fetch('/buckets'))
      const data = await response.json()
      setBuckets(data.buckets)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function createBucket() {
    if (!bucketName.trim()) return

    try {
      await checkResponse(await fetch(
        `/buckets/${encodeURIComponent(bucketName.trim())}`,
        { method: 'POST' }
      ))

      setBucketName('')
      setMessage('Бакет создан')
      await loadBuckets()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function deleteBucket(name) {
    if (!window.confirm(`Удалить бакет ${name}?`)) return

    try {
      await checkResponse(await fetch(
        `/buckets/${encodeURIComponent(name)}`,
        { method: 'DELETE' }
      ))

      if (selectedBucket === name) {
        setSelectedBucket('')
        setFiles([])
        setFileContent('')
      }

      setMessage('Бакет удалён')
      await loadBuckets()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function loadFiles(bucket) {
    try {
      const response = await checkResponse(await fetch(
        `/buckets/${encodeURIComponent(bucket)}/files`
      ))
      const data = await response.json()
      setFiles(data.files)
    } catch (error) {
      setMessage(error.message)
    }
  }

  function selectBucket(name) {
    setSelectedBucket(name)
    setFiles([])
    setFileContent('')
    setImageUrl('')
    setSelectedFile(null)
    loadFiles(name)
  }

  async function uploadFile() {
    if (!selectedBucket || !selectedFile) {
      setMessage('Выберите бакет и файл')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      await checkResponse(await fetch(
        `/buckets/${encodeURIComponent(selectedBucket)}/files`,
        {
          method: 'POST',
          body: formData
        }
      ))

      setMessage('Файл загружен')
      setSelectedFile(null)
      document.getElementById('fileInput').value = ''
      await loadFiles(selectedBucket)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function viewFile(name) {
  try {
    const response = await checkResponse(await fetch(
      `/buckets/${encodeURIComponent(selectedBucket)}/files/${encodeURIComponent(name)}`
    ))

    const blob = await response.blob()
    const extension = name.split('.').pop().toLowerCase()

    if (extension === 'txt') {
      setImageUrl('')
      setFileContent(await blob.text())
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      setFileContent('')
      setImageUrl(URL.createObjectURL(blob))
    } else {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  } catch (error) {
    setMessage(error.message)
  }
}

  async function deleteFile(name) {
    if (!window.confirm(`Удалить файл ${name}?`)) return

    try {
      await checkResponse(await fetch(
        `/buckets/${encodeURIComponent(selectedBucket)}/files/${encodeURIComponent(name)}`,
        { method: 'DELETE' }
      ))

      setMessage('Файл удалён')
      setFileContent('')
      await loadFiles(selectedBucket)
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    loadBuckets()
  }, [])

  return (
    <div>
      <h1>Лабораторная работа №2</h1>
      <h2>Управление S3-хранилищем</h2>

      <h3>Бакеты</h3>

      <input
        placeholder="Название бакета"
        value={bucketName}
        onChange={e => setBucketName(e.target.value)}
      />

      <button onClick={createBucket}>Создать бакет</button>
      <button onClick={loadBuckets}>Обновить</button>

      <ul>
        {buckets.map(name => (
          <li key={name}>
            <button onClick={() => selectBucket(name)}>
              {name}
            </button>
            <button onClick={() => deleteBucket(name)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>

      {selectedBucket && (
        <div>
          <h3>Файлы в бакете: {selectedBucket}</h3>

          <input
            id="fileInput"
            type="file"
            onChange={e => setSelectedFile(e.target.files[0] || null)}
          />

          <button onClick={uploadFile}>Загрузить файл</button>
          <button onClick={() => loadFiles(selectedBucket)}>
            Обновить список
          </button>

          <ul>
            {files.map(name => (
              <li key={name}>
                {name}{' '}
                <button onClick={() => viewFile(name)}>
                  Открыть
                </button>
                <button onClick={() => deleteFile(name)}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>

          {(fileContent || imageUrl) && (
  <div>
    <h4>Просмотр файла</h4>

    {fileContent && <pre>{fileContent}</pre>}

    {imageUrl && (
      <img
        src={imageUrl}
        alt="Изображение из S3"
        style={{ maxWidth: '100%', maxHeight: '500px' }}
      />
    )}

    <br />

    <button onClick={() => {
      setFileContent('')
      setImageUrl('')
    }}>
      Закрыть
    </button>
  </div>
)}
        </div>
      )}

      <p>{message}</p>
    </div>
  )
}

export default App
