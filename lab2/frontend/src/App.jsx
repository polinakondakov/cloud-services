
import { useEffect, useState } from 'react'
import './App.css'

function App() { 
  const [buckets, setBuckets] = useState([]) // создание состояния в котором сначала пустой список бакетов
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

  async function loadBuckets() { // функция получения бакетов
    try {
      const response = await checkResponse(await fetch('/buckets')) // отпправляем get запрос, который попадает в fast api
      const data = await response.json() // fast api возвращает json
      setBuckets(data.buckets) // обновляем состояние react
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function createBucket() { // создание бакета
    if (!bucketName.trim()) return

    try {
      await checkResponse(await fetch(
        `/buckets/${encodeURIComponent(bucketName.trim())}`, // формирование адреса
        { method: 'POST' } // отправляем запрос
      ))

      setBucketName('')
      setMessage('Бакет создан')
      await loadBuckets() // вызывается получение списка бакетов 
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function deleteBucket(name) {
    if (!window.confirm(`Удалить бакет ${name}?`)) return // подтверждение удаления

    try {
      await checkResponse(await fetch(
        `/buckets/${encodeURIComponent(name)}`,
        { method: 'DELETE' } // отправка запроса
      ))

      if (selectedBucket === name) { // очистка выбранного бакета
        setSelectedBucket('') // сбрасываем выбранный бакет
        setFiles([]) // очищаем список файлов на странице
        setFileContent('') // убираем показанное содержимое текстового файла.
      }

      setMessage('Бакет удалён')
      await loadBuckets()
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function loadFiles(bucket) { // получение списка файлов
    try {
      const response = await checkResponse(await fetch(
        `/buckets/${encodeURIComponent(bucket)}/files` // формируется гет запрос
        // в fast api вызывается list_files
      ))
      const data = await response.json() // получение списка файлов
      setFiles(data.files) // сохранение полученного массива
    } catch (error) {
      setMessage(error.message)
    }
  }

  function selectBucket(name) { // выбор бакета
    setSelectedBucket(name) // какой бакет выбрал пользователь
    setFiles([]) // очищаем предыдущиц список файлов
    setFileContent('') // убираем содержимое ранее открытого файла
    setImageUrl('') // Убираем содержимое ранее открытого текстового файла
    setSelectedFile(null) // Сбрасываем выбранный для загрузки файл
    loadFiles(name) // Запрашиваем список файлов нового бакета
  }

  async function uploadFile() { // загрузка файлов
    if (!selectedBucket || !selectedFile) {
      setMessage('Выберите бакет и файл')
      return
    }

    const formData = new FormData() // объект JS лля формирования данных которые отправляются на сервер
    formData.append('file', selectedFile) // добавляем файл в форму

    try {
      await checkResponse(await fetch(
        `/buckets/${encodeURIComponent(selectedBucket)}/files`,
        {
          method: 'POST',
          body: formData
        } // запрос на отправку файла
      ))

      setMessage('Файл загружен')
      setSelectedFile(null) // Сбрасываем выбранный файл.
      document.getElementById('fileInput').value = '' // Очищаем HTML-поле выбора файла
      await loadFiles(selectedBucket) // запрашиваем список файлов чтоб новый файл появился
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function viewFile(name) { // просмотр файлов
  try {
    const response = await checkResponse(await fetch(
      `/buckets/${encodeURIComponent(selectedBucket)}/files/${encodeURIComponent(name)}`
    )) // формирование get запроса

    // FastAPI принимает запрос, вызывает get_file(), получает данные из VK Cloud и отправляет их обратно в React
    const blob = await response.blob() // объект который представляет набор данных, содержимое файла
    const extension = name.split('.').pop().toLowerCase() // определение расширения

    // обработка текста и картинок остальное скачиваем
    if (extension === 'txt') {
      setImageUrl('')
      setFileContent(await blob.text())
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      setFileContent('')
      setImageUrl(URL.createObjectURL(blob)) // временный адрес, по которому браузер может обращаться к уже полученным данным
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

  async function deleteFile(name) { // удаление файла
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

  // автоматически загрузить список бакетов при открытии страницы
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
